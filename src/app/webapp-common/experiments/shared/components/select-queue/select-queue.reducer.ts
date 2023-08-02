import {createFeatureSelector, createReducer, createSelector, on} from '@ngrx/store';
import {setQueuesForEnqueue, setTaskForEnqueue} from './select-queue.actions';
import {Queue} from '~/business-logic/model/queues/queue';
import {Task} from '~/business-logic/model/tasks/task';

export interface ISelectQueueState {
  queues: Array<Queue>;
  tasks: Task[];
}

const selectQueueInitState: ISelectQueueState = {
  queues: null,
  tasks: null
};

export const selectQueueReducer = createReducer(
  selectQueueInitState,
  on(setQueuesForEnqueue, (state, action): ISelectQueueState => ({...state, queues: action.queues})),
  on(setTaskForEnqueue, (state, action): ISelectQueueState => ({...state, tasks: action.tasks})),
);

export const queues = createFeatureSelector<ISelectQueueState>('selectQueue');
export const selectQueuesList = createSelector(queues, (state) => state ? state.queues : []);
export const selectTaskForEnqueue = createSelector(queues, (state) => state ? state.tasks : []);

