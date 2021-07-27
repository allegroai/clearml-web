import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {Actions, createEffect, Effect, ofType} from '@ngrx/effects';
import {ApiProjectsService} from '../../../business-logic/api-services/projects.service';
import * as actions from '../actions/projects.actions';
import {
  fetchGraphData,
  GetAllSystemProjects,
  getCompanyTags,
  getTags,
  openMoreInfoPopup,
  openTagColorsMenu,
  RESET_PROJECT_SELECTION,
  ResetProjectSelection,
  ResetSelectedProject,
  setCompanyTags,
  setGraphData,
  SetSelectedProjectId,
  setTags,
  UpdateProject
} from '../actions/projects.actions';

import {catchError, filter, finalize, map, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {requestFailed} from '../actions/http.actions';
import {activeLoader, deactivateLoader, setServerError} from '../actions/layout.actions';
import {setSelectedModels} from '../../models/actions/models-view.actions';
import {TagColorMenuComponent} from '../../shared/ui-components/tags/tag-color-menu/tag-color-menu.component';
import {MatDialog} from '@angular/material/dialog';
import {ApiOrganizationService} from '../../../business-logic/api-services/organization.service';
import {OrganizationGetTagsResponse} from '../../../business-logic/model/organization/organizationGetTagsResponse';
import {selectRouterParams} from '../reducers/router-reducer';
import {forkJoin} from 'rxjs';
import {ProjectsGetTaskTagsResponse} from '../../../business-logic/model/projects/projectsGetTaskTagsResponse';
import {ProjectsGetModelTagsResponse} from '../../../business-logic/model/projects/projectsGetModelTagsResponse';
import {selectSelectedMetricVariantForCurrProject, selectSelectedProjectId} from '../reducers/projects.reducer';
import {OperationErrorDialogComponent} from '@common/shared/ui-components/overlay/operation-error-dialog/operation-error-dialog.component';
import {ApiTasksService} from '../../../business-logic/api-services/tasks.service';
import {createMetricColumn} from '@common/shared/utils/tableParamEncode';
import {get} from 'lodash/fp';
import {ITask} from '../../../business-logic/model/al-task';
import {TasksGetAllExRequest} from '../../../business-logic/model/tasks/tasksGetAllExRequest';
import {setSelectedExperiments} from '../../experiments/actions/common-experiments-view.actions';
import {selectShowHidden} from "@common/projects/common-projects.reducer";

const ALL_PROJECTS_OBJECT = {id: '*', name: 'All Experiments'};

@Injectable()
export class ProjectsEffects {
  private fetchingExampleExperiment: string = null;

  constructor(
    private actions$: Actions, private projectsApi: ApiProjectsService, private orgApi: ApiOrganizationService,
    private store: Store<any>, private dialog: MatDialog, private tasksApi: ApiTasksService
  ) {
  }

  @Effect()
  activeLoader = this.actions$.pipe(
    ofType(actions.SET_SELECTED_PROJECT_ID),
    filter((action: any) => !!action.payload?.projectId),
    map(action => activeLoader(action.type))
  );

  @Effect()
  getProjects$ = this.actions$.pipe(
    ofType<GetAllSystemProjects>(actions.GET_PROJECTS),
    withLatestFrom(this.store.select(selectShowHidden)),
    switchMap(([action, showHidden]) =>
      this.projectsApi.projectsGetAllEx({only_fields: ['name', 'company', 'parent'], search_hidden: showHidden})
        .pipe(map(res => new actions.SetAllProjects(res.projects)))
    )
  );

  @Effect()
  resetProjects$ = this.actions$.pipe(
    ofType<ResetSelectedProject>(actions.RESET_SELECTED_PROJECT),
    mergeMap(() => [new ResetProjectSelection()])
  );

  @Effect()
  resetProjectSelections$ = this.actions$.pipe(
    ofType<ResetProjectSelection>(RESET_PROJECT_SELECTION),
    mergeMap(() => [setSelectedExperiments({experiments: []}), setSelectedModels({models: []})])
  );

  @Effect()
  updateProject$ = this.actions$.pipe(
    ofType<UpdateProject>(actions.UPDATE_PROJECT),
    switchMap((action) =>
      this.projectsApi.projectsUpdate({project: action.payload.id, ...action.payload.changes})
        .pipe(
          mergeMap(() => [
            new actions.UpdateProjectCompleted()
          ]),
          catchError(err => [
            requestFailed(err),
            setServerError(err, null, 'Update project failed'),
            new actions.SetSelectedProjectId(action.payload.id)
          ])
        )
    )
  );
  @Effect()
  getSelectedProject = this.actions$.pipe(
    ofType<SetSelectedProjectId>(actions.SET_SELECTED_PROJECT_ID),
    withLatestFrom(this.store.select(selectSelectedProjectId)),
    switchMap(([action, selectedProjectId]) => {
      if (!action.payload.projectId) {
        return [actions.setSelectedProject({project: null})];
      }
      if (action.payload.projectId === selectedProjectId) {
        return [deactivateLoader(action.type)];
      }
      if (action.payload.projectId === '*') {
        return [
          actions.setSelectedProject({project: ALL_PROJECTS_OBJECT}),
          deactivateLoader(action.type)];
      } else {
        this.fetchingExampleExperiment = action.payload.example && action.payload.projectId;
        return this.projectsApi.projectsGetAllEx({
          id: [action.payload.projectId],
          include_stats: true,
          ...((action.payload.example !== false || this.fetchingExampleExperiment === action.payload.projectId) && {check_own_contents: true})
        })
          .pipe(
            finalize(() => this.fetchingExampleExperiment = null),
            mergeMap(res => [
                actions.setSelectedProject({project: res.projects[0]}),
                deactivateLoader(action.type),
              ]
            ),
            catchError(error => [
              requestFailed(error),
              deactivateLoader(action.type)
            ])
          );
      }
    }));


  @Effect({dispatch: false})
  openTagColor = this.actions$.pipe(
    ofType(openTagColorsMenu),
    map(() => {
      this.dialog.open(TagColorMenuComponent);
    })
  );

  @Effect()
  getAllTags = this.actions$.pipe(
    ofType(getCompanyTags),
    switchMap(() => this.orgApi.organizationGetTags({include_system: true})
      .pipe(
        map((res: OrganizationGetTagsResponse) => setCompanyTags({tags: res.tags, systemTags: res.system_tags})),
        catchError(error => [requestFailed(error)])
      )
    )
  );

  @Effect()
  getTagsEffect = this.actions$.pipe(
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
  );

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
        project: [projectId],
        only_fields: ['started', 'last_iteration', 'user.name', 'type', 'name', 'status', 'active_duration', col.id],
        [col.id]: [0, null],
        started: ['2000-01-01T00:00:00', null],
        status: ['completed', 'published', 'failed', 'stopped', 'closed'],
        order_by: ['-started'],
        type: ['__$not', 'annotation_manual', '__$not', 'annotation', '__$not', 'dataset_import'],
        system_tags: ['-archived'],
        page_size: 1000
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
}


