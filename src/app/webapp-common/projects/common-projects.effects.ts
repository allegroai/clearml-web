import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {ApiProjectsService} from '../../business-logic/api-services/projects.service';
import {requestFailed} from '../core/actions/http.actions';
import {activeLoader, deactivateLoader, setServerError} from '../core/actions/layout.actions';
import {
  AddToProjectsList, GetAllProjectsPageProjects, ProjectUpdated,
  setCurrentScrollId, SetNoMoreProjects, SetProjectsOrderBy,
  setProjectsSearchQuery, UpdateProjectPartial
} from './common-projects.actions';
import {
  selectProjectsOrderBy, selectProjectsScrollId, selectProjectsSearchQuery, selectProjectsSortOrder
} from './common-projects.reducer';
import {Store} from '@ngrx/store';
import {TABLE_SORT_ORDER} from '../shared/ui-components/data/table/table.consts';
import {ProjectsGetAllExRequest} from '../../business-logic/model/projects/projectsGetAllExRequest';
import {escapeRegex, isExample} from '../shared/utils/shared-utils';
import {catchError, debounceTime, map, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {get} from 'lodash/fp';
import {ApiTasksService} from '../../business-logic/api-services/tasks.service';
import {ApiModelsService} from '../../business-logic/api-services/models.service';
import {pageSize, PROJECTS_ACTIONS} from './common-projects.consts';
import {selectRouterParams} from '../core/reducers/router-reducer';
import {selectCurrentUser, selectShowOnlyUserWork} from '../core/reducers/users-reducer';
import {selectShowHidden} from '../../features/projects/projects.reducer';
import {ProjectsGetAllExResponse} from '../../business-logic/model/projects/projectsGetAllExResponse';
import {selectRootProjects, selectSelectedProjectId} from '../core/reducers/projects.reducer';
import {forkJoin, of} from 'rxjs';
import {Project} from '../../business-logic/model/projects/project';
import {setAllProjects} from '../core/actions/projects.actions';

@Injectable()
export class CommonProjectsEffects {

  constructor(
    private actions: Actions, public projectsApi: ApiProjectsService,
    public experimentsApi: ApiTasksService, public modelsApi: ApiModelsService,
    private store: Store<any>
  ) {
  }

  activeLoader = createEffect(() => this.actions.pipe(
    ofType(PROJECTS_ACTIONS.PROJECT_UPDATED, PROJECTS_ACTIONS.GET_PROJECTS, PROJECTS_ACTIONS.CREATE_PROJECT),
    map(action => activeLoader(action.type))
  ));

  updateProject = createEffect(() => this.actions.pipe(
    ofType<ProjectUpdated>(PROJECTS_ACTIONS.PROJECT_UPDATED),
    withLatestFrom(this.store.select(selectRootProjects)),
    mergeMap(([action, rootProjects]) => this.projectsApi.projectsUpdate(action.payload.updatedData)
      .pipe(
        mergeMap(() => {
          const parentProject = rootProjects.find(project => project.id === action.payload.updatedData.project);
          const effectedRootProjects = [
            rootProjects.find(project => project.name === parentProject.name),
            ...rootProjects.filter(project => project.name.startsWith(`${parentProject.name}/`))]
            .map(project => ({
              ...project,
              name: project.name.replace(parentProject?.name, action.payload.updatedData.name)
            }));
          return [
            deactivateLoader(action.type),
            new UpdateProjectPartial({id: action.payload.updatedData.project, changes: action.payload.updatedData}),
            setAllProjects({projects: effectedRootProjects, updating: true})
          ];
        }),
        catchError(error => [deactivateLoader(action.type), requestFailed(error),
          setServerError(error, undefined, get('error.meta.result_subcode', error) === 800 ?
            'Name should be 3 characters long' : get('error.meta.result_subcode', error) === 801 ? 'Name already exists in this project' : undefined)])
      )
    )
  ));

  getAllProjects = createEffect(() => this.actions.pipe(
    ofType<GetAllProjectsPageProjects>(PROJECTS_ACTIONS.GET_PROJECTS),
    debounceTime(10),
    withLatestFrom(
      this.store.select(selectProjectsOrderBy),
      this.store.select(selectProjectsSortOrder),
      this.store.select(selectProjectsSearchQuery),
      this.store.select(selectProjectsScrollId),
      this.store.select(selectCurrentUser),
      this.store.select(selectShowOnlyUserWork),
      this.store.select(selectShowHidden),
      this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
      this.store.select(selectSelectedProjectId),
    ),
    switchMap(([action, orderBy, sortOrder, searchQuery, scrollId, user, showOnlyUserWork, showHidden, routerProjectId, projectId]) => {
        const selectedProjectId = routerProjectId || projectId; // In rare cases where router not updated yet with current project id
        /* eslint-disable @typescript-eslint/naming-convention */
        return forkJoin([
          this.projectsApi.projectsGetAllEx({
            stats_for_state: ProjectsGetAllExRequest.StatsForStateEnum.Active,
            include_stats: true,
            shallow_search: !searchQuery?.query,
            ...(selectedProjectId && {parent: [selectedProjectId]}),
            scroll_id: scrollId || null, // null to create new scroll (undefined doesn't generate scroll)
            size: pageSize,
            active_users: (showOnlyUserWork ? [user.id] : null),
            ...(showHidden && {search_hidden: true}),
            order_by: ['featured', sortOrder === TABLE_SORT_ORDER.DESC ? '-' + orderBy : orderBy],
            only_fields: ['name', 'company', 'user', 'created', 'default_output_destination'],
            ...(searchQuery?.query && {
              _any_: {
                pattern: searchQuery.regExp ? searchQuery.query : escapeRegex(searchQuery.query) + '[^/]*$',
                fields: ['id', 'name', 'description', 'system_tags']
              }
            }),
            ...action.payload.getAllFilter
          } as ProjectsGetAllExRequest),
          // Getting [current project] stats from server
          (selectedProjectId && !scrollId && !searchQuery?.query) ? this.projectsApi.projectsGetAllEx({
            id: selectedProjectId,
            include_stats: true,
            stats_with_children: false,
            stats_for_state: ProjectsGetAllExRequest.StatsForStateEnum.Active,
            ...(showHidden && {search_hidden: true}),
            check_own_contents: true, // in order to check if project is empty
            only_fields: ['name', 'company', 'user', 'created', 'default_output_destination'],
            /* eslint-enable @typescript-eslint/naming-convention */
          }) : of(null),
        ])
          .pipe(
            map(([projectsRes, currentProjectRes]: [ProjectsGetAllExResponse, ProjectsGetAllExResponse]) => ({
                newScrollId: projectsRes.scroll_id,
                projects: (currentProjectRes && this.isNotEmptyExampleProject(currentProjectRes.projects[0])) ? [
                  // eslint-disable-next-line @typescript-eslint/naming-convention
                  {...currentProjectRes.projects[0], isRoot: true, sub_projects: null, name: `[${currentProjectRes.projects[0]?.name}]`},
                  ...projectsRes.projects
                ] : projectsRes.projects
              }
            )),
            mergeMap(({newScrollId, projects}) => [
              new AddToProjectsList(projects),
              deactivateLoader(action.type),
              setCurrentScrollId({scrollId: newScrollId}),
              new SetNoMoreProjects(projects.length < pageSize)]),
            catchError(error => [deactivateLoader(action.type), requestFailed(error)])
          );
      }
    )
  ));

  setProjectsOrderBy = createEffect(() => this.actions.pipe(
    ofType<SetProjectsOrderBy>(PROJECTS_ACTIONS.SET_ORDER_BY),
    mergeMap(() => [new GetAllProjectsPageProjects()])
  ));

  setProjectsSearchQuery = createEffect(() => this.actions.pipe(
    ofType(setProjectsSearchQuery.type),
    mergeMap(() => [new GetAllProjectsPageProjects()])
  ));

  private isNotEmptyExampleProject(project: Project) {
    return !(isExample(project) && project.own_models === 0 && project.own_tasks === 0);
  }
}
