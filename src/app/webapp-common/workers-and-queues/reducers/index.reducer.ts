import {ActionReducerMap, createFeatureSelector, createSelector} from '@ngrx/store';
import {Worker} from '../../../business-logic/model/workers/worker';
import {queuesReducer} from './queues.reducer';
import {workersReducer} from './workers.reducer';
import {Queue} from '../../../business-logic/model/queues/queue';
import {Task} from '../../../business-logic/model/tasks/task';
import {statsReducer, StatsState} from './stats.reducer';
import {SortMeta} from 'primeng/api';

export const reducers: ActionReducerMap<any, any> = {
  workers: workersReducer,
  queues : queuesReducer,
  stats: statsReducer
};

/**
 * The createFeatureSelector function selects a piece of state from the root of the state object.
 * This is used for selecting feature states that are loaded eagerly or lazily.
 */
export const workersAndQueues = createFeatureSelector<any>('workersAndQueues');

export const queues                      = createSelector(workersAndQueues, state => state.queues);
export const selectQueues                = createSelector(queues, (state): Array<Queue> => state.data);
export const selectSelectedQueue         = createSelector(queues, (state): Queue => state.selectedQueue);
export const selectQueuesTasks           = createSelector(queues, (state): Map<string, Array<Task>> => state.tasks);
export const selectQueueStats            = createSelector(queues, state => state.stats);
export const selectQueuesStatsTimeFrame  = createSelector(queues, state => state.selectedStatsTimeFrame);
export const selectQueuesTableSortFields = createSelector(queues, (state): SortMeta[] => state.tableSortFields);

export const workers                     = createSelector(workersAndQueues, state => state.workers);
export const selectWorkers               = createSelector(workers, (state): Array<Worker> => state.data);
export const selectStats                 = createSelector(workers, state => state.stats);
export const selectStatsRequest          = createSelector(workers, state => state.statsRequest);
export const selectSelectedWorker        = createSelector(workers, (state): Worker => state.selectedWorker);
export const selectWorkersTableSortFields = createSelector(workers, (state): SortMeta[] => state.tableSortFields);

export const selectStatsParams    = createSelector(workers, state => state.selectedStatsParam);
export const selectStatsTimeFrame = createSelector(workers, state => state.selectedStatsTimeFrame);

export const stats = createSelector(workersAndQueues, state => state.stats);
export const selectStatsErrorNotice = createSelector(stats, (state: StatsState) => state.showNoStatsNotice);
