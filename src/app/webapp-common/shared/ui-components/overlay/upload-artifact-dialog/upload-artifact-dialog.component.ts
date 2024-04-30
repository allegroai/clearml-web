import { Component, Inject, Input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { addMessage } from '@common/core/actions/layout.actions';
import { UploadArtifactDialogConfig, ArtifactType } from './upload-artifact-dialog.model';
import { ApiTasksService } from '~/business-logic/api-services/tasks.service';
import { Artifact } from '~/business-logic/model/tasks/artifact';
import { IExecutionForm } from '~/features/experiments/shared/experiment-execution.model';
import { Sha256 } from '@aws-crypto/sha256-browser';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription, filter, map, take } from 'rxjs';
import { selectSignedUrl } from '@common/core/reducers/common-auth-reducer';
import { getSignedUrl } from '@common/core/actions/common-auth.actions';
import { selectExperimentExecutionInfoData } from '@common/experiments/reducers';
import { ArtifactModeEnum } from '~/business-logic/model/tasks/artifactModeEnum';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { DialogTemplateComponent } from '@common/shared/ui-components/overlay/dialog-template/dialog-template.component';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SafePipe } from '@common/shared/pipes/safe.pipe';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'sm-upload-artifact-dialog',
  templateUrl: './upload-artifact-dialog.component.html',
  styleUrls: ['./upload-artifact-dialog.component.scss'],
  standalone: true,
  imports: [
    SafePipe,
    FormsModule,
    ReactiveFormsModule,
    DialogTemplateComponent,
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
  ]
})
export class UploadArtifactDialogComponent implements OnInit, OnDestroy {
  artifactType: ArtifactType[] = [
    {value: 'input-model', viewValue: 'Input Model'},
    {value: 'output-model', viewValue: 'Output Model'},
    {value: 'data-audit', viewValue: 'Data Audit'},
    {value: 'other', viewValue: 'Other'},
  ];
  uploadForm = new FormGroup({
    fName: new FormControl({value: '', disabled: false}, Validators.required),
    fInput: new FormControl(''),
    artType: new FormControl({value: this.artifactType[3].value, disabled: true}),
    upDest: new FormControl({value: '', disabled: false}),
    mode: new FormControl({value: 'output', disabled: false})
  });

  @Input() displayX: boolean = true;
  title: string;
  body?: string;
  task?: string;
  currentFileList?: Array<File>;
  currentFile: File;
  template?: TemplateRef<any>;
  iconClass = '';
  iconData = '';
  centerText: boolean;
  message: string;
  uploadUrl: string;
  hashList: Array<any>;
  upCount = 0;
  filesSelected: boolean = false;
  upKeys: Array<string>;

