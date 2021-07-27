import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {ApiTasksService} from '../../../business-logic/api-services/tasks.service';
import {ApiAuthService} from '../../../business-logic/api-services/auth.service';
import {BlTasksService} from '../../../business-logic/services/tasks.service';
import {ApiEventsService} from '../../../business-logic/api-services/events.service';
import {Router} from '@angular/router';
import {catchError, map, mergeMap, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {activeLoader, addMessage, deactivateLoader, setServerError} from '../../core/actions/layout.actions';
import * as menuActions from '../actions/common-experiments-menu.actions';
import {of} from 'rxjs';
import {requestFailed} from '../../core/actions/http.actions';
import {IExperimentInfoState} from '../../../features/experiments/reducers/experiment-info.reducer';
import {ExperimentConverterService} from '../../../features/experiments/shared/services/experiment-converter.service';
import * as exSelectors from '../reducers';
import {selectSelectedExperiments} from '../reducers';
import {Task} from '../../../business-logic/model/tasks/task';
import {selectSelectedExperiment} from '../../../features/experiments/reducers';
import * as infoActions from '../actions/common-experiments-info.actions';
import {AutoRefreshExperimentInfo, ExperimentDetailsUpdated} from '../actions/common-experiments-info.actions';
import {EmptyAction, MESSAGES_SEVERITY} from '../../../app.constants';
import * as viewActions from '../actions/common-experiments-view.actions';
import {SmSyncStateSelectorService} from '../../core/services/sync-state-selector.service';
import {IExperimentInfo, ISelectedExperiment} from '../../../features/experiments/shared/experiment-info.model';
import {ResetOutput} from '../actions/common-experiment-output.actions';
import {ApiProjectsService} from '../../../business-logic/api-services/projects.service';
import {TasksGetAllExResponse} from '../../../business-logic/model/tasks/tasksGetAllExResponse';
import {ITask} from '../../../business-logic/model/al-task';
import {TasksResetManyResponse} from '../../../business-logic/model/tasks/tasksResetManyResponse';
import {MatDialog} from '@angular/material/dialog';
import {RouterState, selectRouterConfig, selectRouterParams} from '../../core/reducers/router-reducer';
import {TasksArchiveManyResponse} from '../../../business-logic/model/tasks/tasksArchiveManyResponse';
import {EntityTypeEnum} from '../../../shared/constants/non-common-consts';
import {TasksEnqueueManyResponse} from '../../../business-logic/model/tasks/tasksEnqueueManyResponse';
import {getNotificationAction, MenuItems, MoreMenuItems} from '../../shared/entity-page/items.utils';


@Injectable()
export class CommonExperimentsMenuEffects {

  constructor(private actions$: Actions, private store: Store<IExperimentInfoState>, private apiTasks: ApiTasksService,
              private authApi: ApiAuthService, private taskBl: BlTasksService, private eventsApi: ApiEventsService,
              private projectApi: ApiProjectsService,
              private converter: ExperimentConverterService,
              private router: Router, private syncSelector: SmSyncStateSelectorService,
              private matDialog: MatDialog
  ) {
  }

  activeLoader = createEffect(() => this.actions$.pipe(
    ofType(
      menuActions.restoreSelectedExperiments,
      menuActions.archiveSelectedExperiments,
      menuActions.resetClicked,
      menuActions.publishClicked,
      menuActions.stopClicked,
      menuActions.changeProjectRequested),
    map(action => activeLoader(action.type))));

  enqueueExperiment$ = createEffect(() => this.actions$.pipe(
    ofType(menuActions.enqueueClicked),
    withLatestFrom(this.store.select(selectSelectedExperiment)),
    switchMap(([action, selectedEntity]: [ReturnType<typeof menuActions.enqueueClicked>, IExperimentInfo]) => {
        const ids = action.selectedEntities.map(exp => exp.id);
        return this.apiTasks.tasksEnqueueMany({ids, queue: action.queue.id, validate_tasks: true})
          .pipe(
            mergeMap(res => this.updateExperimentsSuccess(action, MenuItems.enqueue, ids, selectedEntity, res)),
            catchError(error => this.updateExperimentFailed(action.type, error))
          );
      }
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
    ofType<menuActions.CloneExperimentClicked>(menuActions.CLONE_EXPERIMENT_CLICKED),
    switchMap(action => this.apiTasks.tasksClone({
        task: action.payload.originExperiment.id,
        new_task_project: action.payload.cloneData.project,
        new_task_comment: action.payload.cloneData.comment,
        new_task_name: action.payload.cloneData.name,
        new_project_name: action.payload.cloneData.newProjectName
      })
        .pipe(
          mergeMap(res => [
            viewActions.getExperiments(),
            viewActions.setSelectedExperiments({experiments: []}),
            deactivateLoader(action.type),
            viewActions.experimentSelectionChanged({
              experiment: {id: res.id},
              project: action.payload.cloneData.project ? action.payload.cloneData.project : res?.new_project?.id
            }),
          ]),
          catchError(error => [
            deactivateLoader(action.type),
            setServerError(error, null, 'Clone Experiment failed')
          ])
        )
    )
  ));

  resetExperiment$ = createEffect(() => this.actions$.pipe(
    ofType(menuActions.resetClicked),
    withLatestFrom(this.store.select(selectSelectedExperiment)),
    switchMap(
      ([action, selectedExp]) => {
        const ids = action.selectedEntities.map(exp => exp.id);
        return this.apiTasks.tasksResetMany({ids})
          .pipe(
            mergeMap((res: TasksResetManyResponse) =>
              [new ResetOutput(), ...this.updateExperimentsSuccess(action, MenuItems.reset, ids, selectedExp, res)]),
            catchError(error => this.updateExperimentFailed(action.type, error))
          );
      }
    )
  ));

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

  shareExperiments = createEffect(() => this.actions$.pipe(
    ofType(menuActions.shareSelectedExperiments),
    withLatestFrom(this.store.select(exSelectors.selectExperimentsList)),
    switchMap(([action, experiments]) => this.apiTasks.tasksShare({
      tasks: [action.task],
      share: action.share
    })
      .pipe(
        mergeMap(() => {
            const experiment = experiments.filter(exp => exp.id === action.task)[0];
            if (experiment) {
              return this.updateExperimentSuccess(action.task, action.type,
                {
                  system_tags: (
                    action.share ?
                      [...experiment.system_tags, 'shared'] :
                      experiment.system_tags.filter((tag) => tag !== 'shared')
                  )
                }).concat([addMessage(MESSAGES_SEVERITY.SUCCESS, action.share ? 'A shareable link created successfully' : 'A shareable link removed successfully')]);
            } else {
              return [new AutoRefreshExperimentInfo(action.task)];
            }
          }
        ),
        catchError(error => this.updateExperimentFailed(action.type, error))
      )
    )
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
          catchError(error => [requestFailed(error), deactivateLoader(action.type)])
        )
    )
  ));

  private updateExperimentsSuccess(action, operationName: MenuItems, ids: string[], selectedEntity, res: TasksEnqueueManyResponse): Action[] {
    const actions = [
      // new RefreshExperiments({autoRefresh: false, hideLoader: true}),
      viewActions.updateManyExperiment({changeList: res.succeeded}),
      deactivateLoader(action.type)] as Action[];
    if (ids.includes(selectedEntity?.id)) {
      actions.push(new AutoRefreshExperimentInfo(selectedEntity.id));
    }
    actions.push(getNotificationAction(res, action, operationName, EntityTypeEnum.experiment));
    return actions;
  }

  updateExperimentSuccess(id: Task['id'], actionType, fields: Partial<Task>) {
    return [
      this.setExperimentIfSelected(id, fields),
      viewActions.updateExperiment({id, changes: fields}),
      new AutoRefreshExperimentInfo(id),
      deactivateLoader(actionType)
    ] as Action[];
  }

  updateExperimentFailed(actionType, error) {
    return [
      requestFailed(error),
      deactivateLoader(actionType),
      setServerError(error)
    ];
  }

  setExperimentIfSelected(experimentId, payload) {
    const selected = this.syncSelector.selectSync(selectSelectedExperiment);
    if (selected && selected.id === experimentId) {
      return new infoActions.SetExperiment({...selected, ...payload});
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
        return new ExperimentDetailsUpdated({
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
        new ExperimentDetailsUpdated({
          id: experiment.id,
          changes: {tags: experiment.tags.filter(tag => tag !== action.tag)}
        })
      ).concat(addMessage('success', `“${action.tag}” tag has been removed from “${action.experiments[0]?.name}” experiment`, [
        {
          name: 'Undo',
          actions: [
            addMessage('success', `“${action.tag}” tag has been restored`),
            ...action.experiments.map(experiment => menuActions.addTag({
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
      this.store.select(exSelectors.selectSelectedTableExperiment)),
    tap(([action, routerParams, selectedExperiment]) => {
      if (this.isSelectedExpInCheckedExps(action.selectedEntities, selectedExperiment)) {
        this.router.navigate([`projects/${routerParams.projectId}/experiments/`]);
      }
    }),
    switchMap(([action, routerParams]) => this.apiTasks.tasksArchiveMany({ids: action.selectedEntities.map(exp => exp.id)})
      .pipe(
        withLatestFrom(this.store.select(selectRouterConfig)),
        mergeMap(([res, routerConfig]: [TasksArchiveManyResponse, RouterState['config']]) => {
          const experiments = action.selectedEntities;
          const allFailed = res.failed.length === experiments.length;
          const undoAction = [
            {
              name: 'Undo', actions: [
                viewActions.setSelectedExperiments({experiments}),
                menuActions.restoreSelectedExperiments({selectedEntities: experiments, skipUndo: true})
              ]
            }
          ];
          let actions: Action[] = [
            deactivateLoader(action.type),
            viewActions.setSelectedExperiments({experiments: []}),
            getNotificationAction(res, action, MenuItems.archive, EntityTypeEnum.experiment, (action.skipUndo || allFailed) ? [] : undoAction)
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
            actions.push(new ExperimentDetailsUpdated({
              id: experiments[0].id,
              changes: {system_tags: [...experiments[0]?.system_tags.filter(t => t !== 'shared'), 'archived'].sort()}
            }));
          }
          return actions;
        }),
        catchError(error => [
          requestFailed(error),
          deactivateLoader(action.type),
          setServerError(error, null, 'Failed To Archive Experiments')
        ])
      )
    )
  ));


  restoreExperiments = createEffect(() => this.actions$.pipe(
    ofType(menuActions.restoreSelectedExperiments),
    withLatestFrom(
      this.store.select(selectRouterParams),
      this.store.select(exSelectors.selectSelectedTableExperiment)),
    tap(([action, routerParams, selectedExperiment]) => {
      if (this.isSelectedExpInCheckedExps(action.selectedEntities, selectedExperiment)) {
        this.router.navigate([`projects/${routerParams.projectId}/experiments/`]);
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
                menuActions.archiveSelectedExperiments({selectedEntities: experiments, skipUndo: true})
              ]
            }
          ];
          let actions: Action[] = [
            deactivateLoader(action.type),
            viewActions.setSelectedExperiments({experiments: []}),
            getNotificationAction(res, action, MoreMenuItems.restore, EntityTypeEnum.experiment, (action.skipUndo || allFailed) ? [] : undoAction)
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
            actions.push(new ExperimentDetailsUpdated({
              id: experiments[0].id,
              changes: {system_tags: experiments[0]?.system_tags.filter(tag => tag !== 'archived')}
            }));
          }
          return actions;
        }),
        catchError(error => [
          requestFailed(error),
          deactivateLoader(action.type),
          setServerError(error, null, 'Failed To Restore Experiments')
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
