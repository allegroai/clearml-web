import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {ApiProjectsService} from '~/business-logic/api-services/projects.service';
import * as actions from '../actions/projects.actions';
import {catchError, expand, filter, map, mergeMap, reduce, switchMap, withLatestFrom} from 'rxjs/operators';
import {requestFailed} from '../actions/http.actions';
import {activeLoader, deactivateLoader, setServerError} from '../actions/layout.actions';
import {setSelectedModels} from '../../models/actions/models-view.actions';
import {TagColorMenuComponent} from '../../shared/ui-components/tags/tag-color-menu/tag-color-menu.component';
import {MatDialog} from '@angular/material/dialog';
import {ApiOrganizationService} from '~/business-logic/api-services/organization.service';
import {OrganizationGetTagsResponse} from '~/business-logic/model/organization/organizationGetTagsResponse';
import {selectRouterParams} from '../reducers/router-reducer';
import {EMPTY, forkJoin, of} from 'rxjs';
import {ProjectsGetTaskTagsResponse} from '~/business-logic/model/projects/projectsGetTaskTagsResponse';
import {ProjectsGetModelTagsResponse} from '~/business-logic/model/projects/projectsGetModelTagsResponse';
import {
  selectAllProjectsUsers,
  selectLastUpdate, selectRootProjects,
  selectSelectedMetricVariantForCurrProject,
  selectSelectedProjectId, selectShowHidden
} from '../reducers/projects.reducer';
import {OperationErrorDialogComponent} from '@common/shared/ui-components/overlay/operation-error-dialog/operation-error-dialog.component';
import {ApiTasksService} from '~/business-logic/api-services/tasks.service';
import {createMetricColumn} from '@common/shared/utils/tableParamEncode';
import {ITask} from '~/business-logic/model/al-task';
import {TasksGetAllExRequest} from '~/business-logic/model/tasks/tasksGetAllExRequest';
import {setSelectedExperiments} from '../../experiments/actions/common-experiments-view.actions';
import {setActiveWorkspace} from '@common/core/actions/users.actions';
import {ProjectsGetAllExResponse} from '~/business-logic/model/projects/projectsGetAllExResponse';
import {Project} from '~/business-logic/model/projects/project';
import {ApiUsersService} from '~/business-logic/api-services/users.service';
import {get, last} from 'lodash/fp';
import {ProjectsGetAllExRequest} from '~/business-logic/model/projects/projectsGetAllExRequest';
import {setShowHidden} from '../actions/projects.actions';

export const ALL_PROJECTS_OBJECT = {id: '*', name: 'All Experiments'};

@Injectable()
export class ProjectsEffects {
  private pageSize: number = 500;

  constructor(
    private actions$: Actions, private projectsApi: ApiProjectsService, private orgApi: ApiOrganizationService,
    private store: Store<any>, private dialog: MatDialog, private tasksApi: ApiTasksService,
    private usersApi: ApiUsersService,
  ) {}

  activeLoader = createEffect(() => this.actions$.pipe(
    ofType(actions.setSelectedProjectId),
    filter((action) => !!action.projectId),
    map(action => activeLoader(action.type))
  ));

  setProject = createEffect(() => this.actions$.pipe(
    ofType(actions.setSelectedProject),
    switchMap(action => [actions.getCompanyTags()]
      .concat(!!action.project?.id ? [actions.getTags(action.project.id)] : []))
  ));

  getProjects$ = createEffect(() => this.actions$.pipe(
    ofType(actions.getAllSystemProjects),
    withLatestFrom(
      this.store.select(selectShowHidden),
      this.store.select(selectLastUpdate),
    ),
    switchMap(([, showHidden, lastUpdate]) => {
      const query = {
        /* eslint-disable @typescript-eslint/naming-convention */
        scroll_id: null,
        size: this.pageSize,
        order_by: ['last_update'],
        ...(lastUpdate && {last_update: [lastUpdate, null]}),
        only_fields: ['name', 'company', 'parent', 'last_update'],
        search_hidden: showHidden
        /* eslint-enable @typescript-eslint/naming-convention */
      } as ProjectsGetAllExRequest;
      return this.projectsApi.projectsGetAllEx(query)
        .pipe(
          expand((res: ProjectsGetAllExResponse) => res.scroll_id && res.projects.length >= this.pageSize ?
            this.projectsApi.projectsGetAllEx({
              ...query,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              scroll_id: res.scroll_id,
            }) :
            EMPTY
          ),
          reduce((acc, res: ProjectsGetAllExResponse) => acc.concat(res.projects), []),
        );
    }),
    withLatestFrom(this.store.select(selectRootProjects)),
    mergeMap(([projects, rootProjects]) => [
      actions.setAllProjects({
        projects: projects as Project[],
        updating: rootProjects?.length > 0
      }),
      actions.setLastUpdate({lastUpdate: last(projects)?.last_update})
    ])
  ));

