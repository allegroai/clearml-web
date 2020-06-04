import {ISmAction} from '../core/models/actions';
import {ProjectsGetAllRequest} from '../../business-logic/model/projects/projectsGetAllRequest';
import {CARDS_IN_ROW, DASHBOARD_ACTIONS} from './common-dashboard.const';
import {Project} from '../../business-logic/model/projects/project';
import {ProjectsCreateRequest} from '../../business-logic/model/projects/projectsCreateRequest';
import {IRecentTask} from './common-dashboard.reducer';
import {ProjectsGetAllExRequest} from '../../business-logic/model/projects/projectsGetAllExRequest';


export class GetRecentProjects implements ISmAction {
  public type = DASHBOARD_ACTIONS.GET_RECENT_PROJECTS;
  public payload: { getAllFilter: ProjectsGetAllRequest };

  constructor(getAllFilter: any = {stats_for_state: ProjectsGetAllExRequest.StatsForStateEnum.Active, include_stats: true, order_by: ['-last_update'], page: 0, page_size: CARDS_IN_ROW}) {
    this.payload = {getAllFilter};
  }
}

export class SetRecentProjects implements ISmAction {
  public type = DASHBOARD_ACTIONS.SET_RECENT_PROJECTS;
  public payload: { projects: Array<Project> };

  constructor(projects: Array<Project>) {
    this.payload = {projects};
  }
}

export class GetRecentTasks implements ISmAction {
  type = DASHBOARD_ACTIONS.GET_RECENT_TASKS;
}

export class SetRecentTasks implements ISmAction {
  type = DASHBOARD_ACTIONS.SET_RECENT_TASKS;
  public payload: { tasks: Array<IRecentTask> };

  constructor(tasks: Array<IRecentTask>) {
    this.payload = {tasks};
  }
}

export class CreateProjectFromDashboard implements ISmAction {
  public type = DASHBOARD_ACTIONS.CREATE_PROJECT;
  public payload: { project: ProjectsCreateRequest };

  constructor(project: ProjectsCreateRequest) {
    this.payload = {project};
  }
}



