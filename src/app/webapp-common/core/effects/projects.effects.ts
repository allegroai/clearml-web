import {Injectable} from '@angular/core';
import {Action, Store} from '@ngrx/store';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {ApiProjectsService} from '~/business-logic/api-services/projects.service';
import * as actions from '../actions/projects.actions';
import {
  fetchGraphData, getAllSystemProjects,
  getCompanyTags,
  getTags,
  openMoreInfoPopup,
  openTagColorsMenu,
  resetProjects, resetProjectSelection,
  setCompanyTags,
  setGraphData, setLastUpdate,
  setTags
} from '../actions/projects.actions';

import {catchError, filter, map, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {requestFailed} from '../actions/http.actions';
import {activeLoader, deactivateLoader, setServerError} from '../actions/layout.actions';
import {setSelectedModels} from '../../models/actions/models-view.actions';
import {TagColorMenuComponent} from '../../shared/ui-components/tags/tag-color-menu/tag-color-menu.component';
import {MatDialog} from '@angular/material/dialog';
import {ApiOrganizationService} from '~/business-logic/api-services/organization.service';
import {OrganizationGetTagsResponse} from '~/business-logic/model/organization/organizationGetTagsResponse';
import {selectRouterParams} from '../reducers/router-reducer';
import {forkJoin} from 'rxjs';
import {ProjectsGetTaskTagsResponse} from '~/business-logic/model/projects/projectsGetTaskTagsResponse';
import {ProjectsGetModelTagsResponse} from '~/business-logic/model/projects/projectsGetModelTagsResponse';
import {selectLastUpdate, selectSelectedMetricVariantForCurrProject, selectSelectedProjectId} from '../reducers/projects.reducer';
import {OperationErrorDialogComponent} from '@common/shared/ui-components/overlay/operation-error-dialog/operation-error-dialog.component';
import {ApiTasksService} from '~/business-logic/api-services/tasks.service';
import {createMetricColumn} from '@common/shared/utils/tableParamEncode';
import {get} from 'lodash/fp';
import {ITask} from '~/business-logic/model/al-task';
import {TasksGetAllExRequest} from '~/business-logic/model/tasks/tasksGetAllExRequest';
import {setSelectedExperiments} from '../../experiments/actions/common-experiments-view.actions';
import {selectShowHidden} from '~/features/projects/projects.reducer';
import {setActiveWorkspace} from '@common/core/actions/users.actions';
import {ProjectsGetAllExResponse} from '~/business-logic/model/projects/projectsGetAllExResponse';
import {Project} from '~/business-logic/model/projects/project';

export const ALL_PROJECTS_OBJECT = {id: '*', name: 'All Experiments'};

@Injectable()
export class ProjectsEffects {
  private pageSize: number = 500;
  private lastUpdateSoFar: string;
  private scrollId: string = null;

  constructor(
    private actions$: Actions, private projectsApi: ApiProjectsService, private orgApi: ApiOrganizationService,
    private store: Store<any>, private dialog: MatDialog, private tasksApi: ApiTasksService
  ) {
  }

  activeLoader = createEffect(() => this.actions$.pipe(
    ofType(actions.setSelectedProjectId),
    filter((action) => !!action.projectId),
    map(action => activeLoader(action.type))
  ));

  getProjects$ = createEffect(() => this.actions$.pipe(
    ofType(actions.getAllSystemProjects),
    withLatestFrom(this.store.select(selectShowHidden), this.store.select(selectLastUpdate)),
    switchMap(([, showHidden, lastUpdate]) => this.projectsApi.projectsGetAllEx({
        /* eslint-disable @typescript-eslint/naming-convention */
        size: this.pageSize,
        scroll_id: this.scrollId,
        order_by: ['last_update'],
        last_update: lastUpdate ? [lastUpdate, null] : undefined,
        only_fields: ['name', 'company', 'parent', 'last_update'], search_hidden: showHidden
        /* eslint-enable @typescript-eslint/naming-convention */
      } as any)
        .pipe(mergeMap((res: ProjectsGetAllExResponse) => {
            const resultsActions: Action[] = [actions.setAllProjects({projects: res.projects as unknown as Project[], updating: !!lastUpdate})];
            if (res.projects.length >= this.pageSize) {
              this.scrollId = res.scroll_id;
              this.lastUpdateSoFar = res.projects[res.projects.length - 1].last_update;
              resultsActions.push(getAllSystemProjects());
            } else {
              resultsActions.push(setLastUpdate({lastUpdate: res.projects[res.projects.length - 1]?.last_update || this.lastUpdateSoFar || lastUpdate}));
              this.scrollId = null;
              this.lastUpdateSoFar = null;
            }
            return resultsActions;
          })
        )
    )
  ));

  resetProjects$ = createEffect(() => this.actions$.pipe(
    ofType(actions.resetSelectedProject),
    mergeMap(() => [resetProjectSelection()])
  ));

  resetProjectSelections$ = createEffect(() => this.actions$.pipe(
    ofType(resetProjectSelection),
    mergeMap(() => [setSelectedExperiments({experiments: []}), setSelectedModels({models: []})])
  ));

  updateProject$ = createEffect(() => this.actions$.pipe(
    ofType(actions.updateProject),
    switchMap((action) =>
      this.projectsApi.projectsUpdate({project: action.id, ...action.changes})
        .pipe(
          mergeMap(() => [
            actions.updateProjectCompleted()
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
    ofType(openTagColorsMenu),
    map(() => {
      this.dialog.open(TagColorMenuComponent);
    })
  ), {dispatch: false});

  getAllTags = createEffect(() => this.actions$.pipe(
    ofType(getCompanyTags),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    switchMap(() => this.orgApi.organizationGetTags({include_system: true})
      .pipe(
        map((res: OrganizationGetTagsResponse) => setCompanyTags({tags: res.tags, systemTags: res.system_tags})),
        catchError(error => [requestFailed(error)])
      )
    )
  ));

  getTagsEffect = createEffect(() => this.actions$.pipe(
    ofType(getTags),
    withLatestFrom(this.store.select(selectRouterParams).pipe(
      map(params => (params === null || params?.projectId === '*') ? [] : [params.projectId]))),
    switchMap(([action, projects]) => forkJoin([
      this.projectsApi.projectsGetTaskTags({projects}),
      this.projectsApi.projectsGetModelTags({projects})]
    ).pipe(
      map((res: [ProjectsGetTaskTagsResponse, ProjectsGetModelTagsResponse]) =>
        Array.from(new Set(res[0].tags.concat(res[1].tags))).sort()),
      mergeMap((tags: string[]) => [
        setTags({tags}),
        deactivateLoader(action.type)
      ]),
      catchError(error => [
        requestFailed(error),
        deactivateLoader(action.type),
        setServerError(error, null, 'Fetch tags failed')]
      )
    ))
  ));

  openMoreInfoPopupEffect = createEffect(() => this.actions$.pipe(
    ofType(openMoreInfoPopup),
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
    ofType(fetchGraphData),
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
          setGraphData({
            stats: res.tasks.map((task: ITask) => {
              const started = new Date(task.started).getTime();
              const end = started + (task.active_duration ?? 0) * 1000;
              return {
                id: task.id,
                y: get(col.id, task),
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
    ofType(setActiveWorkspace),
    mergeMap(() => [
      resetProjects(),
      getAllSystemProjects()
    ])
  ));
}


