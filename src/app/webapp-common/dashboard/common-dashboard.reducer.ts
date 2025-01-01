import {ActionCreator, createFeatureSelector, createReducer, createSelector, on, ReducerTypes} from '@ngrx/store';
import {Project} from '~/business-logic/model/projects/project';
import {Task} from '~/business-logic/model/tasks/task';
import {User} from '~/business-logic/model/users/user';
import {setRecentExperiments, setRecentProjects, setRecentReports} from './common-dashboard.actions';
import {IReport} from '@common/reports/reports.consts';

export interface IRecentTask extends Omit<Task, 'user' | 'project'> {
  user?: User;
  project?: Project;
}

export interface DashboardState {
  recentProjects: Project[];
  recentTasks: IRecentTask[];
  reports: IReport[];
}

// Todo remove selectedProjectId
export const dashboardInitState: DashboardState = {
  recentProjects: null,
  recentTasks: null,
  reports: null,
};

export const commonDashboardReducers = [
  on(setRecentProjects, (state, action) => ({...state, recentProjects: action.projects})),
  on(setRecentExperiments, (state, action) => ({...state, recentTasks: action.experiments})),
  on(setRecentReports, (state, action): DashboardState => ({...state, reports: action.reports}))
] as ReducerTypes<DashboardState, ActionCreator[]>[];

export const commonDashboardReducer = createReducer(
  dashboardInitState,
  ...commonDashboardReducers
);

export const selectDashboard      = createFeatureSelector<DashboardState>('dashboard');
export const selectRecentProjects = createSelector(selectDashboard, state => state.recentProjects);
export const selectRecentProjectsCount = createSelector(selectRecentProjects , projects => projects?.length);
export const selectRecentTasks    = createSelector(selectDashboard, state => state.recentTasks);
export const selectRecentReports    = createSelector(selectDashboard, state => state.reports);
