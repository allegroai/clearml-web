import {createFeatureSelector, createReducer, createSelector, on} from '@ngrx/store';
import {setCreationStatus, resetState} from './project-dialog.actions';

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

export const projectDialogReducer = createReducer(
  createProjectInitState,
  on(setCreationStatus, (state, action): ICreateProjectDialog => ({...state, creationStatus: action.status})),
  on(resetState, (): ICreateProjectDialog => ({...createProjectInitState})),
);
