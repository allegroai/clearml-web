import {Injectable} from '@angular/core';
import {catchError, filter, map, mergeMap, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import {Actions, Effect, ofType} from '@ngrx/effects';
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
  ADD_EXPERIMENT_TO_QUEUE,
  AddExperimentToQueue,
  DELETE_QUEUE,
  DeleteQueue,
  GET_STATS,
  getQueues,
  GetStats,
  MOVE_EXPERIMENT_IN_QUEUE,
  MOVE_EXPERIMENT_TO_BOTTOM_OF_QUEUE,
  MOVE_EXPERIMENT_TO_OTHER_QUEUE,
  MOVE_EXPERIMENT_TO_TOP_OF_QUEUE,
  MoveExperimentInQueue,
  MoveExperimentToBottomOfQueue,
  MoveExperimentToOtherQueue,
  MoveExperimentToTopOfQueue,
  REFRESH_SELECTED_QUEUE,
  RefreshSelectedQueue,
  REMOVE_EXPERIMENT_FROM_QUEUE,
  RemoveExperimentFromQueue,
  SET_SELECTED_QUEUE,
  SetQueues,
  SetSelectedQueue,
  SetSelectedQueueFromServer,
  SetStats,
  SyncSpecificQueueInTable,
  queuesTableSortChanged, queuesTableSetSort
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

  @Effect()
  activeLoader = this.actions.pipe(
    ofType(getQueues, REFRESH_SELECTED_QUEUE),
    map(action => activeLoader(action.type))
  );

  @Effect()
  getQueues = this.actions.pipe(
    ofType(getQueues, queuesTableSetSort),
    withLatestFrom(
      this.store.select(selectQueuesTableSortFields)),
    switchMap(([action, orderFields]) => this.queuesApi.queuesGetAllEx({
      only_fields: ['*', 'entries.task.name'],
      order_by: encodeOrder(orderFields)
    }).pipe(
      mergeMap(res => [new SetQueues(this.sortQueues(orderFields, res.queues)), deactivateLoader(action.type)]),
      catchError(err => [deactivateLoader(action.type), requestFailed(err)])
    ))
  );

  @Effect()
  getSelectedQueue = this.actions.pipe(
    ofType<SetSelectedQueue>(SET_SELECTED_QUEUE),
    filter(action => !!action.payload.queue),
    tap(action => this.store.dispatch(activeLoader(action.type))),
    switchMap(action => this.queuesApi.queuesGetAllEx({
        id: [action.payload.queue.id],
        only_fields: ['*', 'entries.task.name']
      }).pipe(
      mergeMap(res => [
        new SetSelectedQueueFromServer(res.queues[0]),
        new SyncSpecificQueueInTable(res.queues[0]),
        deactivateLoader(action.type)]),
      catchError(err => [deactivateLoader(action.type), requestFailed(err)])
      )
    )
  );

  @Effect()
  RefreshSelectedQueue = this.actions.pipe(
    ofType<RefreshSelectedQueue>(REFRESH_SELECTED_QUEUE),
    withLatestFrom(this.store.select(selectSelectedQueue)),
    switchMap(([action, queue]) => this.queuesApi.queuesGetAllEx({
      id: [queue.id],
      only_fields: ['*', 'entries.task.name']
    }).pipe(
      mergeMap(res => [
        new SetSelectedQueueFromServer(res.queues[0]),
        new SyncSpecificQueueInTable(res.queues[0]),
        deactivateLoader(action.type)]),
      catchError(err => [deactivateLoader(action.type), requestFailed(err)])
    ))
  );

  @Effect()
  deleteQueues = this.actions.pipe(
    ofType<DeleteQueue>(DELETE_QUEUE),
    switchMap(action => this.queuesApi.queuesDelete({queue: action.payload.queue.id}).pipe(
      mergeMap(res => [getQueues(),
        new SetSelectedQueue(),
      ]),
      catchError(err => [deactivateLoader(action.type), requestFailed(err), addMessage(MESSAGES_SEVERITY.ERROR, 'Delete Queue failed')])
    ))
  );

  @Effect()
  moveExperimentToTopOfQueue = this.actions.pipe(
    ofType<MoveExperimentToTopOfQueue>(MOVE_EXPERIMENT_TO_TOP_OF_QUEUE),
    withLatestFrom(this.store.select(selectSelectedQueue)),
    switchMap(([action, queue]) => this.queuesApi.queuesMoveTaskToFront({
      queue: queue.id,
      task: action.payload.task
    }).pipe(
      mergeMap(res => [new RefreshSelectedQueue()]),
      catchError(err => [deactivateLoader(action.type), requestFailed(err), addMessage(MESSAGES_SEVERITY.ERROR, 'Move Experiment failed')])
    ))
  );

  @Effect()
  moveExperimentToBottomOfQueue = this.actions.pipe(
    ofType<MoveExperimentToBottomOfQueue>(MOVE_EXPERIMENT_TO_BOTTOM_OF_QUEUE),
    withLatestFrom(this.store.select(selectSelectedQueue)),
    switchMap(([action, queue]) => this.queuesApi.queuesMoveTaskToBack({
      queue: queue.id,
      task: action.payload.task
    }).pipe(
      mergeMap(res => [new RefreshSelectedQueue()]),
      catchError(err => [deactivateLoader(action.type), requestFailed(err), addMessage(MESSAGES_SEVERITY.ERROR, 'Move Experiment failed')])
    ))
  );

  @Effect()
  moveExperimentInQueue = this.actions.pipe(
    ofType<MoveExperimentInQueue>(MOVE_EXPERIMENT_IN_QUEUE),
    withLatestFrom(this.store.select(selectSelectedQueue)),
    switchMap(([action, queue]) =>
      this.queuesApi.queuesMoveTaskBackward({
        queue: queue.id,
        task: action.payload.task,
        count: (action.payload.count)
      }).pipe(
        mergeMap(res => [new RefreshSelectedQueue()]),
        catchError(err => [deactivateLoader(action.type), requestFailed(err), addMessage(MESSAGES_SEVERITY.ERROR, 'Move Queue failed')])
      )
    )
  );

  @Effect()
  removeExperimentFromQueue = this.actions.pipe(
    ofType<RemoveExperimentFromQueue>(REMOVE_EXPERIMENT_FROM_QUEUE),
    withLatestFrom(this.store.select(selectSelectedQueue)),
    switchMap(([action, queue]) => this.tasksApi.tasksDequeue({task: action.payload.task}).pipe(
      mergeMap(res => [new RefreshSelectedQueue()]),
      catchError(err => [deactivateLoader(action.type), requestFailed(err),
        addMessage(MESSAGES_SEVERITY.ERROR, 'Remove Queue failed')])
    ))
  );

  @Effect()
  moveExperimentToOtherQueue = this.actions.pipe(
    ofType<MoveExperimentToOtherQueue>(MOVE_EXPERIMENT_TO_OTHER_QUEUE),
    withLatestFrom(this.store.select(selectSelectedQueue)),
    switchMap(([action, queue]) => this.queuesApi.queuesRemoveTask({queue: queue.id, task: action.payload.task}).pipe(
      mergeMap(res => [new AddExperimentToQueue(action.payload)]),
      catchError(err => [deactivateLoader(action.type), requestFailed(err),
        addMessage(MESSAGES_SEVERITY.ERROR, 'Move Queue to other queue failed')])
      )
    )
  );

  @Effect()
  addExperimentToQueue = this.actions.pipe(
    ofType<AddExperimentToQueue>(ADD_EXPERIMENT_TO_QUEUE),
    switchMap((action) => this.queuesApi.queuesAddTask({queue: action.payload.queue, task: action.payload.task}).pipe(
      mergeMap(res => [new RefreshSelectedQueue(), getQueues()]),
      catchError(err => [deactivateLoader(action.type), requestFailed(err), addMessage(MESSAGES_SEVERITY.ERROR, 'Add experiment to queue failed')])
      )
    )
  );

  @Effect()
  getStats$ = this.actions.pipe(
    ofType(GET_STATS),
    withLatestFrom(this.store.select(selectQueueStats),
      this.store.select(selectSelectedQueue),
      this.store.select(selectQueuesStatsTimeFrame)
    ),
    switchMap(([action, currentStats, queue, selectedRange]: [GetStats, any, Queue, string]) => {
      const payload = action.payload;
      const now = Math.floor((new Date).getTime() / 1000);
      const range = parseInt(selectedRange, 10);
      const granularity = Math.max(Math.floor(range / payload.maxPoints), queue ? 10 : 40);

      const req: QueuesGetQueueMetricsRequest = {
        from_date: now - range,
        to_date: now,
        queue_ids: queue ? [queue.id] : undefined,
        interval: granularity
      };

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
            let queue: QueueMetrics;
            if (res.queues.length) {
              queue = res.queues[0];
            } else {
              queue = {dates: [], avg_waiting_times: [], queue_lengths: []};
            }
            const waitData = [{
              wait: '',
              metrics: [{
                metric: 'queueAvgWait',
                dates: queue.dates,
                stats: [{
                  aggregation: 'seconds',
                  values: queue.avg_waiting_times
                }]
              }]
            }];
            const lenData = [{
              length: '',
              metrics: [{
                metric: 'queueLen',
                dates: queue.dates,
                stats: [{
                  aggregation: 'count',
                  values: queue.queue_lengths
                }]
              }]
            }];
            newStats = {
              wait: addStats(currentStats.wait, waitData, payload.maxPoints,
                [{key: 'queueAvgWait'}], 'wait', {queueAvgWait: {title: 'Queue Average Wait Time', multiply: 1}}),
              length: addStats(currentStats.length, lenData, payload.maxPoints,
                [{key: 'queueLen'}], 'length', {queueLen: {title: 'Queues Average Length', multiply: 1}})
            };
            if (Array.isArray(newStats.wait) && newStats.wait.some(topic => topic.dates.length > 0)) {
              addFullRangeMarkers(newStats.wait, now - range, now);
            }
            if (Array.isArray(newStats.length) && newStats.length.some(topic => topic.dates.length > 0)) {
              addFullRangeMarkers(newStats.length, now - range, now);
            }
          }
          return [deactivateLoader(action.type), new SetStats({data: newStats}), hideNoStatsNotice()];
        }),
        catchError(err => [deactivateLoader(action.type),
          new SetStats({data: {wait: [], length: []}}),
          requestFailed(err),
          showStatsErrorNotice()
        ])
      );

    })
  );

  @Effect()
  tableSortChange = this.actions.pipe(
    ofType(queuesTableSortChanged),
    withLatestFrom(this.store.select(selectQueuesTableSortFields)),
    switchMap(([action, oldOrders]) => {
      let orders = addMultipleSortColumns(oldOrders, action.colId, action.isShift);
      return [queuesTableSetSort({orders})];
    })
  );

  private sortQueues(sortFields, queues): Queue[] {
    const srtByFields = sortFields.map(f => f.field);
    const srtByOrders = sortFields.map(f => f.order > 0? 'asc' : 'desc');
    return orderBy<Queue>(srtByFields, srtByOrders, queues) as any;
  }
}
