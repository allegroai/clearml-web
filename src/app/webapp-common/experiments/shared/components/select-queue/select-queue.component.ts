import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {GetQueuesForEnqueue, GetTaskForEnqueue, SetTaskForEnqueue} from './select-queue.actions';
import {selectQueuesList, selectTaskForEnqueue} from './select-queue.reducer';
import {Queue} from '../../../../../business-logic/model/queues/queue';
import {ConfirmDialogComponent} from '../../../../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {BlTasksService} from '../../../../../business-logic/services/tasks.service';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'sm-select-queue',
  templateUrl: './select-queue.component.html',
  styleUrls: ['./select-queue.component.scss']
})
export class SelectQueueComponent implements OnInit, OnDestroy {
  public queues: Array<Queue>;
  public selectedQueue: Queue;
  public queues$ = this.store.select(selectQueuesList);
  public task$ = this.store.select(selectTaskForEnqueue);
  public enqueueWarning$ = this.task$.pipe(filter(task => !(task && task.script && (task.script.diff || (task.script.repository && task.script.entry_point)))));
  public reference: string;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    private store: Store<any>, private blTaskService: BlTasksService,
    @Inject(MAT_DIALOG_DATA) public data: {
      taskId?: string;
      reference?: string
    }
  ) {

    if (data && data.taskId) {
      this.store.dispatch(new GetTaskForEnqueue(data.taskId));
      this.reference = data.reference;
    }
    this.queues$.subscribe(queues => {
      if (queues) {
        this.queues = queues;
        this.selectedQueue = this.blTaskService.getDefaultQueue(this.queues) || queues[0];
      }
    });
  }

  ngOnInit() {
    this.store.dispatch(new GetQueuesForEnqueue());
  }

  closeDialog(confirmed) {
    this.dialogRef.close({confirmed, queue: this.selectedQueue});
  }

  selectQueue(queueId: string) {
    if (this.queues) {
      this.selectedQueue = this.queues.find(queue => queue.id === queueId);
    }
  }

  ngOnDestroy(): void {
    this.store.dispatch(new SetTaskForEnqueue(null));
  }
}
