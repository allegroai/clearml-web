import {createFeatureSelector, createSelector} from '@ngrx/store';
import {Project} from '../../business-logic/model/projects/project';
import {DASHBOARD_ACTIONS} from './common-dashboard.const';
import {Task} from '../../business-logic/model/tasks/task';
import {User} from '../../business-logic/model/users/user';
import {setInviteInfo} from './common-dashboard.actions';
import {LoginGetInviteInfoResponse} from '../../business-logic/model/login/loginGetInviteInfoResponse';

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

export interface IDashboardState {
  recentProjects: Array<Project>;
  recentTasks: Array<IRecentTask>;
  inviteInfo: LoginGetInviteInfoResponse;
}

// Todo remove selectedProjectId
export const dashboardInitState: IDashboardState = {
  recentProjects: [],
  recentTasks   : [],
  inviteInfo: null
};


export function commonDashboardReducer<ActionReducer>(state: IDashboardState = dashboardInitState, action): IDashboardState {

  switch (action.type) {
    case DASHBOARD_ACTIONS.SET_RECENT_TASKS:
      return {...state, recentTasks: action.payload.tasks};
    case DASHBOARD_ACTIONS.SET_RECENT_PROJECTS:
      return {...state, recentProjects: action.payload.projects};

      // SHOULD not BE in COMMON
    case setInviteInfo.type:
      return {...state, inviteInfo: action.inviteInfo};
    default:
      return state;
  }
}

export const selectDashboard      = createFeatureSelector<IDashboardState>('dashboard');
export const selectRecentProjects = createSelector(selectDashboard, (state: IDashboardState): Array<Project> => state ? state.recentProjects : []);
export const selectRecentTasks    = createSelector(selectDashboard, (state: IDashboardState): Array<IRecentTask> => state ? state.recentTasks : []);

// SHOULD not BE in COMMON
export const selectInviteInfo    = createSelector(selectDashboard, (state: IDashboardState): LoginGetInviteInfoResponse => state ? state.inviteInfo : null);


