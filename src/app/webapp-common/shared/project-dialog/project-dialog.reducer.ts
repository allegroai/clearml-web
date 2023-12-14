import {createFeatureSelector, createSelector} from '@ngrx/store';
import {CREATE_PROJECT_ACTIONS} from './project-dialog.actions';

export type CreationStatusEnum = 'success' | 'failed' | 'inProgress';
export const CREATION_STATUS = {
  SUCCESS    : 'success' as CreationStatusEnum,
  FAILED     : 'failed' as CreationStatusEnum,
  IN_PROGRESS: 'inProgress' as CreationStatusEnum,
};

export interface ICreateProjectDialog {
  creationStatus: CreationStatusEnum;
}

const createProjectInitState: ICreateProjectDialog = {
  creationStatus: null
};

export const selectCreateProjectDialog = createFeatureSelector<ICreateProjectDialog>('projectCreateDialog');
export const selectCreationStatus      = createSelector(selectCreateProjectDialog, (state): CreationStatusEnum => state.creationStatus);

export function projectDialogReducer<ActionReducer>(state: ICreateProjectDialog = createProjectInitState, action): ICreateProjectDialog {
  switch (action.type) {
    case CREATE_PROJECT_ACTIONS.SET_CREATION_STATUS:
      return {...state, creationStatus: action.payload.creationStatus};
    case CREATE_PROJECT_ACTIONS.RESET_STATE:
      return {...createProjectInitState};
    default:
      return state;
  }
}
