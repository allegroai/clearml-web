import {Project} from '../../../business-logic/model/projects/project';
import {createFeatureSelector, createSelector} from '@ngrx/store';
import {CREATE_PROJECT_ACTIONS} from './project-create-dialog.actions';
import {sortBy} from 'lodash/fp';

export type CreationStatusEnum = 'success' | 'failed' | 'inProgress';
export const CREATION_STATUS = {
  SUCCESS    : 'success' as CreationStatusEnum,
  FAILED     : 'failed' as CreationStatusEnum,
  IN_PROGRESS: 'inProgress' as CreationStatusEnum,
};

export interface ICreateProjectDialog {
  projects: Array<Project>;
  creationStatus: CreationStatusEnum;
}

const createProjectInitState: ICreateProjectDialog = {
  projects      : [],
  creationStatus: null
};

export const selectCreateProjectDialog = createFeatureSelector<ICreateProjectDialog>('projectCreateDialog');
export const selectProjects            = createSelector(selectCreateProjectDialog, (state): Array<Project> => state.projects);
export const selectCreationStatus      = createSelector(selectCreateProjectDialog, (state): CreationStatusEnum => state.creationStatus);

export function projectCreateDialogReducer<ActionReducer>(state: ICreateProjectDialog = createProjectInitState, action): ICreateProjectDialog {
  switch (action.type) {
    case CREATE_PROJECT_ACTIONS.SET_CREATION_STATUS:
      return {...state, creationStatus: action.payload.creationStatus};
    case CREATE_PROJECT_ACTIONS.SET_PROJECTS:
      return {...state, projects: sortBy('name', action.payload.projects)};
    case CREATE_PROJECT_ACTIONS.RESET_STATE:
      return {...createProjectInitState};
    default:
      return state;
  }
}
