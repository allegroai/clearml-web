import {CreationStatusEnum} from './queue-create-dialog.reducer';
import {ISmAction} from '../../core/models/actions';
import {Queue} from '../../../business-logic/model/queues/queue';
import {QueuesUpdateRequest} from '../../../business-logic/model/queues/queuesUpdateRequest';
import {QueuesCreateRequest} from '../../../business-logic/model/queues/queuesCreateRequest';

const CREATE_QUEUE_DIALOG_PREFIX = 'CREATE_QUEUE_DIALOG_';

export const CREATE_QUEUE_ACTIONS = {
  GET_QUEUES         : CREATE_QUEUE_DIALOG_PREFIX + 'GET_QUEUES',
  SET_QUEUES         : CREATE_QUEUE_DIALOG_PREFIX + 'SET_QUEUES',
  RESET_STATE        : CREATE_QUEUE_DIALOG_PREFIX + 'RESET_STATE',
  CREATE_NEW_QUEUE   : CREATE_QUEUE_DIALOG_PREFIX + 'CREATE_NEW_QUEUE',
  UPDATE_QUEUE       : CREATE_QUEUE_DIALOG_PREFIX + 'UPDATE_QUEUE',
  SET_CREATION_STATUS: CREATE_QUEUE_DIALOG_PREFIX + 'SET_CREATION_STATUS',
};


export class GetQueues implements ISmAction {
  readonly type = CREATE_QUEUE_ACTIONS.GET_QUEUES;

  constructor() {
  }
}

export class SetQueues implements ISmAction {
  readonly type = CREATE_QUEUE_ACTIONS.SET_QUEUES;
  public payload: { queues: Array<Queue> };

  constructor(queues: Array<Queue>) {
    this.payload = {queues};
  }
}

export class ResetState implements ISmAction {
  readonly type = CREATE_QUEUE_ACTIONS.RESET_STATE;

  constructor() {
  }
}

export class CreateNewQueue implements ISmAction {
  readonly type = CREATE_QUEUE_ACTIONS.CREATE_NEW_QUEUE;

  constructor(public payload: QueuesCreateRequest) {
  }
}

export class UpdateQueue implements ISmAction {
  readonly type = CREATE_QUEUE_ACTIONS.UPDATE_QUEUE;

  constructor(public payload: QueuesUpdateRequest) {
  }
}

export class SetNewQueueCreationStatus implements ISmAction {
  readonly type = CREATE_QUEUE_ACTIONS.SET_CREATION_STATUS;
  public payload: { creationStatus: CreationStatusEnum };

  constructor(creationStatus: CreationStatusEnum) {
    this.payload = {creationStatus};
  }
}
