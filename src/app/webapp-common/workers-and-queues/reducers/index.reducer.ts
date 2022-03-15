import {ActionReducerMap, createSelector} from '@ngrx/store';
import {queuesReducer, QueueStoreType} from './queues.reducer';
import {workersReducer} from './workers.reducer';
import {statsReducer} from './stats.reducer';

export const reducers: ActionReducerMap<any, any> = {
  workers: workersReducer,
  queues : queuesReducer,
  stats: statsReducer
};

/**
 * The createFeatureSelector function selects a piece of state from the root of the state object.
 * This is used for selecting feature states that are loaded eagerly or lazily.
 */
export const workersAndQueues = state => state['workersAndQueues'];

export const queues                      = createSelector(workersAndQueues, state => state.queues as QueueStoreType);
export const selectQueues                = createSelector(queues, state => state.data);
export const selectSelectedQueue         = createSelector(queues, state => state.selectedQueue);
export const selectQueuesTasks           = createSelector(queues, state => state.tasks);
export const selectQueueStats            = createSelector(queues, state => state.stats);
export const selectQueuesStatsTimeFrame  = createSelector(queues, state => state.selectedStatsTimeFrame);
export const selectQueuesTableSortFields = createSelector(queues, state => state.tableSortFields);

export const workers                     = createSelector(workersAndQueues, state => state.workers);
export const selectWorkers               = createSelector(workers, state => state.data);
export const selectStats                 = createSelector(workers, state => state.stats);
export const selectStatsRequest          = createSelector(workers, state => state.statsRequest);
export const selectSelectedWorker        = createSelector(workers, state => state.selectedWorker);
export const selectWorkersTableSortFields = createSelector(workers, state => state.tableSortFields);

export const selectStatsParams    = createSelector(workers, state => state.selectedStatsParam);
export const selectStatsTimeFrame = createSelector(workers, state => state.selectedStatsTimeFrame);

export const stats = createSelector(workersAndQueues, state => state.stats);
export const selectStatsErrorNotice = createSelector(stats, state => state.showNoStatsNotice);
