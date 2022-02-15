import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {GetQueuesForEnqueue, GetTaskForEnqueue, SetTaskForEnqueue} from './select-queue.actions';
import {selectQueuesList, selectTaskForEnqueue} from './select-queue.reducer';
import {Queue} from '../../../../../business-logic/model/queues/queue';
import {ConfirmDialogComponent} from '../../../../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {BlTasksService} from '../../../../../business-logic/services/tasks.service';
import {filter} from 'rxjs/operators';
import {Subscription} from 'rxjs';

@Component({
  selector: 'sm-select-queue',
  templateUrl: './select-queue.component.html',
  styleUrls: ['./select-queue.component.scss']
})
export class SelectQueueComponent implements OnInit, OnDestroy {
  public queues: Array<Queue>;
  public selectedQueue: Queue;
  public queues$ = this.store.select(selectQueuesList);
  public tasks$ = this.store.select(selectTaskForEnqueue);
  public enqueueWarning$ = this.tasks$.pipe(filter(tasks => tasks?.some(task => !(task && task.script && (task.script.diff || (task.script.repository && task.script.entry_point))))));
  public reference: string;
  private queuesSub: Subscription;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    private store: Store<any>, private blTaskService: BlTasksService,
    @Inject(MAT_DIALOG_DATA) public data: {
      taskIds?: string[];
      reference?: string;
    }
  ) {

    if (data && data.taskIds?.length > 0) {
      this.store.dispatch(new GetTaskForEnqueue(data.taskIds));
      this.reference = data.taskIds.length < 2 ?  data.reference : `${data.taskIds.length} experiments `;
    }
    this.queuesSub = this.queues$.subscribe(queues => {
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

  ngOnDestroy(): void {
    this.queuesSub.unsubscribe();
    this.store.dispatch(new SetTaskForEnqueue(null));
  }
}
