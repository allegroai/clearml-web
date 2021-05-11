import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Queue} from '../../../../business-logic/model/queues/queue';
import {Task} from '../../../../business-logic/model/tasks/task';
import {Store} from '@ngrx/store';
import {ActivatedRoute, Router} from '@angular/router';
import {DeleteQueue, getQueues, MoveExperimentInQueue, MoveExperimentToBottomOfQueue, MoveExperimentToOtherQueue, MoveExperimentToTopOfQueue, queuesTableSortChanged, RemoveExperimentFromQueue, SetSelectedQueue} from '../../actions/queues.actions';
import {selectQueues, selectQueuesTableSortFields, selectQueuesTasks, selectSelectedQueue} from '../../reducers/index.reducer';
import {filter, take, withLatestFrom} from 'rxjs/operators';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ISmCol} from '../../../shared/ui-components/data/table/table.consts';
import {QueueCreateDialogComponent} from '../../../shared/queue-create-dialog/queue-create-dialog.component';
import {SortMeta} from 'primeng/api';

@Component({
  selector: 'sm-queues',
  templateUrl: './queues.component.html',
  styleUrls: ['./queues.component.scss']
})
export class QueuesComponent implements OnInit {

  public queues$: Observable<Queue[]>;
  public queuesTasks$: Observable<Map<string, Task[]>>;
  public selectedQueue$: Observable<Queue>;
  private createQueueDialog: MatDialogRef<QueueCreateDialogComponent, any>;
  public tableSortOrder$: Observable<1 | -1>;
  public tableSortFields$: Observable<SortMeta[]>;

  get routerQueueId() {
    const url = new URL(window.location.href);
    return url.searchParams.get('id');
  }

  constructor(private store: Store<any>, private router: Router, private route: ActivatedRoute, private dialog: MatDialog) {
    this.queues$ = this.store.select(selectQueues);
    this.queuesTasks$ = this.store.select(selectQueuesTasks);
    this.selectedQueue$ = this.store.select(selectSelectedQueue);
    this.tableSortFields$ = this.store.select(selectQueuesTableSortFields);
  }

  ngOnInit(): void {
    this.store.dispatch(getQueues());

    this.queues$.pipe(
      withLatestFrom(this.selectedQueue$),
      filter(([queues, selectedQueue]) => queues && selectedQueue?.id !== this.routerQueueId),
      take(1))
      .subscribe(([queues]) => {
        const selectedQueue = queues.find(queue => queue.id === this.routerQueueId);
        this.selectQueue(selectedQueue);
      });
  }

  sortedChanged(sort: { isShift: boolean; colId: ISmCol['id'] }) {
    this.store.dispatch(queuesTableSortChanged({colId: sort.colId, isShift: sort.isShift}));
  }


  public selectQueue(queue) {
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: {id: queue?.id},
        queryParamsHandling: 'merge'
      });
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
      .subscribe(() => {
        this.store.dispatch(getQueues());
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
}
