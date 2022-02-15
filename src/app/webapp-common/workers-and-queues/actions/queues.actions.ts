import {createAction, props} from '@ngrx/store';
import {Queue} from '../../../business-logic/model/queues/queue';
import {Topic} from '../../shared/utils/statistics';
import {SortMeta} from 'primeng/api';

const queuesPrefix = 'QUEUES_';
export const GET_QUEUES = queuesPrefix + 'GET_QUEUES';
export const SET_QUEUES = queuesPrefix + 'SET_QUEUES';
// export const GET_QUEUES_TASKS = queuesPrefix + 'SET_QUEUES_TASKS';
// export const SET_QUEUES_TASKS = queuesPrefix + 'SET_QUEUES_TASKS';
// export const ADD_QUEUES_TASKS = queuesPrefix + 'ADD_QUEUES_TASKS';
export const MOVE_EXPERIMENT_TO_BOTTOM_OF_QUEUE = queuesPrefix + 'MOVE_EXPERIMENT_TO_BOTTOM_OF_QUEUE';
export const MOVE_EXPERIMENT_TO_TOP_OF_QUEUE = queuesPrefix + 'MOVE_EXPERIMENT_TO_TOP_OF_QUEUE';
export const MOVE_EXPERIMENT_IN_QUEUE = queuesPrefix + 'MOVE_EXPERIMENT_IN_QUEUE';
export const REMOVE_EXPERIMENT_FROM_QUEUE = queuesPrefix + 'REMOVE_EXPERIMENT_FROM_QUEUE';
export const MOVE_EXPERIMENT_TO_OTHER_QUEUE = queuesPrefix + 'MOVE_EXPERIMENT_TO_OTHER_QUEUE';
export const ADD_EXPERIMENT_TO_QUEUE = queuesPrefix + 'ADD_EXPERIMENT_TO_QUEUE';
export const SET_SELECTED_QUEUE = queuesPrefix + 'SET_SELECTED_QUEUE';
export const QUEUES_TABLE_SORT_CHANGED = queuesPrefix + 'QUEUES_TABLE_SORT_CHANGED';
export const QUEUES_TABLE_SET_SORT = queuesPrefix + 'QUEUES_TABLE_SET_SORT';
export const REFRESH_SELECTED_QUEUE = queuesPrefix + 'REFRESH_SELECTED_QUEUE';
export const SET_SELECTED_QUEUE_FROM_SERVER = queuesPrefix + 'SET_SELECTED_QUEUE_FROM_SERVER';
export const SYNC_SPECIFIC_QUEUE_IN_TABLE = queuesPrefix + 'SYNC_SPECIFIC_QUEUE_IN_TABLE';
export const DELETE_QUEUE = queuesPrefix + 'DELETE_QUEUE';
export const GET_STATS = queuesPrefix + 'GET_STATS';
export const SET_STATS = queuesPrefix + 'SET_STATS';
export const SET_STATS_PARAMS = queuesPrefix + 'SET_STATS_PARAMS';

export const getQueues = createAction(GET_QUEUES);

export const setQueues = createAction(
  SET_QUEUES,
  props<{ queues: Array<Queue> }>()
);

export const queuesTableSortChanged = createAction(
  QUEUES_TABLE_SORT_CHANGED,
  props<{ colId: string; isShift: boolean }>()
);


export const queuesTableSetSort = createAction(
  QUEUES_TABLE_SET_SORT,
  props<{ orders: SortMeta[] }>()
);

export const setSelectedQueue = createAction(
  SET_SELECTED_QUEUE,
  props<{ queue?: Queue }>()
);

export const refreshSelectedQueue = createAction(
  REFRESH_SELECTED_QUEUE
);

export const setSelectedQueueFromServer = createAction(
  SET_SELECTED_QUEUE_FROM_SERVER,
  props<{ queue?: Queue }>()
);

export const syncSpecificQueueInTable = createAction(
  SYNC_SPECIFIC_QUEUE_IN_TABLE,
  props<{ queue?: Queue }>()
);

export const deleteQueue = createAction(
  DELETE_QUEUE,
  props<{ queue: Queue }>()
);

// export class GetQueuesTasks implements ISmAction {
//   type = GET_QUEUES_TASKS;
//   public payload: { queues: Queue };
//
//   constructor(queues: Queue) {
//     this.payload = {queues};
//   }
// }

// export class AddQueuesTasks implements ISmAction {
//   type = ADD_QUEUES_TASKS;
//
//   constructor(public payload: { tasks: Task; queueId: string }) {
//   }
// }

export const moveExperimentToBottomOfQueue = createAction(
  MOVE_EXPERIMENT_TO_BOTTOM_OF_QUEUE,
  props<{ task: string }>()
);

export const moveExperimentToTopOfQueue = createAction(
  MOVE_EXPERIMENT_TO_TOP_OF_QUEUE,
  props<{ task: string }>()
);

export const moveExperimentInQueue = createAction(
  MOVE_EXPERIMENT_IN_QUEUE,
  props<{ task: string; count: number }>()
);

export const removeExperimentFromQueue = createAction(
  REMOVE_EXPERIMENT_FROM_QUEUE,
  props<{ task: string }>()
);

export const moveExperimentToOtherQueue = createAction(
  MOVE_EXPERIMENT_TO_OTHER_QUEUE,
  props<{ task: string; queue: string }>()
);

export const addExperimentToQueue = createAction(
  ADD_EXPERIMENT_TO_QUEUE,
  props<{ task: string; queue: string }>()
);

export const getStats = createAction(
  GET_STATS,
  props<{ maxPoints?: number }>()
);

export const setStats = createAction(
  SET_STATS,
  props<{ data: { wait?: Topic[]; length?: Topic[] } }>()
);

export const setStatsParams = createAction(
  SET_STATS_PARAMS,
  props<{ timeFrame: string }>()
);
