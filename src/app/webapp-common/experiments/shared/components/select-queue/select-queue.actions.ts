import {Action} from '@ngrx/store';
import {Queue} from '../../../../../business-logic/model/queues/queue';
import {Task} from '../../../../../business-logic/model/tasks/task';

export const SELECT_QUEUE_PREFIX = 'SELECT_QUEUE_';

export const GET_QUEUES_FOR_ENQUEUE = SELECT_QUEUE_PREFIX + 'GET_QUEUES_FOR_ENQUEUE';
export const GET_TASK_FOR_ENQUEUE = SELECT_QUEUE_PREFIX + 'GET_TASK_FOR_ENQUEUE';
export const SET_TASK_FOR_ENQUEUE = SELECT_QUEUE_PREFIX + 'SET_TASK_FOR_ENQUEUE';
export const SET_QUEUES_FOR_ENQUEUE = SELECT_QUEUE_PREFIX + 'SET_QUEUES_FOR_ENQUEUE';

export class GetQueuesForEnqueue implements Action {
  readonly type = GET_QUEUES_FOR_ENQUEUE;
}

export class GetTaskForEnqueue implements Action {
  readonly type = GET_TASK_FOR_ENQUEUE;
  public payload: { taskId: string };

  constructor(taskId: string) {
    this.payload = {taskId};
  }
}

export class SetTaskForEnqueue implements Action {
  readonly type = SET_TASK_FOR_ENQUEUE;
  public payload: { task: Task };

  constructor(task: Task) {
    this.payload = {task};
  }
}


export class SetQueuesForEnqueue implements Action {
  readonly type = SET_QUEUES_FOR_ENQUEUE;
  public payload: { queues: Array<Queue> };

  constructor(queues: Array<Queue>) {
    this.payload = {queues};
  }
}
