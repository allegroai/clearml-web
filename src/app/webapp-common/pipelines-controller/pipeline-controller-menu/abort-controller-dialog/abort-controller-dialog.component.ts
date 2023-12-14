import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {ISelectedExperiment} from '~/features/experiments/shared/experiment-info.model';
import {ITableExperiment} from '@common/experiments/shared/common-experiment-model.model';

@Component({
  selector: 'sm-abort-controller-dialog',
  templateUrl: './abort-controller-dialog.component.html',
  styleUrls: ['./abort-controller-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AbortControllerDialogComponent {
  public experiments: ISelectedExperiment[];
  shouldBeAbortedTasks: ITableExperiment[] = null;

  constructor(
    private store: Store<any>, public dialogRef: MatDialogRef<AbortControllerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: {
      tasks: ISelectedExperiment[];
      shouldBeAbortedTasks: ISelectedExperiment[];
    }
  ) {
    this.experiments = data.tasks;
    this.shouldBeAbortedTasks = data.shouldBeAbortedTasks;

  }

  closeDialog(isConfirmed) {
    if (isConfirmed) {
      this.dialogRef.close({shouldBeAbortedTasks: this.shouldBeAbortedTasks});
    } else {
      this.dialogRef.close(null);
    }
  }
}
