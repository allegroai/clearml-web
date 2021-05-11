import {Action, createAction, props} from '@ngrx/store';
import {ISmAction} from '../../core/models/actions';
import {Task} from '../../../business-logic/model/tasks/task';
import {Queue} from '../../../business-logic/model/queues/queue';
import {Topic} from '../../shared/utils/statistics';
import {SortMeta} from 'primeng/api';

const queuesPrefix = 'QUEUES_';
export const GET_QUEUES = queuesPrefix + 'GET_QUEUES';
export const SET_QUEUES = queuesPrefix + 'SET_QUEUES';
export const GET_QUEUES_TASKS = queuesPrefix + 'SET_QUEUES_TASKS';
export const SET_QUEUES_TASKS = queuesPrefix + 'SET_QUEUES_TASKS';
export const ADD_QUEUES_TASKS = queuesPrefix + 'ADD_QUEUES_TASKS';
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

export class SetQueues implements Action {
  type = SET_QUEUES;
  public payload: { queues: Array<Queue> };

  constructor(queues: Array<Queue>) {
    this.payload = {queues};
  }
}

export const queuesTableSortChanged = createAction(
  QUEUES_TABLE_SORT_CHANGED,
  props<{ colId: string; isShift: boolean }>()
);


export const queuesTableSetSort = createAction(
  QUEUES_TABLE_SET_SORT,
  props<{ orders: SortMeta[] }>()
);

export class SetSelectedQueue implements Action {
  type = SET_SELECTED_QUEUE;
  public payload: { queue?: Queue };

  constructor(queue?: Queue) {
    this.payload = {queue};
  }
}

export class RefreshSelectedQueue implements Action {
  type = REFRESH_SELECTED_QUEUE;

}

export class SetSelectedQueueFromServer implements Action {
  type = SET_SELECTED_QUEUE_FROM_SERVER;
  public payload: { queue: Queue };

  constructor(queue: Queue) {
    this.payload = {queue};
  }
}

export class SyncSpecificQueueInTable implements Action {
  type = SYNC_SPECIFIC_QUEUE_IN_TABLE;
  public payload: { queue: Queue };

  constructor(queue: Queue) {
    this.payload = {queue};
  }
}

export class DeleteQueue implements Action {
  type = DELETE_QUEUE;
  public payload: { queue: Queue };

  constructor(queue: Queue) {
    this.payload = {queue};
  }
}

export class GetQueuesTasks implements ISmAction {
  type = GET_QUEUES_TASKS;
  public payload: { queues: Queue };

  constructor(queues: Queue) {
    this.payload = {queues};
  }
}

export class AddQueuesTasks implements ISmAction {
  type = ADD_QUEUES_TASKS;

  constructor(public payload: { tasks: Task; queueId: string }) {
  }
}


export class MoveExperimentToBottomOfQueue implements ISmAction {
  type = MOVE_EXPERIMENT_TO_BOTTOM_OF_QUEUE;

  constructor(public payload: { task: string }) {
  }
}

export class MoveExperimentToTopOfQueue implements ISmAction {
  type = MOVE_EXPERIMENT_TO_TOP_OF_QUEUE;

  constructor(public payload: { task: string }) {
  }
}


export class MoveExperimentInQueue implements ISmAction {
  type = MOVE_EXPERIMENT_IN_QUEUE;

  constructor(public payload: { task: string; count: number }) {
  }
}

export class RemoveExperimentFromQueue implements ISmAction {
  type = REMOVE_EXPERIMENT_FROM_QUEUE;

  constructor(public payload: { task: string }) {
  }
}

export class MoveExperimentToOtherQueue implements ISmAction {
  type = MOVE_EXPERIMENT_TO_OTHER_QUEUE;

  constructor(public payload: { task: string; queue: string }) {
  }
}


export class AddExperimentToQueue implements ISmAction {
  type = ADD_EXPERIMENT_TO_QUEUE;

  constructor(public payload: { task: string; queue: string }) {
  }
}


export class GetStats implements Action {
  type = GET_STATS;

  constructor(public payload: { maxPoints?: number }) {
  }
}

export class SetStats implements Action {
  type = SET_STATS;

  constructor(public payload: { data: { wait?: Topic[]; length?: Topic[] } }) {
  }
}

export class SetStatsParams implements Action {
  type = SET_STATS_PARAMS;

  constructor(public payload: { timeFrame: string }) {
  }
}
