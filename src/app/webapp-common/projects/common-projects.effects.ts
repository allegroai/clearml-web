import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {ApiProjectsService} from '../../business-logic/api-services/projects.service';
import {RequestFailed} from '../core/actions/http.actions';
import {ActiveLoader, DeactiveLoader, SetServerError} from '../core/actions/layout.actions';
import {AddToProjectsList, CheckProjectForDeletion, GetAllProjects, ProjectUpdated, SetCurrentProjectsPage, SetNoMoreProjects, SetProjectReadyForDeletion, SetProjectsOrderBy, setProjectsSearchQuery, UpdateProjectPartial} from './common-projects.actions';
import {selectProjectsOrderBy, selectProjectsPage, selectProjectsSearchQuery, selectProjectsSortOrder} from './common-projects.reducer';
import {Store} from '@ngrx/store';
import {TABLE_SORT_ORDER} from '../shared/ui-components/data/table/table.consts';
import {ProjectsGetAllExRequest} from '../../business-logic/model/projects/projectsGetAllExRequest';
import {escapeRegex} from '../shared/utils/shared-utils';
import {catchError, map, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {get} from 'lodash/fp';
import {ApiTasksService} from '../../business-logic/api-services/tasks.service';
import {ApiModelsService} from '../../business-logic/api-services/models.service';
import {IProjectsState} from '../../features/projects/projects.reducer';
import {PROJECTS_ACTIONS} from './common-projects.consts';
import {selectRouterParams} from '../core/reducers/router-reducer';
import {selectCurrentUser, selectShowOnlyUserWork} from '../core/reducers/users-reducer';

@Injectable()
export class CommonProjectsEffects {

  constructor(
    private actions: Actions, public projectsApi: ApiProjectsService,
    public experimentsApi: ApiTasksService, public modelsApi: ApiModelsService,
    private store: Store<IProjectsState>
  ) {
  }

  @Effect()
  activeLoader = this.actions.pipe(
    ofType(PROJECTS_ACTIONS.PROJECT_UPDATED, PROJECTS_ACTIONS.GET_PROJECTS, PROJECTS_ACTIONS.CREATE_PROJECT, PROJECTS_ACTIONS.GET_PROJECT_BY_ID),
    map(action => new ActiveLoader(action.type))
  );

  @Effect()
  updateProject = this.actions.pipe(
    ofType<ProjectUpdated>(PROJECTS_ACTIONS.PROJECT_UPDATED),
    mergeMap((action) => this.projectsApi.projectsUpdate(action.payload.updatedData)
      .pipe(
        mergeMap(res => [new DeactiveLoader(action.type), new UpdateProjectPartial({id: action.payload.updatedData.project, changes: action.payload.updatedData})]),
        catchError(error => [new DeactiveLoader(action.type), new RequestFailed(error),
          new SetServerError(error, undefined, get('error.meta.result_subcode', error) === 800 ?
            'Name should be 3 characters long' : get('error.meta.result_subcode', error) === 801 ? 'Name already exists in this project' : undefined)])
      )
    )
  );

  @Effect()
  getAllProjects = this.actions.pipe(
    ofType<GetAllProjects>(PROJECTS_ACTIONS.GET_PROJECTS),
    withLatestFrom(
      this.store.select(selectProjectsOrderBy),
      this.store.select(selectProjectsSortOrder),
      this.store.select(selectProjectsSearchQuery),
      this.store.select(selectProjectsPage),
      this.store.select(selectCurrentUser),
      this.store.select(selectShowOnlyUserWork),
      this.store.select(selectRouterParams).pipe(map(params => get('projectId', params)))
    ),
    switchMap(([action, orderBy, sortOrder, searchQuery, page, user, showOnlyUserWork, selectedProjectId]) => {
      const pageSize = 12;
      return this.projectsApi.projectsGetAllEx({
        stats_for_state: ProjectsGetAllExRequest.StatsForStateEnum.Active,
        include_stats: true,
        shallow_search: !searchQuery?.query,
        ...(selectedProjectId && {parent: [selectedProjectId]}),
        page: page,
        page_size: pageSize,
        active_users: (showOnlyUserWork ? [user.id] : null),
        order_by: ['featured', sortOrder === TABLE_SORT_ORDER.DESC ? '-' + orderBy : orderBy],
        only_fields: ['name', 'company', 'user', 'created', 'default_output_destination'],
        ...(searchQuery?.query && {
          _any_: {
            pattern: searchQuery.regExp ? searchQuery.query : escapeRegex(searchQuery.query)+ '[^/]*$',
            fields: ['id', 'name', 'description', 'system_tags']
          }
        }),
        ...action.payload.getAllFilter
      } as any)
        .pipe(
          mergeMap(res => [
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
    mergeMap(action => [new GetAllProjects()])
  );

  @Effect()
  setProjectsSearchQuery = this.actions.pipe(
    ofType(setProjectsSearchQuery.type),
    mergeMap(action => [new GetAllProjects()])
  );

  @Effect()
  checkIfProjectExperiments = this.actions.pipe(
    ofType<CheckProjectForDeletion>(PROJECTS_ACTIONS.CHECK_PROJECT_FOR_DELETION),
    mergeMap((action) => this.experimentsApi.tasksGetAllEx({
        project: [action.payload.project.id],
        include_subprojects: true,
        only_fields: ['system_tags'],
        page_size: 1000
      })
        .pipe(
          mergeMap(res => {
            const archivedExperimentsNumber = res.tasks.filter(task => task.system_tags?.includes('archived')).length;
            return [new SetProjectReadyForDeletion({
              experiments: {
                total: res.tasks.length,
                archived: archivedExperimentsNumber,
                unarchived: res.tasks.length - archivedExperimentsNumber
              }
            })];
          }))
    )
  );

  @Effect()
  checkIfProjectModels = this.actions.pipe(
    ofType<CheckProjectForDeletion>(PROJECTS_ACTIONS.CHECK_PROJECT_FOR_DELETION),
    mergeMap((action) =>
      this.modelsApi.modelsGetAllEx({
        project: [action.payload.project.id],
        include_subprojects: true,
        only_fields: ['system_tags'],
        page_size: 1000
      })
        .pipe(mergeMap(res => {
          const archivedModelsNumber = res.models.filter(model => model.system_tags?.includes('archived')).length;
          return [new SetProjectReadyForDeletion({
            models: {
              total: res.models.length,
              archived: archivedModelsNumber,
              unarchived: res.models.length - archivedModelsNumber
            }
          })];
        }))
    )
  );
}
