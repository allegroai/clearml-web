import {on, createReducer, createSelector} from '@ngrx/store';
import {
  CommonProjectReadyForDeletion,
  commonProjectsInitState,
  commonProjectsReducers,
  ICommonProjectsState
} from '@common/projects/common-projects.reducer';
import {checkProjectForDeletion, resetReadyToDelete, setProjectReadyForDeletion} from '@common/projects/common-projects.actions';

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

export const projectsReducer = createReducer(
  projectsInitState,
  on(checkProjectForDeletion, (state, action) => ({
    ...state,
    projectReadyForDeletion: {
      ...projectsInitState.projectReadyForDeletion,
      project: action.project
    }
  })),
  on(resetReadyToDelete, state => ({...state, projectReadyForDeletion: projectsInitState.projectReadyForDeletion})),
  on(setProjectReadyForDeletion, (state, action) => ({
    ...state,
    projectReadyForDeletion: {
      ...state.projectReadyForDeletion,
      ...action.readyForDeletion
    }
  })),
  ...commonProjectsReducers
);

export const projects = state => state.projects as IProjectsState;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const selectShowHidden = createSelector(projects, (state) => false);
