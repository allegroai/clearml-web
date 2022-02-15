import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Component, Inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {ISelectedExperiment} from '../../../../../features/experiments/shared/experiment-info.model';
import {ITableExperiment} from '../../common-experiment-model.model';

@Component({
  selector: 'sm-abort-all-children-dialog',
  templateUrl: './abort-all-children-dialog.component.html',
  styleUrls: ['./abort-all-children-dialog.component.scss']
})
export class AbortAllChildrenDialogComponent {
  public experiments: ISelectedExperiment[];
  shouldBeAbortedTasks: ITableExperiment[] = null;


  constructor(
    private store: Store<any>, public dialogRef: MatDialogRef<AbortAllChildrenDialogComponent>,
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
