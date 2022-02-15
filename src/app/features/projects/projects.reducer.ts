import {createFeatureSelector, createSelector} from '@ngrx/store';
import {
  CommonProjectReadyForDeletion,
  commonProjectsInitState,
  commonProjectsReducer,
  ICommonProjectsState
} from '@common/projects/common-projects.reducer';
import {PROJECTS_ACTIONS} from '@common/projects/common-projects.consts';
import {selectSelectedProject} from '@common/core/reducers/projects.reducer';

export type IProjectReadyForDeletion = CommonProjectReadyForDeletion;

export interface IProjectsState extends ICommonProjectsState {

  projectReadyForDeletion: IProjectReadyForDeletion;
}

const projectsInitState: IProjectsState = {
        ...commonProjectsInitState,
        projectReadyForDeletion: {
          project: null, experiments: null, models: null
        }
      };

export const projectsReducer = (state: IProjectsState = projectsInitState, action): IProjectsState => {
  switch (action.type) {
    case PROJECTS_ACTIONS.CHECK_PROJECT_FOR_DELETION:
      return {...state, projectReadyForDeletion: {...projectsInitState.projectReadyForDeletion, project: action.payload.project}};
    case PROJECTS_ACTIONS.RESET_READY_TO_DELETE:
      return {...state, projectReadyForDeletion: projectsInitState.projectReadyForDeletion};
    case PROJECTS_ACTIONS.SET_PROJECT_READY_FOR_DELETION:
      return {...state, projectReadyForDeletion: {...state.projectReadyForDeletion, ...action.payload.readyForDeletion}};
    default:
      return commonProjectsReducer(state, action);
  }
};

export const projects = state => state.projects as IProjectsState;

export const selectShowHidden = createSelector(projects, () => false);