  resetProjects$ = createEffect(() => this.actions$.pipe(
    ofType(actions.resetSelectedProject),
    mergeMap(() => [actions.resetProjectSelection()])
  ));

  resetProjectSelections$ = createEffect(() => this.actions$.pipe(
    ofType(actions.resetProjectSelection),
    mergeMap(() => [setSelectedExperiments({experiments: []}), setSelectedModels({models: []})])
  ));

  updateProject$ = createEffect(() => this.actions$.pipe(
    ofType(actions.updateProject),
    switchMap((action) =>
      this.projectsApi.projectsUpdate({project: action.id, ...action.changes})
        .pipe(
          mergeMap(res => [
            actions.updateProjectCompleted({id: action.id, changes: res?.fields || action.changes})
          ]),
          catchError(err => [
            requestFailed(err),
            setServerError(err, null, 'Update project failed'),
            actions.setSelectedProjectId({projectId: action.id})
          ])
        )
    )
  ));

  openTagColor = createEffect(() => this.actions$.pipe(
    ofType(actions.openTagColorsMenu),
    map(() => {
      this.dialog.open(TagColorMenuComponent);
    })
  ), {dispatch: false});

  //getAll but not projects'
  getAllTags = createEffect(() => this.actions$.pipe(
    ofType(actions.getCompanyTags),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    switchMap(() => this.orgApi.organizationGetTags({include_system: true})
      .pipe(
        map((res: OrganizationGetTagsResponse) => actions.setCompanyTags({tags: res.tags, systemTags: res.system_tags})),
        catchError(error => [requestFailed(error)])
      )
    )
  ));

    getProjectsTags = createEffect(() => this.actions$.pipe(
    ofType(actions.getProjectsTags),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    switchMap(() => this.projectsApi.projectsGetProjectTags({filter: {system_tags: ['pipeline']}})
      .pipe(
        map((res: OrganizationGetTagsResponse) => actions.setTags({tags: res.tags})),
        catchError(error => [requestFailed(error)])
      )
    )
  ));

  getTagsEffect = createEffect(() => this.actions$.pipe(
    ofType(actions.getTags),
    withLatestFrom(this.store.select(selectRouterParams).pipe(
      map(params => (params === null || params?.projectId === '*') ? [] : [params.projectId]))),
      mergeMap(([action, projects]) => {
      const ids = action?.projectId ? [action.projectId] : projects;
      if (ids.length === 0 || !ids[0]) {
        return EMPTY;
      }
      return forkJoin([
        this.projectsApi.projectsGetTaskTags({projects: action?.projectId ? [action.projectId] : projects}),
        this.projectsApi.projectsGetModelTags({projects: action?.projectId ? [action.projectId] : projects})]
      ).pipe(
        map((res: [ProjectsGetTaskTagsResponse, ProjectsGetModelTagsResponse]) =>
          Array.from(new Set(res[0].tags.concat(res[1].tags))).sort()),
        mergeMap((tags: string[]) => [
          actions.setTags({tags}),
          deactivateLoader(action.type)
        ]),
        catchError(error => [
          requestFailed(error),
          deactivateLoader(action.type),
          setServerError(error, null, 'Fetch tags failed')]
        )
      );
    })
  ));

  openMoreInfoPopupEffect = createEffect(() => this.actions$.pipe(
    ofType(actions.openMoreInfoPopup),
    switchMap(action => this.dialog.open(OperationErrorDialogComponent, {
        data: {
          title: `${action.operationName} ${action.entityType}`,
          action,
          iconClass: `d-block al-ico-${action.operationName} al-icon w-auto`,
        }
      }).afterClosed()
    )
  ), {dispatch: false});

