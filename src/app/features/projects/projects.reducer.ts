import {on, createReducer, createSelector} from '@ngrx/store';
import {
  commonProjectsInitState,
  commonProjectsReducers,
  CommonProjectsState, CommonReadyForDeletion
} from '@common/projects/common-projects.reducer';
import {setProjectReadyForDeletion} from '~/features/projects/projects.actions';

export type ProjectReadyForDeletion = CommonReadyForDeletion;

export interface ProjectsState extends CommonProjectsState {

  projectReadyForDeletion: ProjectReadyForDeletion;
}


export const projectsReducer = createReducer(
  commonProjectsInitState,
  on(setProjectReadyForDeletion, (state, action): ProjectsState => ({
    ...state,
    projectReadyForDeletion: {
      ...state.projectReadyForDeletion,
      ...action.readyForDeletion
    }
  })),
  ...commonProjectsReducers
);

export const projects = state => state.projects as ProjectsState;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const selectShowHidden = createSelector(projects, (state) => false);
