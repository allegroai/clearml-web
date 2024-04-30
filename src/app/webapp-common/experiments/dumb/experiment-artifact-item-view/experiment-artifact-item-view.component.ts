import {ChangeDetectionStrategy, Component, Input, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import {Artifact} from '~/business-logic/model/tasks/artifact';
import {BaseClickableArtifactComponent} from '../base-clickable-artifact.component';
import {fileSizeConfigStorage} from '@common/shared/pipes/filesize.pipe';
import { ApiTasksService } from '~/business-logic/api-services/tasks.service';
import { ConfirmDialogComponent } from '@common/shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import { take } from 'rxjs/operators';
import { addMessage } from '@common/core/actions/layout.actions';
import { Observable } from 'rxjs/internal/Observable';
import { IExperimentInfo } from '~/features/experiments/shared/experiment-info.model';
import { selectExperimentInfoData } from '~/features/experiments/reducers';
import { ArtifactId } from '~/business-logic/model/tasks/artifactId';
import { deleteS3Sources } from '@common/shared/entity-page/entity-delete/common-delete-dialog.actions';
import { EXPERIMENTS_STATUS_LABELS } from '~/features/experiments/shared/experiments.const';

@Component({
  selector: 'sm-experiment-artifact-item-view',
  templateUrl: './experiment-artifact-item-view.component.html',
  styleUrls: ['./experiment-artifact-item-view.component.scss'],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentArtifactItemViewComponent extends BaseClickableArtifactComponent{
  public isLocalFile: boolean;
  public isLinkable: boolean;
  public fileSizeConfigStorage = fileSizeConfigStorage;
  public inMemorySize: boolean;
  public experimentInfo$: Observable<IExperimentInfo>;
  private _artifact: Artifact;
  private artifactId: ArtifactId;
  private _experiment: any;

  @Input() editable: boolean;
  @Input() downloading: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogComponent,
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    private dialog: MatDialog,
    private tasksApi: ApiTasksService,
  ){
    super();
    this.experimentInfo$ = this.store.select(selectExperimentInfoData);
    this.artifactId = {key: '', mode: 'output'};
    this.experimentInfo$.subscribe((res) => {
      this._experiment = res;
    });
  }

  @Input() set artifact(artifact: Artifact) {
    this._artifact = artifact;
    if(artifact){
      this.timestamp = artifact.timestamp;
      this.inMemorySize = Number.isInteger(artifact?.content_size) && artifact.content_size < 500 * 1e6;
      this.isLocalFile = artifact.uri && this.adminService.isLocalFile(artifact.uri);
      try {
        if (artifact?.uri && !this.isLocalFile && new URL(this.artifact.uri)) {
          this.isLinkable = true;
        }
      } catch {
        this.isLinkable = false;
      }
    }
  }

  get artifact(): Artifact {
    return this._artifact;
  }

  getStatusLabel() {
    return EXPERIMENTS_STATUS_LABELS[this._experiment?.status] || '';
  }

  enableDeleteButton() {
    return this.getStatusLabel() === 'Draft';
  }

  linkClicked(event: Event) {
    this.signUrl(this.artifact.uri).subscribe(signed => {
      const a = document.createElement('a');
      a.href = signed;
      a.target = '_blank';
      a.click();
    });
    event.preventDefault();
  }

  deleteArtifact(key, mode) {
    this.artifactId = {key: key, mode: mode};
    const confirmDialogRef: MatDialogRef<any, boolean> = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Artifact',
        body: 'Are you sure you want to delete artifact ' + key + ' from the experiment and S3?<br /><strong>This cannot be undone.</strong>',
        yes: 'Delete',
        no: 'Cancel',
        iconClass: 'al-icon al-ico-trash al-color blue-300',
      }
    });

    confirmDialogRef.afterClosed().pipe(take(1)).subscribe((confirmed) => {
      if (confirmed) {
        this.tasksApi.tasksDeleteArtifacts({
          /* eslint-disable @typescript-eslint/naming-convention */
          task: this._experiment.id,
          artifacts: [this.artifactId]
          /* eslint-enable @typescript-eslint/naming-convention */
        }, null, 'body', true).subscribe({
          next: () => {
            this.store.dispatch(deleteS3Sources({files: [this.artifact.uri]}))
          },
          error: err => this.store.dispatch(addMessage('error', `Error ${err.error?.meta?.result_msg}`)),
          complete: () => this.store.dispatch(addMessage('success', 'Artifact deleted successfully.')),
        });
      }
    });
  }
}
