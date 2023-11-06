import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {ISelectedExperiment} from '~/features/experiments/shared/experiment-info.model';

@Component({
  selector: 'sm-abort-controller-dialog',
  templateUrl: './abort-controller-dialog.component.html',
  styleUrls: ['./abort-controller-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AbortControllerDialogComponent {
  public experiments: ISelectedExperiment[];
  shouldBeAbortedTasks: ISelectedExperiment[] = null;

  constructor(
    private store: Store,
    public dialogRef: MatDialogRef<AbortControllerDialogComponent>,
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
