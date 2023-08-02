import {setRecentTasks} from '../actions/recent-tasks.actions';
import {Task} from '~/business-logic/model/tasks/task';
import {createReducer, on} from '@ngrx/store';

const initTasks = {
  data : <Array<Partial<Task>>>[],
};

export const recentTasks       = state => state.recentTasks;

export const recentTasksReducer = createReducer(
  initTasks,
  on(setRecentTasks, (state, action) => ({...state, data: action.tasks}))
);
