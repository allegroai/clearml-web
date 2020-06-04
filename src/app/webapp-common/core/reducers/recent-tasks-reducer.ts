import {RECENT_TASKS_ACTIONS} from '../../../app.constants';
import {SetRecentTasks} from '../actions/recent-tasks.actions';
import {Task} from '../../../business-logic/model/tasks/task';

const initTasks = {
  data : <Array<Partial<Task>>>[],
};

export const recentTasks       = state => state.recentTasks;

export function recentTasksReducer(state = initTasks, action: SetRecentTasks) {
  switch (action.type) {
    case RECENT_TASKS_ACTIONS.SET_RECENT_TASKS:
      return {...state, data: action.payload.tasks};
    default:
      return state;
  }
}
