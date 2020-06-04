import {Injectable} from '@angular/core';
import {ApiProjectsService} from '../../business-logic/api-services/projects.service';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {RequestFailed} from '../core/actions/http.actions';
import {ActiveLoader, AddMessage, DeactiveLoader} from '../core/actions/layout.actions';
import {CreateProjectFromDashboard, GetRecentProjects, SetRecentProjects, SetRecentTasks} from './common-dashboard.actions';
import {CARDS_IN_ROW, DASHBOARD_ACTIONS} from './common-dashboard.const';
import {MESSAGES_SEVERITY} from '../../app.constants';
import {ApiTasksService} from '../../business-logic/api-services/tasks.service';
import {IRecentTask} from './common-dashboard.reducer';
import {ProjectsGetAllExRequest} from '../../business-logic/model/projects/projectsGetAllExRequest';
import {catchError, flatMap, map, switchMap} from 'rxjs/operators';

@Injectable()
export class CommonDashboardEffects {
  constructor(private actions: Actions, private projectsApi: ApiProjectsService, private tasksApi: ApiTasksService) {
  }

  @Effect()
  activeLoader = this.actions.pipe(
    ofType(DASHBOARD_ACTIONS.GET_RECENT_PROJECTS, DASHBOARD_ACTIONS.GET_RECENT_PROJECTS, DASHBOARD_ACTIONS.GET_RECENT_TASKS, DASHBOARD_ACTIONS.CREATE_PROJECT),
    map(action => new ActiveLoader(action.type))
  );

  @Effect()
  getRecentProjects = this.actions.pipe(
    ofType<GetRecentProjects>(DASHBOARD_ACTIONS.GET_RECENT_PROJECTS),
    flatMap((action) => this.projectsApi.projectsGetAllEx(action.payload.getAllFilter)
      .pipe(
        flatMap(res => [new SetRecentProjects(res.projects), new DeactiveLoader(action.type)]),
        catchError(error => [new DeactiveLoader(action.type), new AddMessage(MESSAGES_SEVERITY.ERROR, 'Fetching projects failed'), new RequestFailed(error)])
      )
    )
  );

  @Effect()
  getRecentTasks = this.actions.pipe(
    ofType(DASHBOARD_ACTIONS.GET_RECENT_TASKS),
    switchMap(action => this.tasksApi.tasksGetAllEx({
        page       : 0,
        page_size  : 5,
        order_by   : ['-last_update'],
        status     : ['published', 'closed', 'failed', 'stopped', 'in_progress', 'completed'],
        type       : [],
        only_fields: ['type', 'status', 'created', 'name', 'id', 'last_update', 'started', 'project.name'],
        system_tags: ['-archived']
      })
        .pipe(
          flatMap(res => [new SetRecentTasks(res.tasks as Array<IRecentTask>), new DeactiveLoader(action.type)]),
          catchError(err => [new RequestFailed(err), new AddMessage(MESSAGES_SEVERITY.ERROR, 'Fetching recent experiments failed'), new DeactiveLoader(action.type)])
        )
    )
  );

  @Effect()
  createProject = this.actions.pipe(
    ofType<CreateProjectFromDashboard>(DASHBOARD_ACTIONS.CREATE_PROJECT),
    flatMap((action) => this.projectsApi.projectsCreate(action.payload.project)
      .pipe(
        flatMap(res => [
          new GetRecentProjects({stats_for_state: ProjectsGetAllExRequest.StatsForStateEnum.Active, order_by: ['-last_update'], page: 0, page_size: CARDS_IN_ROW}),
          new DeactiveLoader(action.type),
          new AddMessage(MESSAGES_SEVERITY.SUCCESS, 'Project Created Successfully')]),
        catchError(error => [new DeactiveLoader(action.type), new RequestFailed(error),
          new AddMessage(MESSAGES_SEVERITY.ERROR, 'Project Created Failed')])
      )
    )
  );
}
