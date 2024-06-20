import {ActionCreator, createFeatureSelector, createReducer, createSelector, on, ReducerTypes} from '@ngrx/store';
import {Project} from '~/business-logic/model/projects/project';
import {Task} from '~/business-logic/model/tasks/task';
import {User} from '~/business-logic/model/users/user';
import {setRecentExperiments, setRecentProjects} from './common-dashboard.actions';

export interface IRecentTask extends Omit<Task, 'user' | 'project'> {
  user?: User;
  project?: Project;
}

export interface DashboardState {
  recentProjects: Array<Project>;
  recentTasks: Array<IRecentTask>;
}

// Todo remove selectedProjectId
export const dashboardInitState: DashboardState = {
  recentProjects: null,
  recentTasks   : null,
};

export const commonDashboardReducers = [
  on(setRecentProjects, (state, action) => ({...state, recentProjects: action.projects})),
  on(setRecentExperiments, (state, action) => ({...state, recentTasks: action.experiments})),
] as ReducerTypes<DashboardState, ActionCreator[]>[];

export const commonDashboardReducer = createReducer(
  dashboardInitState,
  ...commonDashboardReducers
);

export const selectDashboard      = createFeatureSelector<DashboardState>('dashboard');
export const selectRecentProjects = createSelector(selectDashboard, state => state.recentProjects);
export const selectRecentProjectsCount = createSelector(selectRecentProjects , projects => projects?.length);
export const selectRecentTasks    = createSelector(selectDashboard, state => state.recentTasks);
