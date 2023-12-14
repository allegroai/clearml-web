import {createFeatureSelector, createSelector} from '@ngrx/store';
import {SET_QUEUES_FOR_ENQUEUE, SET_TASK_FOR_ENQUEUE} from './select-queue.actions';
import {Queue} from '../../../../../business-logic/model/queues/queue';
import {Task} from '../../../../../business-logic/model/tasks/task';

export interface ISelectQueueState {
  queues: Array<Queue>;
  tasks: Task[];
}

const selectQueueInitState: ISelectQueueState = {
  queues: null,
  tasks: null
};


export function selectQueueReducer<ActionReducer>(state: ISelectQueueState = selectQueueInitState, action): ISelectQueueState {
  switch (action.type) {
    case SET_QUEUES_FOR_ENQUEUE:
      return {...state, queues: action.payload.queues};
    case SET_TASK_FOR_ENQUEUE:
      return {...state, tasks: action.payload.task};
    default:
      return state;
  }
}


export const queues = createFeatureSelector<ISelectQueueState>('selectQueue');
export const selectQueuesList = createSelector(queues, (state) => state ? state.queues : []);
export const selectTaskForEnqueue = createSelector(queues, (state) => state ? state.tasks : []);

