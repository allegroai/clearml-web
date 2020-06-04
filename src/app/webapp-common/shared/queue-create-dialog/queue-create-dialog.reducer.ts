import {createFeatureSelector, createSelector} from '@ngrx/store';
import {CREATE_QUEUE_ACTIONS} from './queue-create-dialog.actions';
import {Queue} from '../../../business-logic/model/queues/queue';

export type CreationStatusEnum = 'success' | 'failed' | 'inProgress';
export const CREATION_STATUS = {
  SUCCESS    : 'success' as CreationStatusEnum,
  FAILED     : 'failed' as CreationStatusEnum,
  IN_PROGRESS: 'inProgress' as CreationStatusEnum,
};

export interface ICreateQueueDialog {
  queues: Array<Queue>;
  creationStatus: CreationStatusEnum;
}

const createQueueInitState: ICreateQueueDialog = {
  queues        : [],
  creationStatus: null
};

export const selectCreateQueueDialog = createFeatureSelector<ICreateQueueDialog>('queueCreateDialog');
export const selectQueues            = createSelector(selectCreateQueueDialog, (state): Array<Queue> => state.queues);
export const selectCreationStatus    = createSelector(selectCreateQueueDialog, (state): CreationStatusEnum => state.creationStatus);

export function queueCreateDialogReducer<ActionReducer>(state: ICreateQueueDialog = createQueueInitState, action): ICreateQueueDialog {
  switch (action.type) {
    case CREATE_QUEUE_ACTIONS.SET_CREATION_STATUS:
      return {...state, creationStatus: action.payload.creationStatus};
    case CREATE_QUEUE_ACTIONS.SET_QUEUES:
      return {...state, queues: action.payload.queues};
    case CREATE_QUEUE_ACTIONS.RESET_STATE:
      return {...createQueueInitState};
    default:
      return state;
  }
}
