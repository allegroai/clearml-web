import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {select, Store} from '@ngrx/store';
import {ApiTasksService} from '../../../business-logic/api-services/tasks.service';
import {ApiAuthService} from '../../../business-logic/api-services/auth.service';
import {BlTasksService} from '../../../business-logic/services/tasks.service';
import {ApiEventsService} from '../../../business-logic/api-services/events.service';
import {Router} from '@angular/router';
import {catchError, flatMap, map, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {ActiveLoader, AddMessage, DeactiveLoader, SetServerError} from '../../core/actions/layout.actions';
import * as menuActions from '../actions/common-experiments-menu.actions';
import * as viewActions from '../../../webapp-common/experiments/actions/common-experiments-view.actions';
import {of} from 'rxjs';
import {ITableExperiment} from '../shared/common-experiment-model.model';
import {RequestFailed} from '../../core/actions/http.actions';
import {IExperimentInfoState} from '../../../features/experiments/reducers/experiment-info.reducer';
import {ExperimentConverterService} from '../../../features/experiments/shared/services/experiment-converter.service';
import {selectSelectedExperiments} from '../reducers';
import {Task} from '../../../business-logic/model/tasks/task';
import {selectSelectedExperiment} from '../../../features/experiments/reducers';
import * as infoActions from '../actions/common-experiments-info.actions';
import {EmptyAction} from '../../../app.constants';
import * as commonViewActions from '../actions/common-experiments-view.actions';
import {SmSyncStateSelectorService} from '../../core/services/sync-state-selector.service';
import {RefreshExperiments, ResetExperiments, SetSelectedExperiments} from '../actions/common-experiments-view.actions';
import {AutoRefreshExperimentInfo} from '../actions/common-experiments-info.actions';
import {addTag, removeTag} from '../actions/common-experiments-menu.actions';
import {ExperimentDetailsUpdated} from '../../../features/experiments/actions/experiments-info.actions';
import {ISelectedExperiment} from '../../../features/experiments/shared/experiment-info.model';
import {ResetOutput} from '../actions/common-experiment-output.actions';


@Injectable()
export class CommonExperimentsMenuEffects {

  constructor(private actions$: Actions, private store: Store<IExperimentInfoState>, private apiTasks: ApiTasksService,
              private authApi: ApiAuthService, private taskBl: BlTasksService, private eventsApi: ApiEventsService,
              private converter: ExperimentConverterService,
              private router: Router, private syncSelector: SmSyncStateSelectorService
  ) {
  }

  @Effect()
  activeLoader = this.actions$.pipe(
    ofType(
      menuActions.RESET_CLICKED,
      menuActions.PUBLISH_CLICKED,
      menuActions.STOP_CLICKED,
      menuActions.ARCHIVE_CLICKED,
      menuActions.RESTORE_CLICKED,
      menuActions.CHANGE_PROJECT_REQUESTED,
      menuActions.RESTORE_CLICKED),
    map(action => new ActiveLoader(action.type)));

  @Effect()
  enqueueExperiment$ = this.actions$.pipe(
    ofType<menuActions.EnqueueClicked>(menuActions.ENQUEUE_CLICKED),
    switchMap(action => this.apiTasks.tasksGetAll({id: [action.payload.experiment.id]})
      .pipe(
        flatMap((infoData) =>
          this.apiTasks.tasksValidate(infoData['tasks'][0]).pipe(
            map(res => ([action, {pass: true, err: null}])),
          )
        ),
        catchError(err => of([action, {pass: false, err}])),
      )),
    switchMap(([action, validation]: [menuActions.EnqueueClicked, { pass: boolean; err: any }]) =>
      validation.pass ?
        this.apiTasks.tasksEnqueue({task: action.payload.experiment.id, queue: action.payload.queue.id})
          .pipe(
            flatMap(res => this.updateExperimentSuccess(action.payload.experiment.id, action.type, res.fields)),
            catchError(error => this.updateExperimentFailed(action.type, error))
          ) :
        [new SetServerError(validation.err), new DeactiveLoader(action.type)]
    )
  );


  @Effect()
  dequeueExperiment$ = this.actions$.pipe(
    ofType<menuActions.DequeueClicked>(menuActions.DEQUEUE_CLICKED),
    switchMap(
      action => this.apiTasks.tasksDequeue({task: action.payload.id})
        .pipe(
          flatMap(res => this.updateExperimentSuccess(action.payload.id, action.type, res.fields)),
          catchError(error => this.updateExperimentFailed(action.type, error))
        )
    )
  );


  @Effect()
  cloneExperimentRequested$ = this.actions$.pipe(
    ofType<menuActions.CloneExperimentClicked>(menuActions.CLONE_EXPERIMENT_CLICKED),
    switchMap(action => this.apiTasks.tasksClone({
        task: action.payload.originExperiment.id,
        new_task_project: action.payload.cloneData.project,
        new_task_comment: action.payload.cloneData.comment,
        new_task_name: action.payload.cloneData.name
      })
        .pipe(
          flatMap(res => [
            new viewActions.GetExperiments(),
            new viewActions.SetSelectedExperiments([]),
            new DeactiveLoader(action.type),
            new viewActions.ExperimentSelectionChanged({experiment: {id: res.id}, project: action.payload.cloneData.project}),
          ]),
          catchError(error => [
            new DeactiveLoader(action.type),
            new SetServerError(error, null, 'Clone Experiment failed')
          ])
        )
    )
  );

  @Effect()
  resetExperiment$ = this.actions$.pipe(
    ofType<menuActions.ResetClicked>(menuActions.RESET_CLICKED),
    switchMap(
      action => this.apiTasks.tasksReset({task: action.payload.id})
        .pipe(
          flatMap((res) => [new ResetOutput()]
            .concat(this.updateExperimentSuccess(action.payload.id, action.type, res.fields))),
          catchError(error => this.updateExperimentFailed(action.type, error))
        )
    )
  );

  @Effect()
  publishExperiment$ = this.actions$.pipe(
    ofType<menuActions.PublishClicked>(menuActions.PUBLISH_CLICKED),
    switchMap(
      action => this.apiTasks.tasksPublish({task: action.payload.id})
        .pipe(
          flatMap(res => this.updateExperimentSuccess(action.payload.id, action.type, res.fields)),
          catchError(error => this.updateExperimentFailed(action.type, error))
        )
    )
  );

  @Effect()
  stopExperiment$ = this.actions$.pipe(
    ofType<menuActions.StopClicked>(menuActions.STOP_CLICKED),
    switchMap(
      action => this.apiTasks.tasksStop({task: action.payload.id})
        .pipe(
          flatMap(res => this.updateExperimentSuccess(action.payload.id, action.type, res.fields)),
          catchError(error => this.updateExperimentFailed(action.type, error))
        )
    )
  );

  @Effect()
  changeProject$ = this.actions$.pipe(
    ofType<menuActions.ChangeProjectRequested>(menuActions.CHANGE_PROJECT_REQUESTED),
    switchMap(
      action => this.apiTasks.tasksUpdate({task: action.payload.experiment.id, project: action.payload.project.id})
        .pipe(
          flatMap(() => [
            new ResetExperiments(),
            new SetSelectedExperiments([]),
            this.setExperimentIfSelected(action.payload.experiment.id, {project: action.payload.project}),
            new DeactiveLoader(action.type)
          ]),
          tap(() => this.router.navigate([`projects/${action.payload.project.id}/experiments/${action.payload.experiment.id}`], {queryParamsHandling: 'merge'})),
          catchError(error => [new RequestFailed(error), new DeactiveLoader(action.type)])
        )
    )
  );

  updateExperimentSuccess(id: Task['id'], actionType, fields: Partial<Task>) {
    return [
      this.setExperimentIfSelected(id, fields),
      new commonViewActions.UpdateExperiment({id: id, changes: fields}),
      new AutoRefreshExperimentInfo(id),
      new DeactiveLoader(actionType)
    ];
  }

  updateExperimentFailed(actionType, error) {
    return [
      new RequestFailed(error),
      new DeactiveLoader(actionType),
      new SetServerError(error)
    ];
  }

  setExperimentIfSelected(experimentId, payload) {
    const selected = this.syncSelector.selectSync(selectSelectedExperiment);
    if (selected && selected.id === experimentId) {
      return new infoActions.SetExperiment({...selected, ...payload});
    }
    return new EmptyAction();
  }

  @Effect()
  addTag$ = this.actions$.pipe(
    ofType(addTag),
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
  );

  @Effect()
  removeTag$ = this.actions$.pipe(
    ofType(removeTag),
    switchMap((action) =>
      action.experiments.map(experiment => {
        if (experiment.tags.includes(action.tag)) {
          return new ExperimentDetailsUpdated({
            id: experiment.id,
            changes: {tags: experiment.tags.filter(tag => tag !== action.tag)}
          });
        } else {
          return false;
        }
      }).filter(update => update !== false)
        .concat(new AddMessage('success', `“${action.tag}” tag has been removed from “${action.experiments[0]?.name}” experiment`, [
            {
              name: 'Undo',
              actions: [
                new AddMessage('success', `“${action.tag}” tag has been restored`),
                ...action.experiments.map(experiment => addTag({
                    experiments: action.experiments,
                    tag: action.tag
                  })
                )
              ]
            }
          ]
        ) as any)
    )
  );
}
