import {createFeatureSelector, createReducer, createSelector, on, ReducerTypes} from '@ngrx/store';
import {Project} from '~/business-logic/model/projects/project';
import {Task} from '~/business-logic/model/tasks/task';
import {User} from '~/business-logic/model/users/user';
import {setRecentExperiments, setRecentProjects} from './common-dashboard.actions';

export interface IRecentTask {
  id?: Task['id'];
  name?: Task['name'];
  user?: User;
  type?: Task['type'];
  status?: Task['status'];
  created?: Task['created'];
  started?: Task['started'];
  completed?: Task['completed'];
  project?: Project;
}

export interface DashboardState {
  recentProjects: Array<Project>;
  recentTasks: Array<IRecentTask>;
}

// Todo remove selectedProjectId
export const dashboardInitState: DashboardState = {
  recentProjects: [],
  recentTasks   : [],
};

export const commonDashboardReducers = [
  on(setRecentProjects, (state, action) => ({...state, recentProjects: action.projects})),
  on(setRecentExperiments, (state, action) => ({...state, recentTasks: action.experiments})),
] as ReducerTypes<DashboardState, any>[];

export const commonDashboardReducer = createReducer(
  dashboardInitState,
  ...commonDashboardReducers
);

export const selectDashboard      = createFeatureSelector<DashboardState>('dashboard');
export const selectRecentProjects = createSelector(selectDashboard, (state: DashboardState): Array<Project> => state ? state.recentProjects : []);
export const selectRecentTasks    = createSelector(selectDashboard, (state: DashboardState): Array<IRecentTask> => state ? state.recentTasks : []);
