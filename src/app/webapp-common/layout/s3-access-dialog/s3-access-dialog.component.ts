import {Component, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {AdminService} from '../../../features/admin/admin.service';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {EventEmitter} from '@angular/core';

@Component({
  selector   : 'sm-s3-access-dialog',
  templateUrl: './s3-access-dialog.component.html',
  styleUrls  : ['./s3-access-dialog.component.scss']
})
export class S3AccessDialogComponent implements OnChanges {
  public S3Form: FormGroup;
  @Input() isAzure;
  @Input() key;
  @Input() secret                          = '';
  @Input() region                          = '';
  @Input() bucket;
  @Input() endpoint;
  @Input() useSSL: boolean;
  @Input() editMode                        = false;
  @Input() header;
  @Output() closeCancel: EventEmitter<any> = new EventEmitter();
  @Output() closeSave: EventEmitter<any>   = new EventEmitter<any>();
  @Input() saveEnabled = true;

  constructor(public adminService: AdminService, private formBuilder: FormBuilder) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      this.buildS3Form();
    }
  }

  private buildS3Form() {
    this.S3Form = this.formBuilder.group({
      Key     : this.isAzure ? 'azure' : this.key,
      Secret  : this.secret,
      Region  : this.region,
      Bucket  : this.bucket,
      Endpoint: this.endpoint,
      useSSL  : this.useSSL,
    });
  }
  get S3Key() {
    return this.S3Form.get('Key') as FormControl;
  }
  get S3Secret() {
    return this.S3Form.get('Secret') as FormControl;
  }

  public saveNewCredentials() {
    this.markControlsAsTouched();
    this.S3Form.updateValueAndValidity();
    if (this.S3Form.invalid) {
      return false;
    } else {
      this.closeSave.emit(this.S3Form.value);
    }
    this.buildS3Form();
  }

  public cancel() {
    this.closeCancel.emit(this.S3Form.value);
  }

  markControlsAsTouched() {
    const controls = this.S3Form.controls;
    for (const i of Object.keys(controls)) {
      controls[i].markAsTouched();
    }
  }

  toggleSSL() {
    this.useSSL = !this.useSSL;
    this.buildS3Form();
  }
}
