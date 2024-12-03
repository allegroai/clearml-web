import {ActionReducerMap, createSelector} from '@ngrx/store';
import {reducer as queuesReducer, State as QueuesState} from './queues.reducer';
import {workersReducer, WorkersState} from './workers.reducer';
import {statsReducer, StatsState} from './stats.reducer';
import {selectRouterQueryParams} from '@common/core/reducers/router-reducer';
import {WorkerExt} from '@common/workers-and-queues/actions/workers.actions';

interface State {
  workers: WorkersState,
  queues: QueuesState,
  stats: StatsState
}

export const reducers: ActionReducerMap<State> = {
  workers: workersReducer,
  queues : queuesReducer,
  stats: statsReducer
};

export const workersAndQueues = state => state['workersAndQueues'];

export const selectQueuesState = createSelector(workersAndQueues, state => state.queues as QueuesState);
export const selectQueues = createSelector(selectQueuesState, state => state.data);
export const selectSelectedQueueId = createSelector(selectRouterQueryParams, params => params?.id);
export const selectSelectedQueue = createSelector(selectQueuesState, state => state.selectedQueue);
export const selectQueuesTasks = createSelector(selectQueuesState, state => state.tasks);
export const selectQueueStats = createSelector(selectQueuesState, state => state.stats);
export const selectQueuesStatsTimeFrame  = createSelector(selectQueuesState, state => state.selectedStatsTimeFrame);
export const selectQueuesTableSortFields = createSelector(selectQueuesState, state => state.tableSortFields);

export const selectWorkersState = createSelector(workersAndQueues, state => state.workers);
export const selectWorkers = createSelector(selectWorkersState, state => state.data as WorkerExt[]);
export const selectStats   = createSelector(selectWorkersState, state => state.stats);
export const selectSelectedWorker  = createSelector(selectWorkersState, state => state.selectedWorker);
export const selectWorkersTableSortFields = createSelector(selectWorkersState, state => state.tableSortFields);

export const selectStatsParams = createSelector(selectWorkersState, state => state.selectedStatsParam);
export const selectStatsTimeFrame = createSelector(selectWorkersState, state => state.selectedStatsTimeFrame);

export const selectStatsState = createSelector(workersAndQueues, state => state.stats);
export const selectStatsErrorNotice = createSelector(selectStatsState, state => state.showNoStatsNotice);
