import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {ApiProjectsService} from '../../business-logic/api-services/projects.service';
import {requestFailed} from '../core/actions/http.actions';
import {activeLoader, deactivateLoader, setServerError} from '../core/actions/layout.actions';
import {AddToProjectsList, CheckProjectForDeletion, GetAllProjectsPageProjects, ProjectUpdated, SetCurrentProjectsPage, SetNoMoreProjects, SetProjectReadyForDeletion, SetProjectsOrderBy, setProjectsSearchQuery, UpdateProjectPartial} from './common-projects.actions';
import {
  selectProjectsOrderBy, selectProjectsPage, selectProjectsSearchQuery,
  selectProjectsSortOrder, selectShowHidden
} from './common-projects.reducer';
import {Store} from '@ngrx/store';
import {TABLE_SORT_ORDER} from '../shared/ui-components/data/table/table.consts';
import {ProjectsGetAllExRequest} from '../../business-logic/model/projects/projectsGetAllExRequest';
import {escapeRegex} from '../shared/utils/shared-utils';
import {catchError, map, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {get} from 'lodash/fp';
import {ApiTasksService} from '../../business-logic/api-services/tasks.service';
import {ApiModelsService} from '../../business-logic/api-services/models.service';
import {pageSize, PROJECTS_ACTIONS} from './common-projects.consts';
import {selectRouterParams} from '../core/reducers/router-reducer';
import {selectCurrentUser, selectShowOnlyUserWork} from '../core/reducers/users-reducer';
import {ProjectsValidateDeleteResponse} from '../../business-logic/model/projects/projectsValidateDeleteResponse';

@Injectable()
export class CommonProjectsEffects {

  constructor(
    private actions: Actions, public projectsApi: ApiProjectsService,
    public experimentsApi: ApiTasksService, public modelsApi: ApiModelsService,
    private store: Store<any>
  ) {
  }

  activeLoader = createEffect(() => this.actions.pipe(
    ofType(PROJECTS_ACTIONS.PROJECT_UPDATED, PROJECTS_ACTIONS.GET_PROJECTS, PROJECTS_ACTIONS.CREATE_PROJECT, PROJECTS_ACTIONS.GET_PROJECT_BY_ID),
    map(action => activeLoader(action.type))
  ));

  updateProject = createEffect(() => this.actions.pipe(
    ofType<ProjectUpdated>(PROJECTS_ACTIONS.PROJECT_UPDATED),
    mergeMap((action) => this.projectsApi.projectsUpdate(action.payload.updatedData)
      .pipe(
        mergeMap(() => [deactivateLoader(action.type), new UpdateProjectPartial({id: action.payload.updatedData.project, changes: action.payload.updatedData})]),
        catchError(error => [deactivateLoader(action.type), requestFailed(error),
          setServerError(error, undefined, get('error.meta.result_subcode', error) === 800 ?
            'Name should be 3 characters long' : get('error.meta.result_subcode', error) === 801 ? 'Name already exists in this project' : undefined)])
      )
    )
  ));

  getAllProjects = createEffect(() => this.actions.pipe(
    ofType<GetAllProjectsPageProjects>(PROJECTS_ACTIONS.GET_PROJECTS),
    withLatestFrom(
      this.store.select(selectProjectsOrderBy),
      this.store.select(selectProjectsSortOrder),
      this.store.select(selectProjectsSearchQuery),
      this.store.select(selectProjectsPage),
      this.store.select(selectCurrentUser),
      this.store.select(selectShowOnlyUserWork),
      this.store.select(selectShowHidden),
      this.store.select(selectRouterParams).pipe(map(params => get('projectId', params)))
    ),
    switchMap(([action, orderBy, sortOrder, searchQuery, page, user, showOnlyUserWork, showHidden, selectedProjectId]) => {
      /* eslint-disable @typescript-eslint/naming-convention */
      return this.projectsApi.projectsGetAllEx({
        stats_for_state: ProjectsGetAllExRequest.StatsForStateEnum.Active,
        include_stats: true,
        shallow_search: !searchQuery?.query,
        ...(selectedProjectId && {parent: [selectedProjectId]}),
        page,
        page_size: pageSize,
        active_users: (showOnlyUserWork ? [user.id] : null),
        ...(showHidden && {search_hidden: true}),
        order_by: ['featured', sortOrder === TABLE_SORT_ORDER.DESC ? '-' + orderBy : orderBy],
        only_fields: ['name', 'company', 'user', 'created', 'default_output_destination'],
        ...(searchQuery?.query && {
          _any_: {
            pattern: searchQuery.regExp ? searchQuery.query : escapeRegex(searchQuery.query)+ '[^/]*$',
            fields: ['id', 'name', 'description', 'system_tags']
          }
        }),
        ...action.payload.getAllFilter
      } as ProjectsGetAllExRequest)
      /* eslint-enable @typescript-eslint/naming-convention */
        .pipe(
          mergeMap(res => [
            new AddToProjectsList(res.projects),
            deactivateLoader(action.type),
            new SetCurrentProjectsPage(page + 1),
            new SetNoMoreProjects(res.projects.length < pageSize)]),
          catchError(error => [deactivateLoader(action.type), requestFailed(error)])
        );
    })
  ));

  setProjectsOrderBy = createEffect(() => this.actions.pipe(
    ofType<SetProjectsOrderBy>(PROJECTS_ACTIONS.SET_ORDER_BY),
    mergeMap(() => [new GetAllProjectsPageProjects()])
  ));

  setProjectsSearchQuery = createEffect(() => this.actions.pipe(
    ofType(setProjectsSearchQuery.type),
    mergeMap(() => [new GetAllProjectsPageProjects()])
  ));

  checkIfProjectExperiments = createEffect(() => this.actions.pipe(
    ofType<CheckProjectForDeletion>(PROJECTS_ACTIONS.CHECK_PROJECT_FOR_DELETION),
    switchMap((action) => this.projectsApi.projectsValidateDelete({project: action.payload.project.id})),
    mergeMap((projectsValidateDeleteResponse: ProjectsValidateDeleteResponse) => [
      new SetProjectReadyForDeletion({
        experiments: {
          total: projectsValidateDeleteResponse.tasks,
          archived: projectsValidateDeleteResponse.tasks - projectsValidateDeleteResponse.non_archived_tasks,
          unarchived: projectsValidateDeleteResponse.non_archived_tasks
        },
        models: {
          total: projectsValidateDeleteResponse.models,
          archived: projectsValidateDeleteResponse.models - projectsValidateDeleteResponse.non_archived_models,
          unarchived: projectsValidateDeleteResponse.non_archived_models
        },
        dataviews: {
          total: projectsValidateDeleteResponse.dataviews,
          archived:  projectsValidateDeleteResponse.dataviews - projectsValidateDeleteResponse.non_archived_dataviews,
          unarchived:projectsValidateDeleteResponse.non_archived_dataviews
        }
      })
    ])
  ));
}
