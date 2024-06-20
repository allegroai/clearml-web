import {Component, effect, inject} from '@angular/core';
import {Task} from '~/business-logic/model/tasks/task';
import {Store} from '@ngrx/store';
import {ActivatedRoute, Router} from '@angular/router';
import {queueActions, Queue} from '../../actions/queues.actions';
import {
  selectQueues,
  selectQueuesTableSortFields,
  selectSelectedQueue, selectSelectedQueueId
} from '../../reducers/index.reducer';
import {filter, take} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {ConfirmDialogComponent} from '@common/shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {ConfirmDialogConfig} from '@common/shared/ui-components/overlay/confirm-dialog/confirm-dialog.model';
import {RefreshService} from '@common/core/services/refresh.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { setAutoRefresh } from '@common/core/actions/layout.actions';
import {QueueCreateDialogComponent} from '@common/shared/queue-create-dialog/queue-create-dialog.component';

@Component({
  selector: 'sm-queues',
  templateUrl: './queues.component.html',
  styleUrls: ['./queues.component.scss']
})
export class QueuesComponent {
  private store = inject(Store);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private refresh = inject(RefreshService);

  queues = this.store.selectSignal(selectQueues);
  selectedQueueId = this.store.selectSignal(selectSelectedQueueId);
  selectedQueue = this.store.selectSignal(selectSelectedQueue);
  tableSortFields = this.store.selectSignal(selectQueuesTableSortFields);
  public queuesManager: boolean;

  constructor() {
    this.store.dispatch(queueActions.getQueues());
    this.queuesManager = this.route.snapshot.data.queuesManager;

    effect(() => {
      if (this.selectedQueueId() !== this.selectedQueue()?.id) {
        const queue = this.queues()?.find(queue => queue.id === this.selectedQueueId());
        this.store.dispatch(queueActions.setSelectedQueue({queue}));
      }
    }, {allowSignalWrites: true});

    this.refresh.tick
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.store.dispatch(queueActions.refreshSelectedQueue({autoRefresh: true})));
  }

  sortedChanged(sort: { isShift: boolean; colId: ISmCol['id'] }) {
    this.store.dispatch(queueActions.queuesTableSortChanged({colId: sort.colId, isShift: sort.isShift}));
  }

  public selectQueue(queue) {
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: {id: queue?.id},
        queryParamsHandling: 'merge'
      });
  }

  deleteQueue(queue: Queue) {
    this.store.dispatch(queueActions.deleteQueue({queue}));
  }

  clearQueue(queue: Queue) {
      this.dialog.open<ConfirmDialogComponent, ConfirmDialogConfig, boolean>(ConfirmDialogComponent, {
        data: {
          title    : 'Clear all pending tasks',
          body     : `Are you sure you want to dequeue the ${queue.entries.length} task${queue.entries.length>1?'s':''} currently pending on the ${queue.name} queue?`,
          yes      : 'Clear Queue',
          no       : 'Cancel',
          iconClass: 'i-alert',
        }
      }).afterClosed()
        .pipe(filter(res => res))
        .subscribe(() => this.store.dispatch(queueActions.clearQueue({queue})));
    }



  renameQueue(queue) {
    this.dialog.open<QueueCreateDialogComponent, Queue, boolean>(QueueCreateDialogComponent, {data: queue}).afterClosed()
      .pipe(
        filter(q => !!q),
        take(1)
      )
      .subscribe(() => this.store.dispatch(queueActions.getQueues()));
  }

  moveExperimentToBottomOfQueue(task: Task) {
    this.store.dispatch(queueActions.moveExperimentToBottomOfQueue({task: task.id}));
  }

  moveExperimentToTopOfQueue(task: Task) {
    this.store.dispatch(queueActions.moveExperimentToTopOfQueue({task: task.id}));
  }

  removeExperimentFromQueue(task: Task) {
    this.store.dispatch(queueActions.removeExperimentFromQueue({task: task.id}));
  }

  moveExperimentToOtherQueue($event) {
    this.store.dispatch(queueActions.moveExperimentToOtherQueue({task: $event.task.id, queue: $event.queue.id}));
  }

  moveExperimentInQueue({task, count}) {
    this.store.dispatch(queueActions.moveExperimentInQueue({task, count}));
  }
  addQueue() {
    this.dialog.open<QueueCreateDialogComponent, unknown, boolean>(QueueCreateDialogComponent).afterClosed()
      .pipe(
        filter(queue => !!queue),
        take(1)
      )
      .subscribe(() => {
        this.store.dispatch(queueActions.getQueues());
      });
  }

  setAutoRefresh($event: boolean) {
    this.store.dispatch(setAutoRefresh({autoRefresh: $event}));
  }
}
