import {TASKS_ACTIONS} from '../../../app.constants';
import {ISmAction} from '../models/actions';
import {Action} from '@ngrx/store';

export class StopTask implements ISmAction {
  type           = TASKS_ACTIONS.STOP_TASK;
  public payload = {task: ''};

  constructor(taskId: string) {
    this.payload.task = taskId;
  }
}

export class SetTaskInListAndInSelectedTask implements Action {
  type = TASKS_ACTIONS.TASKS_OPTIMISTIC;
  public payload: { task: string };

  constructor(taskId: string, field: string, value) {
    this.payload = {
      task   : taskId,
      [field]: value
    };
  }
}