  fetchProjectStats = createEffect(() => this.actions$.pipe(
    ofType(actions.fetchGraphData),
    withLatestFrom(
      this.store.select(selectSelectedProjectId),
      this.store.select(selectSelectedMetricVariantForCurrProject)
    ),
    filter(([, , variant]) => !!variant),
    switchMap(([, projectId, variant]) => {
      const col = createMetricColumn(variant, projectId);
      return this.tasksApi.tasksGetAllEx({
        /* eslint-disable @typescript-eslint/naming-convention */
        project: [projectId],
        only_fields: ['started', 'last_iteration', 'user.name', 'type', 'name', 'status', 'active_duration', col.id],
        [col.id]: [0, null],
        started: ['2000-01-01T00:00:00', null],
        status: ['completed', 'published', 'failed', 'stopped', 'closed'],
        order_by: ['-started'],
        type: ['__$not', 'annotation_manual', '__$not', 'annotation', '__$not', 'dataset_import'],
        system_tags: ['-archived'],
        scroll_id: null,
        size: 1000
        /* eslint-enable @typescript-eslint/naming-convention */
      } as unknown as TasksGetAllExRequest).pipe(
        map((res) =>
          actions.setGraphData({
            stats: res.tasks.map((task: ITask) => {
              const started = new Date(task.started).getTime();
              const end = started + (task.active_duration ?? 0) * 1000;
              return {
                id: task.id,
                y: get(col.id, task), // col.id is a path (e.g.) last_metric.x.max_value, must use lodash get
                x: end,
                name: task.name,
                status: task.status,
                type: task.type,
                user: task.user.name,
              };
            })
          }))
      );
    })
  ));

  resetRootProjects = createEffect(() => this.actions$.pipe(
    ofType(setActiveWorkspace, actions.refetchProjects, setShowHidden),
    mergeMap(() => [
      actions.resetProjects(),
      actions.getAllSystemProjects()
    ])
  ));

  getAllProjectsUsersEffect = createEffect(() => this.actions$.pipe(
    ofType(actions.getAllSystemProjects),
    switchMap(() => this.usersApi.usersGetAllEx({
      /* eslint-disable @typescript-eslint/naming-convention */
      order_by: ['name'],
      only_fields: ['name'],
      /* eslint-enable @typescript-eslint/naming-convention */
    }, null, 'body', true).pipe(
      mergeMap(res => [actions.setAllProjectUsers(res)]),
      catchError(error => [
        requestFailed(error),
        setServerError(error, null, 'Fetch all projects users failed')]
      )
    ))
  ));

  getUsersEffect = createEffect(() => this.actions$.pipe(
    ofType(actions.getProjectUsers),
    withLatestFrom(
      this.store.select(selectAllProjectsUsers)
    ),
    switchMap(([action, all]) => (!action.projectId || action.projectId === '*' ?
      of({users: all}) :
      this.usersApi.usersGetAllEx({
        /* eslint-disable @typescript-eslint/naming-convention */
        order_by: ['name'],
        only_fields: ['name'],
        active_in_projects: [action.projectId]
        /* eslint-enable @typescript-eslint/naming-convention */
      }, null, 'body', true)).pipe(
      mergeMap(res => [actions.setProjectUsers(res)]),
      catchError(error => [
        requestFailed(error),
        setServerError(error, null, 'Fetch users failed')]
      )
    ))
  ));

  getExtraUsersEffect = createEffect(() => this.actions$.pipe(
    ofType(actions.getFilteredUsers),
    switchMap(action => this.usersApi.usersGetAllEx({
      /* eslint-disable @typescript-eslint/naming-convention */
      order_by: ['name'],
      only_fields: ['name'],
      id: action.filteredUsers || []
      /* eslint-enable @typescript-eslint/naming-convention */
    }, null, 'body', true).pipe(
      mergeMap(res => [
        actions.setProjectExtraUsers(res),
        deactivateLoader(action.type)
      ]),
      catchError(error => [
        requestFailed(error),
        deactivateLoader(action.type),
        setServerError(error, null, 'Fetch users failed')]
      )
    ))
  ));

}


