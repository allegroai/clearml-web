import {Injectable} from '@angular/core';
import {catchError, filter, map, mergeMap, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {ApiQueuesService} from '../../../business-logic/api-services/queues.service';
import {QueuesGetQueueMetricsRequest} from '../../../business-logic/model/queues/queuesGetQueueMetricsRequest';
import {QueuesGetQueueMetricsResponse} from '../../../business-logic/model/queues/queuesGetQueueMetricsResponse';
import {Queue} from '../../../business-logic/model/queues/queue';
import {
  selectQueuesStatsTimeFrame,
  selectQueuesTableSortFields,
  selectQueueStats, selectSelectedQueue
} from '../reducers/index.reducer';
import {activeLoader, addMessage, deactivateLoader} from '../../core/actions/layout.actions';
import {requestFailed} from '../../core/actions/http.actions';
import {
  getQueues,
  queuesTableSortChanged, queuesTableSetSort, setQueues, setSelectedQueue, setSelectedQueueFromServer, refreshSelectedQueue, syncSpecificQueueInTable, deleteQueue, moveExperimentToBottomOfQueue,
  moveExperimentToTopOfQueue, moveExperimentInQueue, removeExperimentFromQueue, moveExperimentToOtherQueue, addExperimentToQueue, getStats, setStats
} from '../actions/queues.actions';
import {MESSAGES_SEVERITY} from '../../../app.constants';
import {QueueMetrics} from '../../../business-logic/model/queues/queueMetrics';
import {ApiTasksService} from '../../../business-logic/api-services/tasks.service';
import {cloneDeep, orderBy} from 'lodash/fp';
import {addFullRangeMarkers, addStats, removeFullRangeMarkers} from '../../shared/utils/statistics';
import {hideNoStatsNotice, showStatsErrorNotice} from '../actions/stats.actions';
import {encodeOrder} from '../../shared/utils/tableParamEncode';
import {addMultipleSortColumns} from '../../shared/utils/shared-utils';

@Injectable()
export class QueuesEffect {
  constructor(
    private actions: Actions, private queuesApi: ApiQueuesService, private tasksApi: ApiTasksService,
    private store: Store<any>
  ) {
  }

  activeLoader = createEffect(() => this.actions.pipe(
    ofType(getQueues, refreshSelectedQueue),
    map(action => activeLoader(action.type))
  ));

  getQueues = createEffect(() => this.actions.pipe(
    ofType(getQueues, queuesTableSetSort),
    withLatestFrom(
      this.store.select(selectQueuesTableSortFields)),
    switchMap(([action, orderFields]) => this.queuesApi.queuesGetAllEx({
      /* eslint-disable @typescript-eslint/naming-convention */
      only_fields: ['*', 'entries.task.name'],
      order_by: encodeOrder(orderFields)
      /* eslint-enable @typescript-eslint/naming-convention */
    }).pipe(
      mergeMap(res => [setQueues({queues: this.sortQueues(orderFields, res.queues)}), deactivateLoader(action.type)]),
      catchError(err => [deactivateLoader(action.type), requestFailed(err)])
    ))
  ));

  getSelectedQueue = createEffect(() => this.actions.pipe(
    ofType(setSelectedQueue),
    filter(action => !!action.queue),
    tap(action => this.store.dispatch(activeLoader(action.type))),
    switchMap(action => this.queuesApi.queuesGetAllEx({
        id: [action.queue.id],
      // eslint-disable-next-line @typescript-eslint/naming-convention
        only_fields: ['*', 'entries.task.name']
      }).pipe(
        mergeMap(res => [
          setSelectedQueueFromServer({queue: res.queues[0]}),
          syncSpecificQueueInTable({queue: res.queues[0]}),
          deactivateLoader(action.type)]),
        catchError(err => [deactivateLoader(action.type), requestFailed(err)])
      )
    )
  ));

  refreshSelectedQueue = createEffect(() => this.actions.pipe(
    ofType(refreshSelectedQueue),
    withLatestFrom(this.store.select(selectSelectedQueue)),
    switchMap(([action, queue]) => this.queuesApi.queuesGetAllEx({
      id: [queue.id],
      // eslint-disable-next-line @typescript-eslint/naming-convention
      only_fields: ['*', 'entries.task.name']
    }).pipe(
      mergeMap(res => [
        setSelectedQueueFromServer({queue: res.queues[0]}),
        syncSpecificQueueInTable({queue: res.queues[0]}),
        deactivateLoader(action.type)]),
      catchError(err => [deactivateLoader(action.type), requestFailed(err)])
    ))
  ));

  deleteQueues = createEffect(() => this.actions.pipe(
    ofType(deleteQueue),
    switchMap(action => this.queuesApi.queuesDelete({queue: action.queue.id}).pipe(
      mergeMap(() => [getQueues(),
        setSelectedQueue({}),
      ]),
      catchError(err => [deactivateLoader(action.type), requestFailed(err), addMessage(MESSAGES_SEVERITY.ERROR, 'Delete Queue failed')])
    ))
  ));

  moveExperimentToTopOfQueue = createEffect(() => this.actions.pipe(
    ofType(moveExperimentToTopOfQueue),
    withLatestFrom(this.store.select(selectSelectedQueue)),
    switchMap(([action, queue]) => this.queuesApi.queuesMoveTaskToFront({
      queue: queue.id,
      task: action.task
    }).pipe(
      mergeMap(() => [refreshSelectedQueue()]),
      catchError(err => [deactivateLoader(action.type), requestFailed(err), addMessage(MESSAGES_SEVERITY.ERROR, 'Move Experiment failed')])
    ))
  ));

  moveExperimentToBottomOfQueue = createEffect(() => this.actions.pipe(
    ofType(moveExperimentToBottomOfQueue),
    withLatestFrom(this.store.select(selectSelectedQueue)),
    switchMap(([action, queue]) => this.queuesApi.queuesMoveTaskToBack({
      queue: queue.id,
      task: action.task
    }).pipe(
      mergeMap(() => [refreshSelectedQueue()]),
      catchError(err => [deactivateLoader(action.type), requestFailed(err), addMessage(MESSAGES_SEVERITY.ERROR, 'Move Experiment failed')])
    ))
  ));

  moveExperimentInQueue = createEffect(() => this.actions.pipe(
    ofType(moveExperimentInQueue),
    withLatestFrom(this.store.select(selectSelectedQueue)),
    switchMap(([action, queue]) =>
      this.queuesApi.queuesMoveTaskBackward({
        queue: queue.id,
        task: action.task,
        count: (action.count)
      }).pipe(
        mergeMap(() => [refreshSelectedQueue()]),
        catchError(err => [refreshSelectedQueue(), deactivateLoader(action.type), requestFailed(err), addMessage(MESSAGES_SEVERITY.ERROR, 'Move Queue failed')])
      )
    ),
  ));

  removeExperimentFromQueue = createEffect(() => this.actions.pipe(
    ofType(removeExperimentFromQueue),
    switchMap((action) => this.tasksApi.tasksDequeue({task: action.task}).pipe(
      mergeMap(() => [refreshSelectedQueue()]),
      catchError(err => [deactivateLoader(action.type), requestFailed(err),
        addMessage(MESSAGES_SEVERITY.ERROR, 'Remove Queue failed')])
    ))
  ));

  moveExperimentToOtherQueue = createEffect(() => this.actions.pipe(
    ofType(moveExperimentToOtherQueue),
    withLatestFrom(this.store.select(selectSelectedQueue)),
    switchMap(([action, queue]) => this.queuesApi.queuesRemoveTask({queue: queue.id, task: action.task}).pipe(
        mergeMap(() => [addExperimentToQueue({task: action.task, queue: action.queue})]),
        catchError(err => [deactivateLoader(action.type), requestFailed(err),
          addMessage(MESSAGES_SEVERITY.ERROR, 'Move Queue to other queue failed')])
      )
    )
  ));

  addExperimentToQueue = createEffect(() => this.actions.pipe(
    ofType(addExperimentToQueue),
    switchMap((action) => this.queuesApi.queuesAddTask({queue: action.queue, task: action.task}).pipe(
        mergeMap(() => [refreshSelectedQueue(), getQueues()]),
        catchError(err => [deactivateLoader(action.type), requestFailed(err), addMessage(MESSAGES_SEVERITY.ERROR, 'Add experiment to queue failed')])
      )
    )
  ));

  getStats$ = createEffect(() => this.actions.pipe(
    ofType(getStats),
    withLatestFrom(this.store.select(selectQueueStats),
      this.store.select(selectSelectedQueue),
      this.store.select(selectQueuesStatsTimeFrame)
    ),
    switchMap(([action, currentStats, queue, selectedRange]: [ReturnType<typeof getStats>, any, Queue, string]) => {
      const now = Math.floor((new Date()).getTime() / 1000);
      const range = parseInt(selectedRange, 10);
      const granularity = Math.max(Math.floor(range / action.maxPoints), queue ? 10 : 40);

      const req: QueuesGetQueueMetricsRequest = {
        /* eslint-disable @typescript-eslint/naming-convention */
        from_date: now - range,
        to_date: now,
        queue_ids: queue ? [queue.id] : undefined,
        interval: granularity
      };
      /* eslint-enable @typescript-eslint/naming-convention */
      return this.queuesApi.queuesGetQueueMetrics(req).pipe(
        mergeMap((res: QueuesGetQueueMetricsResponse) => {
          let newStats = {wait: null, length: null};
          currentStats = cloneDeep(currentStats);
          if (res && res.queues) {
            if (Array.isArray(currentStats.wait) && currentStats.wait.some(topic => topic.dates.length > 1)) {
              removeFullRangeMarkers(currentStats.wait);
            }
            if (Array.isArray(currentStats.length) && currentStats.length.some(topic => topic.dates.length > 1)) {
              removeFullRangeMarkers(currentStats.length);
            }
            let newQueue: QueueMetrics;
            if (res.queues.length) {
              newQueue = res.queues[0];
            } else {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              newQueue = {dates: [], avg_waiting_times: [], queue_lengths: []};
            }
            const waitData = [{
              wait: '',
              metrics: [{
                metric: 'queueAvgWait',
                dates: newQueue.dates,
                stats: [{
                  aggregation: 'seconds',
                  values: newQueue.avg_waiting_times
                }]
              }]
            }];
            const lenData = [{
              length: '',
              metrics: [{
                metric: 'queueLen',
                dates: newQueue.dates,
                stats: [{
                  aggregation: 'count',
                  values: newQueue.queue_lengths
                }]
              }]
            }];
            newStats = {
              wait: addStats(currentStats.wait, waitData, action.maxPoints,
                [{key: 'queueAvgWait'}], 'wait', {queueAvgWait: {title: 'Queue Average Wait Time', multiply: 1}}),
              length: addStats(currentStats.length, lenData, action.maxPoints,
                [{key: 'queueLen'}], 'length', {queueLen: {title: 'Queues Average Length', multiply: 1}})
            };
            if (Array.isArray(newStats.wait) && newStats.wait.some(topic => topic.dates.length > 0)) {
              addFullRangeMarkers(newStats.wait, now - range, now);
            }
            if (Array.isArray(newStats.length) && newStats.length.some(topic => topic.dates.length > 0)) {
              addFullRangeMarkers(newStats.length, now - range, now);
            }
          }
          return [deactivateLoader(action.type), setStats({data: newStats}), hideNoStatsNotice()];
        }),
        catchError(err => [deactivateLoader(action.type),
          setStats({data: {wait: [], length: []}}),
          requestFailed(err),
          showStatsErrorNotice()
        ])
      );

    })
  ));

  tableSortChange = createEffect(() => this.actions.pipe(
    ofType(queuesTableSortChanged),
    withLatestFrom(this.store.select(selectQueuesTableSortFields)),
    switchMap(([action, oldOrders]) => {
      const orders = addMultipleSortColumns(oldOrders, action.colId, action.isShift);
      return [queuesTableSetSort({orders})];
    })
  ));

  private sortQueues(sortFields, queues): Queue[] {
    const srtByFields = sortFields.map(f => f.field);
    const srtByOrders = sortFields.map(f => f.order > 0 ? 'asc' : 'desc');
    return orderBy<Queue>(srtByFields, srtByOrders, queues) as any;
  }
}
