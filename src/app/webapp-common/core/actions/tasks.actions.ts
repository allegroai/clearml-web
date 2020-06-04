import {TASKS_ACTIONS} from '../../../app.constants';
import {ISmAction} from '../models/actions';
import {Action} from '@ngrx/store';
import {Task} from '../../../business-logic/model/tasks/task';

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

// new actions

export class SetTasksData implements ISmAction {
  type = TASKS_ACTIONS.SET_TASKS_DATA;
  public payload: { tasksData: Array<Task> };

  constructor(tasksData: Array<Task>) {
    this.payload = {tasksData};
  }
}

export class GetTaskForMetricsPage implements ISmAction {
  public type = TASKS_ACTIONS.GET_TASK_FOR_METRICS;
  public payload: { taskId: string };

  constructor(taskId: string) {
    this.payload = {taskId};
  }
}

export class SetSelectedTask implements ISmAction {
  public type = TASKS_ACTIONS.SET_SELECTED_TASK;
  public payload: { task: Task };

  constructor(task: Task) {
    this.payload = {task};
  }
}

export class SetTaskInTable implements ISmAction {
  public type = TASKS_ACTIONS.SET_TASK_IN_TABLE;
  public payload: { task: Task };
  constructor(task: Task) {
    this.payload = {task};
  }
}

export class SetTaskMetric implements ISmAction {
  public type = TASKS_ACTIONS.SET_TASK_FOR_METRICS;
  public payload: { task: Task };

  constructor(task: Task) {
    this.payload = {task};
  }
}

export class UpdateTask implements ISmAction {
  public type = TASKS_ACTIONS.UPDATE_TASK;
  public payload: { id: string; changes: Partial<Task> };

  constructor(id: string, changes: Partial<Task>) {
    this.payload = {id, changes};
  }
}
