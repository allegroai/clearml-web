import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {ApiTasksService} from '~/business-logic/api-services/tasks.service';
import {ApiAuthService} from '~/business-logic/api-services/auth.service';
import {BlTasksService} from '~/business-logic/services/tasks.service';
import {ApiEventsService} from '~/business-logic/api-services/events.service';
import {Router} from '@angular/router';
import {catchError, map, mergeMap, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {activeLoader, addMessage, deactivateLoader, neverShowPopupAgain, setServerError} from '../../core/actions/layout.actions';
import * as menuActions from '../actions/common-experiments-menu.actions';
import {stopClicked} from '../actions/common-experiments-menu.actions';
import {Observable, of} from 'rxjs';
import {requestFailed} from '../../core/actions/http.actions';
import {ExperimentInfoState} from '~/features/experiments/reducers/experiment-info.reducer';
import {ExperimentConverterService} from '~/features/experiments/shared/services/experiment-converter.service';
import * as exSelectors from '../reducers';
import {selectSelectedExperiments, selectTableMode} from '../reducers';
import {selectSelectedExperiment} from '~/features/experiments/reducers';
import * as infoActions from '../actions/common-experiments-info.actions';
import {autoRefreshExperimentInfo, experimentDetailsUpdated} from '../actions/common-experiments-info.actions';
import {EmptyAction} from '~/app.constants';
import * as viewActions from '../actions/common-experiments-view.actions';
import {IExperimentInfo, ISelectedExperiment} from '~/features/experiments/shared/experiment-info.model';
import {ApiProjectsService} from '~/business-logic/api-services/projects.service';
import {TasksGetAllExResponse} from '~/business-logic/model/tasks/tasksGetAllExResponse';
import {ITask} from '~/business-logic/model/al-task';
import {RouterState, selectRouterConfig, selectRouterParams} from '../../core/reducers/router-reducer';
import {TasksArchiveManyResponse} from '~/business-logic/model/tasks/tasksArchiveManyResponse';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {TasksEnqueueManyResponse} from '~/business-logic/model/tasks/tasksEnqueueManyResponse';
import {getNotificationAction, MenuItems, MoreMenuItems} from '../../shared/entity-page/items.utils';
import {getAllSystemProjects} from '../../core/actions/projects.actions';
import {MatDialog} from '@angular/material/dialog';
import {ApiPipelinesService} from '~/business-logic/api-services/pipelines.service';
import {PIPELINE_INFO_ONLY_FIELDS} from '../../pipelines-controller/controllers.consts';
import {
  AbortAllChildrenDialogComponent
} from '../shared/components/abort-all-children-dialog/abort-all-children-dialog.component';
import {selectIsPipelines} from '@common/experiments-compare/reducers';
import {
  AbortControllerDialogComponent
} from '@common/pipelines-controller/pipeline-controller-menu/abort-controller-dialog/abort-controller-dialog.component';
import {get} from 'lodash/fp';
import {TaskTypeEnum} from '~/business-logic/model/tasks/taskTypeEnum';
import {TaskStatusEnum} from '~/business-logic/model/tasks/taskStatusEnum';
import {TasksCloneRequest} from '~/business-logic/model/tasks/tasksCloneRequest';
import {WelcomeMessageComponent} from '@common/layout/welcome-message/welcome-message.component';
import {selectNeverShowPopups} from '@common/core/reducers/view.reducer';
import {MESSAGES_SEVERITY} from '@common/constants';

export const getChildrenExperiments = (tasksApi, parents, filters?: { [key: string]: any }): Observable<Task[]> =>
  tasksApi.tasksGetAllEx({
    /* eslint-disable @typescript-eslint/naming-convention */
    page_size: 2000,
    only_fields: ['name', 'status'],
    status: [TaskStatusEnum.Queued, TaskStatusEnum.InProgress],
    parent: parents.map(p => p.id), ...(filters && filters)
    /* eslint-enable @typescript-eslint/naming-convention */
  })
    .pipe(
      map((res: TasksGetAllExResponse) => res.tasks),
      catchError(() => of([]))
    );

@Injectable()
export class CommonExperimentsMenuEffects {
  private selectedExperiment: IExperimentInfo;

  constructor(private actions$: Actions,
              private store: Store<ExperimentInfoState>,
              private apiTasks: ApiTasksService,
              private pipelineApi: ApiPipelinesService,
              private authApi: ApiAuthService,
              private taskBl: BlTasksService,
              private eventsApi: ApiEventsService,
              private projectApi: ApiProjectsService,
              private converter: ExperimentConverterService,
              private router: Router,
              private dialog: MatDialog
  ) {
    store.select(selectSelectedExperiment).subscribe(exp => this.selectedExperiment = exp);
  }

  activeLoader = createEffect(() => this.actions$.pipe(
    ofType(
      menuActions.restoreSelectedExperiments,
      menuActions.archiveSelectedExperiments,
      menuActions.publishClicked,
      menuActions.stopClicked,
      menuActions.changeProjectRequested,
      menuActions.startPipeline,
      menuActions.getControllerForStartPipelineDialog,
      menuActions.abortAllChildren
    ),
    map(action => activeLoader(action.type))));

  enqueueExperiment$ = createEffect(() => this.actions$.pipe(
    ofType(menuActions.enqueueClicked),
    withLatestFrom(this.store.select(selectSelectedExperiment)),
    switchMap(([action, selectedEntity]: [ReturnType<typeof menuActions.enqueueClicked>, IExperimentInfo]) => {
        const ids = action.selectedEntities.map(exp => exp.id);
        return this.apiTasks.tasksEnqueueMany({
          /* eslint-disable @typescript-eslint/naming-convention */
          ids,
          queue: action.queue.id, ...((!action.queue.id) && {queue_name: action.queue.name}),
          validate_tasks: true,
          ...( action.verifyWatchers && {verify_watched_queue: true})
          /* eslint-enable @typescript-eslint/naming-convention */
        })
          .pipe(
            withLatestFrom(this.store.select(selectNeverShowPopups)),
            tap(([res, neverShowAgainPopups]) => {
              if (res.queue_watched === false && !neverShowAgainPopups.includes('orphanedQueue')) {
                this.dialog.open(WelcomeMessageComponent, {
                  data: {
                    queue: res.queue,
                    step: 2
                  }
                }).afterClosed().subscribe(doNotShowAgain => {
                  if (doNotShowAgain) {
                    this.store.dispatch(neverShowPopupAgain({popupId: 'orphanedQueue'}));
                  }
                });
              }
            }),
            mergeMap(([res]) => this.updateExperimentsSuccess(action, MenuItems.enqueue, ids, selectedEntity, res)),
            catchError(error => this.updateExperimentFailed(action.type, error))
          );
      }
    )
  ));

  startPipeline$ = createEffect(() => this.actions$.pipe(
    ofType(menuActions.startPipeline),
    withLatestFrom(this.store.select(selectRouterParams).pipe(map(params => get('projectId', params)))),
    switchMap(([action, projectId]) =>
      this.pipelineApi.pipelinesStartPipeline({
          task: action.task, ...(action.queue && {queue: action.queue}),
          args: action.args
        })
        .pipe(
          mergeMap(res => [
            viewActions.getExperiments(),
            viewActions.setSelectedExperiments({experiments: []}),
            viewActions.experimentSelectionChanged({
              experiment: {id: res.pipeline},
              project: projectId
            }),
            deactivateLoader(action.type),
          ]),
          catchError(error => [
            deactivateLoader(action.type),
            setServerError(error, null, 'Run Pipeline failed'),
            requestFailed(error)
          ])
        )
    )
  ));

  getPipelineControllerForRunDialog$ = createEffect(() => this.actions$.pipe(
    ofType(menuActions.getControllerForStartPipelineDialog),
    withLatestFrom(this.store.select(selectRouterParams).pipe(map(params => get('projectId', params)))),
    switchMap(([action, projectId]) =>
      this.apiTasks.tasksGetAllEx({
        /* eslint-disable @typescript-eslint/naming-convention */
        project: projectId,
        type: [TaskTypeEnum.Controller],
        ...(action.task && {id: [action.task]}),
        ...(!action.task && {order_by: ['-started'], page_size: 1}),
        only_fields: PIPELINE_INFO_ONLY_FIELDS
        /* eslint-enable @typescript-eslint/naming-convention */
      }).pipe(
        mergeMap((res: any) => [
          menuActions.setControllerForStartPipelineDialog({task: res?.tasks[0]}),
          deactivateLoader(action.type)
        ]),
        catchError(error => [
            requestFailed(error),
            deactivateLoader(action.type),
          ]
        )
      )
    )
  ));


  dequeueExperiment$ = createEffect(() => this.actions$.pipe(
    ofType(menuActions.dequeueClicked),
    withLatestFrom(this.store.select(selectSelectedExperiment)),
    switchMap(([action, selectedEntity]) => {
        const ids = action.selectedEntities.map(exp => exp.id);
        return this.apiTasks.tasksDequeueMany({ids})
          .pipe(
            mergeMap(res => this.updateExperimentsSuccess(action, MenuItems.dequeue, ids, selectedEntity, res)),
            catchError(error => this.updateExperimentFailed(action.type, error))
          );
      }
    )
  ));


  cloneExperimentRequested$ = createEffect(() => this.actions$.pipe(
    ofType(menuActions.cloneExperimentClicked),
    withLatestFrom(this.store.select(selectTableMode)),
    switchMap(([action, ]) => this.apiTasks.tasksClone({
        task: action.originExperiment.id,
        /* eslint-disable @typescript-eslint/naming-convention */
        new_task_project: action.cloneData.project,
        new_task_comment: action.cloneData.comment,
        new_task_name: action.cloneData.name,
        new_project_name: action.cloneData.newProjectName
        /* eslint-enable @typescript-eslint/naming-convention */
      } as TasksCloneRequest)
        .pipe(
          mergeMap(res => {
            this.router.navigate(['projects', action.cloneData.project, 'experiments', res.id]);
            return [
              viewActions.getExperiments(),
              deactivateLoader(action.type),
              ...action.cloneData.newProjectName ? [getAllSystemProjects()] : [],
            ];
          }),
          catchError(error => [
            deactivateLoader(action.type),
            setServerError(error, null, 'Clone Experiment failed'),
            requestFailed(error)
          ])
        )
    )
  ));

  // resetExperiment$ = createEffect(() => this.actions$.pipe(
  //   ofType(menuActions.resetClicked),
  //   withLatestFrom(this.store.select(selectSelectedExperiment)),
  //   switchMap(
  //     ([action, selectedExp]) => {
  //       const ids = action.selectedEntities.map(exp => exp.id);
  //       return this.apiTasks.tasksResetMany({ids})
  //         .pipe(
  //           mergeMap((res: TasksResetManyResponse) =>
  //             [resetOutput(), ...this.updateExperimentsSuccess(action, MenuItems.reset, ids, selectedExp, res)]),
  //           catchError(error => this.updateExperimentFailed(action.type, error))
  //         );
  //     }
  //   )
  // ));

  publishExperiment$ = createEffect(() => this.actions$.pipe(
    ofType(menuActions.publishClicked),
    withLatestFrom(this.store.select(selectSelectedExperiment)),
    switchMap(([action, selectedEntity]) => {
      const ids = action.selectedEntities.map(exp => exp.id);
      return this.apiTasks.tasksPublishMany({ids})
        .pipe(
          mergeMap(res => this.updateExperimentsSuccess(action, MenuItems.publish, ids, selectedEntity, res)),
          catchError(error => this.updateExperimentFailed(action.type, error))
        );
    })
  ));

  abortAllChildren = createEffect(() => this.actions$.pipe(
    ofType(menuActions.abortAllChildren),
    withLatestFrom(this.store.select(selectIsPipelines)),
    switchMap(([action, isPipeline]) => getChildrenExperiments(this.apiTasks, action.experiments)
      .pipe(
        tap(() => this.store.dispatch(deactivateLoader(action.type))),
        mergeMap(shouldBeAbortedTasks => (isPipeline ? this.dialog.open(AbortControllerDialogComponent, {
          data: {tasks: action.experiments, shouldBeAbortedTasks}
        }) : this.dialog.open(AbortAllChildrenDialogComponent, {
          data: {tasks: action.experiments, shouldBeAbortedTasks}
        })).afterClosed()),
        mergeMap(confirmed => [
          confirmed ? stopClicked({selectedEntities: [...confirmed.shouldBeAbortedTasks, ...action.experiments]}) : new EmptyAction(),
          deactivateLoader(action.type)
        ]),
        catchError(error => [deactivateLoader(action.type), requestFailed(error), addMessage(MESSAGES_SEVERITY.ERROR, 'Failed to fetch tasks running children')])
      )),
  ));


  stopExperiment$ = createEffect(() => this.actions$.pipe(
    ofType(menuActions.stopClicked),
    withLatestFrom(this.store.select(selectSelectedExperiment)),
    switchMap(([action, selectedEntity]) => {
        const ids = action.selectedEntities.map(exp => exp.id);
        return this.apiTasks.tasksStopMany({ids})
          .pipe(
            mergeMap(res => this.updateExperimentsSuccess(action, MenuItems.abort, ids, selectedEntity, res)),
            catchError(error => this.updateExperimentFailed(action.type, error))
          );
      }
    )
  ));


  changeProject$ = createEffect(() => this.actions$.pipe(
    ofType(menuActions.changeProjectRequested),
    switchMap(
      action => this.apiTasks.tasksMove({
        ids: action.selectedEntities.map(exp => exp.id),
        project: action.project.id,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        project_name: action.project.name
      })
        .pipe(
          tap((res) => this.router.navigate([`projects/${action.project.id ? action.project.id : res.project_id}/experiments/${action.selectedEntities.length === 1 ? action.selectedEntities[0].id : ''}`], {queryParamsHandling: 'merge'})),
          mergeMap(() => [
            viewActions.resetExperiments(),
            viewActions.setSelectedExperiments({experiments: []}),
            ...action.selectedEntities.map(exp => this.setExperimentIfSelected(exp.id, {project: action.project})),
            deactivateLoader(action.type),
            viewActions.getExperiments()
          ]),
          catchError(error => [requestFailed(error), deactivateLoader(action.type), setServerError(error, null, 'Failed to move experiments')])
        )
    )
  ));

  private updateExperimentsSuccess(action, operationName: MenuItems, ids: string[], selectedEntity, res: TasksEnqueueManyResponse): Action[] {
    const actions = [
      // new RefreshExperiments({autoRefresh: false, hideLoader: true}),
      viewActions.updateManyExperiment({changeList: res.succeeded}),
      deactivateLoader(action.type)] as Action[];
    if (ids.includes(selectedEntity?.id)) {
      actions.push(autoRefreshExperimentInfo({id: selectedEntity.id}));
    }
    actions.push(getNotificationAction(res, action, operationName, EntityTypeEnum.experiment));
    return actions;
  }

  updateExperimentFailed(actionType, error) {
    return [
      requestFailed(error),
      deactivateLoader(actionType),
      setServerError(error)
    ];
  }

  setExperimentIfSelected(experimentId, payload) {
    if (this.selectedExperiment?.id === experimentId) {
      return infoActions.setExperiment({experiment: {...this.selectedExperiment, ...payload}});
    }
    return new EmptyAction();
  }

  addTag$ = createEffect(() => this.actions$.pipe(
    ofType(menuActions.addTag),
    withLatestFrom(this.store.select(selectSelectedExperiments), this.store.select(selectSelectedExperiment)),
    switchMap(([action, selectedExperiments, selectedExperimentInfo]) => {
      const experimentsFromState = selectedExperimentInfo ? selectedExperiments.concat(selectedExperimentInfo) as ISelectedExperiment[] : selectedExperiments;
      return action.experiments.map(experiment => {
        const experimentFromState = experimentsFromState.find(exp => exp.id === experiment.id);
        return experimentDetailsUpdated({
          id: experiment.id,
          changes: {tags: Array.from(new Set((experimentFromState?.tags || experiment.tags || []).concat([action.tag]))).sort()}
        });
      });
    })
  ));


  removeTag$ = createEffect(() => this.actions$.pipe(
    ofType(menuActions.removeTag),
    switchMap((action) =>
      action.experiments.filter(experiment => experiment.tags.includes(action.tag)).map(experiment =>
        experimentDetailsUpdated({
          id: experiment.id,
          changes: {tags: experiment.tags.filter(tag => tag !== action.tag)}
        })
      ).concat(addMessage('success', `“${action.tag}” tag has been removed from “${action.experiments[0]?.name}” experiment`, [
        {
          name: 'Undo',
          actions: [
            addMessage('success', `“${action.tag}” tag has been restored`),
            ...action.experiments.map(() => menuActions.addTag({
              experiments: action.experiments,
              tag: action.tag
            }))
          ]
        }]
      ) as any)
    )
  ));


  archiveExperiments = createEffect(() => this.actions$.pipe(
    ofType(menuActions.archiveSelectedExperiments),
    withLatestFrom(
      this.store.select(selectRouterParams),
      this.store.select(exSelectors.selectSelectedTableExperiment),
      this.store.select(selectRouterConfig),
    ),
    switchMap(([action, routerParams, selectedExperiment]) => this.apiTasks.tasksArchiveMany({ids: action.selectedEntities.map(exp => exp.id)})
      .pipe(
        withLatestFrom(this.store.select(selectRouterConfig)),
        mergeMap(([res, routerConfig]: [TasksArchiveManyResponse, RouterState['config']]) => {
          const experiments = action.selectedEntities;
          const allFailed = res.failed.length === experiments.length;
          const undoAction = [
            {
              name: 'Undo', actions: [
                viewActions.setSelectedExperiments({experiments}),
                menuActions.restoreSelectedExperiments({
                  selectedEntities: experiments,
                  skipUndo: true,
                  entityType: action.entityType
                })
              ]
            }
          ];
          let actions: Action[] = [
            deactivateLoader(action.type),
            viewActions.setSelectedExperiments({experiments: []}),
            getNotificationAction(res, action, MenuItems.archive, action.entityType || EntityTypeEnum.experiment, (action.skipUndo || allFailed) ? [] : undoAction)
          ];
          if (routerConfig.includes('experiments')) {
            const failedIds = res.failed.map(fail => fail.id);
            const successExperiments = experiments.map(exp => exp.id).filter(id => !failedIds.includes(id));
            actions = actions.concat([
              viewActions.removeExperiments({experiments: successExperiments}),
              viewActions.getExperiments()
            ]);
          }
          if (routerConfig.includes('output') && routerParams?.experimentId === experiments[0].id) {
            actions.push(experimentDetailsUpdated({
              id: experiments[0].id,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              changes: {system_tags: [...experiments[0]?.system_tags.filter(t => t !== 'shared'), 'archived'].sort()}
            }));
          }
          if (this.isSelectedExpInCheckedExps(action.selectedEntities, selectedExperiment)) {
            actions.push(viewActions.selectNextExperiment());
          }
          return actions;
        }),
        catchError(error => [
          requestFailed(error),
          deactivateLoader(action.type),
          setServerError(error, null, `Failed To Archive ${action.entityType || 'Experiment'}s`)
        ])
      )
    )
  ));


  restoreExperiments = createEffect(() => this.actions$.pipe(
    ofType(menuActions.restoreSelectedExperiments),
    withLatestFrom(
      this.store.select(selectRouterParams),
      this.store.select(exSelectors.selectSelectedTableExperiment),
      this.store.select(selectRouterConfig),
      this.store.select(selectTableMode)
    ),
    tap(([action, routerParams, selectedExperiment, routeConfig, tableMode]) => {
      if (this.isSelectedExpInCheckedExps(action.selectedEntities, selectedExperiment)) {
        const module = routeConfig.includes('pipelines') ? 'pipelines' : (routeConfig.includes('datasets') && routeConfig.includes('simple')) ? 'datasets/simple' : 'projects';
        this.router.navigate([`${module}/${routerParams.projectId}/experiments/${tableMode === 'info' ?
          (module === 'datasets/simple' ? routerParams.versionId : routerParams.experimentId) : ''}`]);
      }
    }),
    switchMap(([action, routerParams]) => this.apiTasks.tasksUnarchiveMany({ids: action.selectedEntities.map(exp => exp.id)})
      .pipe(
        withLatestFrom(this.store.select(selectRouterConfig)),
        mergeMap(([res, routerConfig]: [TasksArchiveManyResponse, RouterState['config']]) => {
          const experiments = action.selectedEntities;
          const allFailed = res.failed.length === experiments.length;
          const undoAction = [
            {
              name: 'Undo', actions: [
                viewActions.setSelectedExperiments({experiments}),
                menuActions.archiveSelectedExperiments({
                  selectedEntities: experiments,
                  skipUndo: true,
                  entityType: action.entityType
                })
              ]
            }
          ];
          let actions: Action[] = [
            deactivateLoader(action.type),
            viewActions.setSelectedExperiments({experiments: []}),
            getNotificationAction(res, action, MoreMenuItems.restore, action.entityType || EntityTypeEnum.experiment, (action.skipUndo || allFailed) ? [] : undoAction)
          ];
          if (routerConfig.includes('experiments')) {
            const failedIds = res.failed.map(fail => fail.id);
            const successExperiments = experiments.map(exp => exp.id).filter(id => !failedIds.includes(id));
            actions = actions.concat([
              viewActions.removeExperiments({experiments: successExperiments}),
              viewActions.getExperiments(),
            ]);
          }
          if (routerConfig.includes('output') && routerParams?.experimentId === experiments[0].id) {
            actions.push(experimentDetailsUpdated({
              id: experiments[0].id,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              changes: {system_tags: experiments[0]?.system_tags.filter(tag => tag !== 'archived')}
            }));
          }
          return actions;
        }),
        catchError(error => [
          requestFailed(error),
          deactivateLoader(action.type),
          setServerError(error, null, `Failed To Restore ${action.entityType || 'Experiment'}s`)
        ])
      )
    )
  ));


  navigateToQueue = createEffect(() => this.actions$.pipe(
    ofType(menuActions.navigateToQueue),
    withLatestFrom(this.store.select(selectSelectedExperiment)),
    switchMap(([action, info]) => {
      if (action.experimentId === info?.id && info?.execution?.queue?.id) {
        return of({tasks: [info]});
      } else {
        return this.apiTasks.tasksGetAllEx({
          id: [action.experimentId],
          // eslint-disable-next-line @typescript-eslint/naming-convention
          only_fields: ['execution.queue.id']
        });
      }
    }),
    map((res: TasksGetAllExResponse) => {
      const queue = (res.tasks[0] as unknown as ITask).execution.queue;
      return this.router.navigate(['/workers-and-queues/queues'], {queryParams: {id: queue.id}});
    })
  ), {dispatch: false});


  isSelectedExpInCheckedExps(checked: ISelectedExperiment[], selected: ISelectedExperiment): boolean {
    return selected && checked.some(exp => exp.id === selected.id);
  }

}
