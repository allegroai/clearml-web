import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {ISelectedExperiment} from '~/features/experiments/shared/experiment-info.model';

@Component({
  selector: 'sm-abort-controller-dialog',
  templateUrl: './abort-controller-dialog.component.html',
  styleUrls: ['./abort-controller-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AbortControllerDialogComponent {
      public dialogRef = inject<MatDialogRef<AbortControllerDialogComponent>>(MatDialogRef<AbortControllerDialogComponent>);
  public experiments: ISelectedExperiment[];
  shouldBeAbortedTasks: ISelectedExperiment[] = null;

  constructor() {
    const data = inject<{
      tasks: ISelectedExperiment[];
      shouldBeAbortedTasks: ISelectedExperiment[];
    }>(MAT_DIALOG_DATA);

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
