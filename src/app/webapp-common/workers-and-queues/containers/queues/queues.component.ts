import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Queue} from '../../../../business-logic/model/queues/queue';
import {Task} from '../../../../business-logic/model/tasks/task';
import {select, Store} from '@ngrx/store';
import {Router} from '@angular/router';
import {DeleteQueue, GetQueues, MoveExperimentInQueue, MoveExperimentToBottomOfQueue, MoveExperimentToOtherQueue, MoveExperimentToTopOfQueue, QueuesTableSortChanged, RemoveExperimentFromQueue, SetSelectedQueue} from '../../actions/queues.actions';
import {selectQueues, selectQueuesTableSortField, selectQueuesTableSortOrder, selectQueuesTasks, selectSelectedQueue} from '../../reducers/index.reducer';
import {filter, take} from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {ISmCol, TableSortOrderEnum} from '../../../shared/ui-components/data/table/table.consts';
import {QueueCreateDialogComponent} from '../../../shared/queue-create-dialog/queue-create-dialog.component';

@Component({
  selector   : 'sm-queues',
  templateUrl: './queues.component.html',
  styleUrls  : ['./queues.component.scss']
})
export class QueuesComponent implements OnInit, OnDestroy {

  public queues$: Observable<Array<Queue>>;
  public queuesTasks$: Observable<Map<string, Array<Task>>>;
  public selectedQueue$: Observable<Queue>;
  private createQueueDialog: MatDialogRef<QueueCreateDialogComponent, any>;
  public tableSortOrder$: Observable<1 | -1>;
  public tableSortField$: Observable<string>;

  constructor(private store: Store<any>, private router: Router, private dialog: MatDialog) {
    this.queues$         = this.store.select(selectQueues);
    this.queuesTasks$    = this.store.select(selectQueuesTasks);
    this.selectedQueue$  = this.store.pipe(select(selectSelectedQueue));
    this.tableSortOrder$ = this.store.select(selectQueuesTableSortOrder);
    this.tableSortField$ = this.store.select(selectQueuesTableSortField);
  }

  ngOnInit(): void {
    this.store.dispatch(new GetQueues());
  }

  sortedChanged(sort: { sortOrder: TableSortOrderEnum, colId: ISmCol['id'] }) {
    this.store.dispatch(new QueuesTableSortChanged(sort.colId, sort.sortOrder));
  }


  public selectQueue(queue) {
    this.store.dispatch(new SetSelectedQueue(queue));
  }

  deleteQueue(queue) {
    this.store.dispatch(new DeleteQueue(queue));
  }

  renameQueue(queue) {
    this.createQueueDialog = this.dialog.open(QueueCreateDialogComponent, {data: queue});
    this.createQueueDialog.afterClosed()
      .pipe(
        filter(queue => !!queue),
        take(1)
      )
      .subscribe((queue) => {
        this.store.dispatch(new GetQueues());
      });
  }

  moveExperimentToBottomOfQueue(task: Task) {
    this.store.dispatch(new MoveExperimentToBottomOfQueue({task: task.id}));
  }

  moveExperimentToTopOfQueue(task: Task) {
    this.store.dispatch(new MoveExperimentToTopOfQueue({task: task.id}));
  }

  removeExperimentFromQueue(task: Task) {
    this.store.dispatch(new RemoveExperimentFromQueue({task: task.id}));
  }

  moveExperimentToOtherQueue($event) {
    this.store.dispatch(new MoveExperimentToOtherQueue({task: $event.task.id, queue: $event.queue.id}));
  }

  moveExperimentInQueue($event: any) {
    this.store.dispatch(new MoveExperimentInQueue($event));
  }

  ngOnDestroy(): void {
    this.selectQueue(null);
  }
}
