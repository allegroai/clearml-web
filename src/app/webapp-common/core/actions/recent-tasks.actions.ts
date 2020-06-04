import {ISmAction} from '../models/actions';
import {RECENT_TASKS_ACTIONS} from '../../../app.constants';

export class SetRecentTasks implements ISmAction {
  type = RECENT_TASKS_ACTIONS.SET_RECENT_TASKS;
  public payload: { tasks: Array<any> };

  constructor(tasks: Array<any>) {
    this.payload = {tasks};
  }
}

