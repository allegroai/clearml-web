import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {catchError, filter, flatMap, map, shareReplay, switchMap, withLatestFrom} from 'rxjs/operators';
import {ApiTasksService} from '../../../business-logic/api-services/tasks.service';
import {EXPERIMENT_INFO_ONLY_FIELDS} from '../../../features/experiments/experiments.consts';
import {selectExperimentFormValidity, selectExperimentInfoData, selectExperimentInfoDataFreeze, selectSelectedExperiment} from '../../../features/experiments/reducers';
import {IExperimentInfoState} from '../../../features/experiments/reducers/experiment-info.reducer';
import {ExperimentReverterService} from '../../../features/experiments/shared/services/experiment-reverter.service';
import {RequestFailed} from '../../core/actions/http.actions';
import {ActiveLoader, DeactiveLoader, SetBackdrop, SetServerError} from '../../core/actions/layout.actions';
import {selectAppVisible} from '../../core/reducers/view-reducer';
import * as commonInfoActions from '../actions/common-experiments-info.actions';
import * as infoActions from '../../../features/experiments/actions/experiments-info.actions';
import {UpdateExperiment} from '../actions/common-experiments-view.actions';
import {selectExperimentsList} from '../reducers';
import {convertStopToComplete} from '../shared/common-experiments.utils';
import {ExperimentConverterService} from '../../../features/experiments/shared/services/experiment-converter.service';


@Injectable()
export class CommonExperimentsInfoEffects {


  constructor(
    private actions$: Actions, private store: Store<IExperimentInfoState>,
    private apiTasks: ApiTasksService, private reverter: ExperimentReverterService,
    private converter: ExperimentConverterService
  ) {}

  @Effect()
  activeLoader       = this.actions$.pipe(
    ofType(commonInfoActions.GET_EXPERIMENT_INFO),
    map(action => new ActiveLoader(action.type))
  );

  @Effect()
  getExperimentInfo$ = this.actions$.pipe(
    ofType<commonInfoActions.GetExperimentInfo>(commonInfoActions.GET_EXPERIMENT_INFO, commonInfoActions.AUTO_REFRESH_EXPERIMENT_INFO),
    withLatestFrom(
      this.store.select(selectSelectedExperiment),
      this.store.select(selectExperimentsList),
      this.store.select(selectExperimentInfoData),
      this.store.select(selectAppVisible)
    ),
    filter(([action, selected, experiments, infoData, visible]) => {
      if (!infoData || !selected || !visible ) {
        return true;
      }
      const listed = experiments.find(e => e.id === selected.id);
      return !listed || new Date(selected.last_update) < new Date(listed.last_update);
    }),
    switchMap(([action]) =>
      this.apiTasks.tasksGetAllEx({id: [action.payload], only_fields: EXPERIMENT_INFO_ONLY_FIELDS})
        .pipe(
          flatMap(res => {
            let experiment = res.tasks[0];
            if (experiment) {
              experiment = convertStopToComplete([experiment])[0];
              return [
                new commonInfoActions.SetExperimentInfoData(this.reverter.revertExperiment(experiment)),
                new commonInfoActions.SetExperiment(experiment),
                new UpdateExperiment({id: action.payload, changes: experiment}),
                new DeactiveLoader(action.type),
                new DeactiveLoader(commonInfoActions.GET_EXPERIMENT_INFO)
              ];
            }
            else {
              return [
                new SetServerError('Experiment not found'),
                new DeactiveLoader(action.type),
                new SetServerError('Experiment not Found', null, 'Fetch experiment failed',
                  action.type === commonInfoActions.AUTO_REFRESH_EXPERIMENT_INFO)
              ];
            }
          }),
          catchError(error => {
            console.log(error);
            return [
              new RequestFailed(error),
              new DeactiveLoader(action.type),
              new DeactiveLoader(commonInfoActions.GET_EXPERIMENT_INFO),
              new SetServerError(error, null, 'Fetch experiment failed',
                action.type === commonInfoActions.AUTO_REFRESH_EXPERIMENT_INFO)
            ];
          })
        )
    )
  );

  @Effect()
    // Changes fields which can be applied regardless of experiment draft state i.e name, comments, tags
  updateExperimentDetails$ = this.actions$.pipe(
    ofType<infoActions.ExperimentDetailsUpdated>(infoActions.EXPERIMENT_DETAILS_UPDATED),
    withLatestFrom(
      this.store.select(selectExperimentInfoData),
      this.store.select(selectSelectedExperiment),
      this.store.select(selectExperimentFormValidity)
    ),
    filter(([action, infoData, selectedExperiment, valid]) => valid),
    flatMap(([action, infoData, selectedExperiment]) =>
      this.apiTasks.tasksUpdate({task: action.payload.id, ...action.payload.changes})
        .pipe(
          flatMap((res) => {
            const changes = res?.fields || action.payload.changes;
            return [
              new commonInfoActions.ExperimentUpdatedSuccessfully(),
              new UpdateExperiment({id: action.payload.id, changes }),
              new commonInfoActions.UpdateExperimentInfoData({id: action.payload.id, changes})
            ];
          }),
          catchError(err => [
            new RequestFailed(err),
            new SetServerError(err, null, 'Update Experiment failed'),
            new commonInfoActions.GetExperimentInfo(action.payload.id)
          ])
        )
    )
  );

  @Effect()
  saveExperimentData$ = this.actions$.pipe(
    ofType<infoActions.SaveExperiment>(infoActions.EXPERIMENT_SAVE),
    // Changes fields which can be applied Only on draft mode experiment
    withLatestFrom(
      this.store.select(selectExperimentInfoData),
      this.store.select(selectSelectedExperiment),
      this.store.select(selectExperimentInfoDataFreeze),
      this.store.select(selectExperimentFormValidity),
    ),
    filter(([action, infoData, selectedExperiment, infoFreeze, valid]) => valid),
    switchMap(([action, infoData, selectedExperiment, infoFreeze]) =>
      this.apiTasks.tasksEdit(this.converter.convertExperiment(infoData, selectedExperiment, infoFreeze))
        .pipe(
          flatMap((res) => [
            new commonInfoActions.ExperimentUpdatedSuccessfully(),
            new SetBackdrop(false)
            // new viewActions.UpdateExperiment({id: action.payload.id, changes: action.payload.changes}),
          ]),
          catchError(err => [
            new RequestFailed(err),
            new SetServerError(err),
            new commonInfoActions.ExperimentUpdatedSuccessfully(),
            new infoActions.CancelExperimentEdit(),
            new SetBackdrop(false)
          ])
        )
    ),
    shareReplay(1)
  );
}
