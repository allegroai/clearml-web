import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {ApiProjectsService} from '../../business-logic/api-services/projects.service';
import {RequestFailed} from '../core/actions/http.actions';
import {MESSAGES_SEVERITY} from '../../app.constants';
import {ActiveLoader, AddMessage, DeactiveLoader, SetServerError} from '../core/actions/layout.actions';
import {
  AddToProjectsList,
  CheckProjectForDeletion,
  DeleteProject,
  GetAllProjects,
  ProjectUpdated,
  SelectAllProjects,
  SetCurrentProjectsPage,
  SetNoMoreProjects,
  SetProjectReadyForDeletion,
  SetProjectsOrderBy,
  SetProjectsSearchQuery,
  UpdateProjectPartial
} from './common-projects.actions';
import {selectProjectsOrderBy, selectProjectsPage, selectProjectsSearchQuery, selectProjectsSortOrder} from './common-projects.reducer';
import {Store} from '@ngrx/store';
import {TABLE_SORT_ORDER} from '../shared/ui-components/data/table/table.consts';
import {ProjectsGetAllExRequest} from '../../business-logic/model/projects/projectsGetAllExRequest';
import {escapeRegex} from '../shared/utils/shared-utils';
import {catchError, flatMap, map, switchMap, withLatestFrom} from 'rxjs/operators';
import {get} from 'lodash/fp';
import {ApiTasksService} from '../../business-logic/api-services/tasks.service';
import {ApiModelsService} from '../../business-logic/api-services/models.service';
import {IProjectsState} from '../../features/projects/projects.reducer';
import {PROJECTS_ACTIONS} from './common-projects.consts';
import {MatDialog} from '@angular/material/dialog';

@Injectable()
export class CommonProjectsEffects {

  constructor(
    private actions: Actions, public projectsApi: ApiProjectsService,
    public experimentsApi: ApiTasksService, public modelsApi: ApiModelsService,
    private store: Store<IProjectsState>
  ) {}

  @Effect()
  activeLoader = this.actions.pipe(
    ofType(PROJECTS_ACTIONS.PROJECT_UPDATED, PROJECTS_ACTIONS.GET_PROJECTS, PROJECTS_ACTIONS.CREATE_PROJECT, PROJECTS_ACTIONS.GET_PROJECT_BY_ID, PROJECTS_ACTIONS.DELETE_PROJECT),
    map(action => new ActiveLoader(action.type))
  );

  @Effect()
  updateProject = this.actions.pipe(
    ofType<ProjectUpdated>(PROJECTS_ACTIONS.PROJECT_UPDATED),
    flatMap((action) => this.projectsApi.projectsUpdate(action.payload.updatedData)
      .pipe(
        flatMap(res => [new DeactiveLoader(action.type), new UpdateProjectPartial({id: action.payload.updatedData.project, changes: action.payload.updatedData})]),
        catchError(error => [new DeactiveLoader(action.type), new RequestFailed(error),
          new SetServerError(error, undefined, get('error.meta.result_subcode', error) === 800 ?
            'Name should be 3 characters long' : get('error.meta.result_subcode', error) === 801 ? 'Name already exists in this project' : undefined)])
      )
    )
  );

  @Effect()
  getAllProjects = this.actions.pipe(
    ofType<GetAllProjects>(PROJECTS_ACTIONS.GET_PROJECTS),
    withLatestFrom(this.store.select(selectProjectsOrderBy), this.store.select(selectProjectsSortOrder), this.store.select(selectProjectsSearchQuery), this.store.select(selectProjectsPage)),
    switchMap(([action, orderBy, sortOrder, searchQuery, page]) => {
      const pageSize = 12;
      return this.projectsApi.projectsGetAllEx({
        stats_for_state: ProjectsGetAllExRequest.StatsForStateEnum.Active,
        include_stats  : true,
        page           : page,
        page_size      : pageSize,
        order_by       : ['featured', sortOrder === TABLE_SORT_ORDER.DESC ? '-' + orderBy : orderBy],
        _any_          : {
          pattern: searchQuery ? escapeRegex(searchQuery) : '',
          fields : ['id', 'name', 'description', 'system_tags']
        },
        ...action.payload.getAllFilter
      } as any)
        .pipe(
          flatMap(res => [
            new AddToProjectsList(res.projects),
            new DeactiveLoader(action.type),
            new SetCurrentProjectsPage(page + 1),
            new SetNoMoreProjects(res.projects.length < pageSize)]),
          catchError(error => [new DeactiveLoader(action.type), new RequestFailed(error)])
        );
    })
  );

  @Effect()
  setProjectsOrderBy = this.actions.pipe(
    ofType<SetProjectsOrderBy>(PROJECTS_ACTIONS.SET_ORDER_BY),
    flatMap(action => [new GetAllProjects()])
  );

  @Effect()
  setProjectsSearchQuery = this.actions.pipe(
    ofType<SetProjectsSearchQuery>(PROJECTS_ACTIONS.SET_SEARCH_QUERY),
    flatMap(action => [new GetAllProjects()])
  );

  @Effect()
  checkIfProjectExperiments = this.actions.pipe(
    ofType<CheckProjectForDeletion>(PROJECTS_ACTIONS.CHECK_PROJECT_FOR_DELETION),
    flatMap((action) => this.experimentsApi.tasksGetAllEx({project: [action.payload.projectId], only_fields: ['name'], system_tags: ['-archived']})
      .pipe(flatMap(res => [new SetProjectReadyForDeletion({experiments: res.tasks.length})]))
    )
  );

  @Effect()
  checkIfProjectModels = this.actions.pipe(
    ofType<CheckProjectForDeletion>(PROJECTS_ACTIONS.CHECK_PROJECT_FOR_DELETION),
    flatMap((action) =>
      this.modelsApi.modelsGetAllEx({project: [action.payload.projectId], only_fields: ['name'], system_tags: ['-archived']})
        .pipe(flatMap(res => [new SetProjectReadyForDeletion({models: res.models.length})]))
    )
  );

  @Effect()
  deleteProject = this.actions.pipe(
    ofType<DeleteProject>(PROJECTS_ACTIONS.DELETE_PROJECT),
    flatMap((action) => this.projectsApi.projectsDelete({project: action.payload.projectId})
      .pipe(
        flatMap(res => [
          new GetAllProjects({}),
          new SelectAllProjects(),
          new DeactiveLoader(action.type),
          new AddMessage(MESSAGES_SEVERITY.SUCCESS, 'Project Deleted')]),
        catchError(error => [new DeactiveLoader(action.type), new RequestFailed(error),
          new SetServerError(error, null, 'Failed to delete project. Only empty projects can be deleted')
        ])
      )
    )
  );
}
