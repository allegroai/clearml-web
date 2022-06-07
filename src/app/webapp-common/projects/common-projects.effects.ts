import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {ApiProjectsService} from '~/business-logic/api-services/projects.service';
import {requestFailed} from '../core/actions/http.actions';
import {activeLoader, deactivateLoader, setServerError} from '../core/actions/layout.actions';
import {
  addToProjectsList, getAllProjectsPageProjects, updateProject,
  setCurrentScrollId, setNoMoreProjects, setProjectsOrderBy,
  setProjectsSearchQuery, updateProjectSuccess, showExamplePipelines
} from './common-projects.actions';
import {
  selectProjectsOrderBy, selectProjectsScrollId, selectProjectsSearchQuery, selectProjectsSortOrder
} from './common-projects.reducer';
import {Store} from '@ngrx/store';
import {TABLE_SORT_ORDER} from '../shared/ui-components/data/table/table.consts';
import {ProjectsGetAllExRequest} from '~/business-logic/model/projects/projectsGetAllExRequest';
import {escapeRegex, isExample} from '../shared/utils/shared-utils';
import {catchError, debounceTime, map, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {get} from 'lodash/fp';
import {pageSize} from './common-projects.consts';
import {selectRouterParams} from '../core/reducers/router-reducer';
import {selectCurrentUser, selectShowOnlyUserWork} from '../core/reducers/users-reducer';
import {selectShowHidden} from '~/features/projects/projects.reducer';
import {ProjectsGetAllExResponse} from '~/business-logic/model/projects/projectsGetAllExResponse';
import {selectRootProjects, selectSelectedProjectId} from '../core/reducers/projects.reducer';
import {forkJoin, of} from 'rxjs';
import {Project} from '~/business-logic/model/projects/project';
import {setAllProjects} from '../core/actions/projects.actions';
import {ActivatedRoute} from '@angular/router';
import {ProjectsUpdateResponse} from '~/business-logic/model/projects/projectsUpdateResponse';

@Injectable()
export class CommonProjectsEffects {

  constructor(
    private actions: Actions, public projectsApi: ApiProjectsService,
    private store: Store<any>, private route: ActivatedRoute,
  ) {}

  activeLoader = createEffect(() => this.actions.pipe(
    ofType(updateProject, getAllProjectsPageProjects),
    map(action => activeLoader(action.type))
  ));

  updateProject = createEffect(() => this.actions.pipe(
    ofType(updateProject),
    withLatestFrom(this.store.select(selectRootProjects)),
    mergeMap(([action, rootProjects]) => this.projectsApi.projectsUpdate({project: action.id, ...action.changes})
      .pipe(
        mergeMap((res: ProjectsUpdateResponse) => {
          const actions = [
            deactivateLoader(action.type),
            updateProjectSuccess({id: action.id, changes: res.fields})
          ];
          if (action.changes.name) {
            const parentProject = rootProjects.find(project => project.id === action.id);
            if (parentProject) {
              const affectedRootProjects = rootProjects
                .filter(project => project.name.startsWith(`${parentProject.name}/`))
                .map(project => ({...project, name: project.name.replace(parentProject?.name, action.changes.name)}));
              actions.push(setAllProjects({projects: affectedRootProjects, updating: true}) as any);
            }
          }
          return actions;
        }),
        catchError(error => [deactivateLoader(action.type), requestFailed(error),
          setServerError(error, undefined, get('error.meta.result_subcode', error) === 800 ?
            'Name should be 3 characters long' : get('error.meta.result_subcode', error) === 801 ? 'Name already exists in this project' : undefined)])
      )
    )
  ));

  getAllProjects = createEffect(() => this.actions.pipe(
    ofType(getAllProjectsPageProjects),
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
    switchMap(([
                 action, orderBy, sortOrder, searchQuery, scrollId, user, showOnlyUserWork,
                 showHidden, routerProjectId, projectId
               ]) => {
        const selectedProjectId = routerProjectId || projectId; // In rare cases where router not updated yet with current project id
        const pipelines = this.route.snapshot.firstChild.routeConfig.path === 'pipelines';
        /* eslint-disable @typescript-eslint/naming-convention */
        return forkJoin([
          this.projectsApi.projectsGetAllEx({
            stats_for_state: ProjectsGetAllExRequest.StatsForStateEnum.Active,
            ...((!showHidden && !pipelines) && {include_stats_filter: {system_tags: ['-pipeline']}}),
            ...((pipelines) && {include_stats_filter: {system_tags: ['pipeline'], type:['controller']}}),
            include_stats: true,
            shallow_search: !pipelines && !searchQuery?.query,
            ...(selectedProjectId && {parent: [selectedProjectId]}),
            scroll_id: scrollId || null, // null to create new scroll (undefined doesn't generate scroll)
            size: pageSize,
            active_users: (showOnlyUserWork ? [user.id] : null),
            ...((showHidden || pipelines) && {search_hidden: true}),
            ...(pipelines && {system_tags: ['pipeline']}),
            order_by: ['featured', sortOrder === TABLE_SORT_ORDER.DESC ? '-' + orderBy : orderBy],
            only_fields: ['name', 'company', 'user', 'created', 'default_output_destination']
              .concat(pipelines ? ['tags', 'system_tags']: []),
            ...(searchQuery?.query && {
              _any_: {
                pattern: searchQuery.regExp ? searchQuery.query : escapeRegex(searchQuery.query) + '[^/]*$',
                fields: ['id', 'name', 'description']
              }
            }),
            ...action?.getAllFilter
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
        ]).pipe(
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
            addToProjectsList({projects}),
            deactivateLoader(action.type),
            setCurrentScrollId({scrollId: newScrollId}),
            setNoMoreProjects({payload: projects.length < pageSize})]),
          catchError(error => [deactivateLoader(action.type), requestFailed(error)])
        );
      }
    )
  ));

  setProjectsOrderBy = createEffect(() => this.actions.pipe(
    ofType(setProjectsOrderBy),
    mergeMap(() => [getAllProjectsPageProjects({})])
  ));

  showExamplePipeline = createEffect(() => this.actions.pipe(
    ofType(showExamplePipelines),
    map(() => localStorage.setItem('_saved_pipeline_state_', JSON.stringify({showPipelineExamples: true})))
  ), {dispatch: false});

  setProjectsSearchQuery = createEffect(() => this.actions.pipe(
    ofType(setProjectsSearchQuery),
    mergeMap(() => [getAllProjectsPageProjects({})])
  ));

  private isNotEmptyExampleProject(project: Project) {
    return !(isExample(project) && project.own_models === 0 && project.own_tasks === 0);
  }
}