  public executionInfo$: Observable<IExecutionForm>;
  public executionData: IExecutionForm;
  private executionDataSubscription: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: UploadArtifactDialogConfig,
    public dialogRef: MatDialogRef<UploadArtifactDialogComponent>,
    private store: Store,
    private dialog: MatDialog,
    private tasksApi: ApiTasksService,
    private http: HttpClient,
  ) {
    this.executionInfo$ = this.store.select(selectExperimentExecutionInfoData);
    this.title = data.title || '';
    this.body = data.body || '';
    this.task = data.task || '';
    this.template = data.template;
    this.iconClass = data.iconClass || '';
    this.iconData = data.iconData || '';
    this.centerText = data.centerText ?? false;
  }

  ngOnInit() {
    this.executionDataSubscription = this.executionInfo$.subscribe(formData => {
      this.executionData = formData;
    });
    this.uploadUrl = this.executionData.output.destination;
    this.uploadForm.controls['upDest'].setValue(this.uploadUrl);
  }

  ngOnDestroy(): void {
    this.executionDataSubscription.unsubscribe();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  selectFiles(event: any) {
    let fileName = '';
    this.currentFileList = [];
    this.upKeys = [];
    if (event.target.files && event.target.files.length > 0) {
      this.filesSelected = true;
      for(const index in event.target.files) {
        let idx = Number(index);
        this.currentFileList[idx] = event.target.files[idx];
      }
      const finalIndex = (this.currentFileList.length - 1);
      for(const [index, element] of this.currentFileList.entries()){
        this.upKeys.push(element.name.substring(0, element.name.lastIndexOf('.')));
        fileName += element.name;
        if(finalIndex >= 1 && index !== finalIndex){
          fileName += ', ';
        }
      }
      this.createHash(this.currentFileList);
      this.uploadForm.controls['fName'].setValue(fileName);
    } else {
      this.uploadForm.controls['fName'].setValue('');
      this.uploadForm.controls['fName'].setErrors({required: true});
    }
  }

  updateName(index: number, event: any) {
    this.upKeys[index] = event.target.value;
  }

  async uploadFiles() {
    let upUrl = this.uploadForm.controls['upDest'].value;
    let signedUrl = '';

    if(this.currentFileList && upUrl) {
      if(!upUrl.endsWith('/')) {
        upUrl += '/uploaded-artifacts/';
      } else {
        upUrl += 'uploaded-artifacts/';
      } 
      this.uploadUrl = upUrl;
      for(const file of this.currentFileList) {        
        const urlToSign = this.uploadUrl + file.name;
        this.signUrl(urlToSign).subscribe({
          next: (res) => {
            signedUrl = res;
            this.upload(signedUrl, file);
          },
          error: (err) => {
            this.store.dispatch(addMessage('error', `${file.name} upload failed: ${err.error?.meta?.result_msg}`));
            throw new Error(`upload failed - sign url ${err.error?.meta?.result_msg}`);
          }
        });
      }
    } else if(this.currentFileList) {
      const confirmDialogRef: MatDialogRef<any, boolean> = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Missing S3 Bucket',
          body: 'Continue without S3 bucket storage?',
          yes: 'Continue',
          no: 'Cancel',
          iconClass: 'al-icon al-ico-question-mark al-color blue-300',
        }
      });
  
      confirmDialogRef.afterClosed().pipe(take(1)).subscribe((confirmed) => {
        if (confirmed) {
          this.updateArtifact(this.currentFileList);
        }
      });
    } else {
      this.store.dispatch(addMessage('error', 'No files selected.'));
    }
  }

  protected signUrl(url: string) {
    this.store.dispatch(getSignedUrl({url, config: {method: "PUT"}}));
    return this.store.select(selectSignedUrl(url))
      .pipe(
        map((res => res?.signed)),
        filter(signedUrl => !!signedUrl),
        take(1)
      );
  }

  protected upload(url: string, file: File) {
    let error = false;
    if(url && file) {
      this.http.request("PUT", url, {
        body: file,
        reportProgress: true,
        observe: 'events',
      }).subscribe({
        next: () => {},
        error: (err) => {
          this.store.dispatch(addMessage('error', `${file.name} upload to bucket failed with status: ${err.status}\nError body: ${err.error}\nCheck bucket credentials.`));
          throw new Error(`upload failed - http request  ${err.error}`);
        },
        complete: () => {
          this.upCount++;
          if(this.upCount === this.currentFileList.length) {
            this.updateArtifact(this.currentFileList);
          }
        }
      });
    }
  }

  updateArtifact(fileList: Array<File>) {
    let updateList: Array<Artifact> = [];
    let fileHash = '';
    let artName = '';
    for(const [index, item] of fileList.entries()) {
      const ts = (new Date().getTime())/1000.0; // Convert to seconds so the Python SDK can read it
      artName = this.upKeys[index];
      for(const hash of this.hashList) {
        if(item.name === hash.fileName) {
          fileHash = hash.fileHashHex;
        }
      }
      updateList.push({
        key: artName,
        type: this.uploadForm.controls['artType'].value,
        content_size: item.size,
        timestamp: ts,
        hash: fileHash,
        uri: this.uploadUrl + item.name,
        mode: this.uploadForm.controls['mode'].value as ArtifactModeEnum
      });
    }

    this.tasksApi.tasksAddOrUpdateArtifacts({
      task: this.task,
      artifacts: updateList,
    }, null, 'body', true).subscribe({
      next: () => {},
      error: err => this.store.dispatch(addMessage('error', `Error ${err.error?.meta?.result_msg}`)),
      complete: () => {
        this.store.dispatch(addMessage('success', 'Artifact(s) uploaded successfully.'));
        this.upCount = 0;
        this.closeDialog();
      }
    });
  }

  async createHash(fileList: File[]) {
    this.hashList = [];
    let fileBuff: ArrayBuffer;
    let fileHashSha256: any;
    let fileHashHex: any;
    const hash = new Sha256();
    for(const element of fileList){
      element.arrayBuffer().then(async buff => {
        let fileName = element.name;
        fileBuff = buff;
        hash.update(fileBuff);
        fileHashSha256 = await hash.digest();
        fileHashHex = this.createHexStr(fileHashSha256);
        this.hashList.push({fileName, fileHashHex});
      });
    }
  }

  createHexStr(arr: Uint8Array) {
    let result = '';
    for (const element of arr) {
      result += element.toString(16);
    }
    return result.toString();
  }

}
