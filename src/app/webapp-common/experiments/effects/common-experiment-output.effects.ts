import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {ApiTasksService} from '../../../business-logic/api-services/tasks.service';
import {ApiAuthService} from '../../../business-logic/api-services/auth.service';
import {BlTasksService} from '../../../business-logic/services/tasks.service';
import {ApiEventsService} from '../../../business-logic/api-services/events.service';
import {catchError, debounceTime, filter, mergeMap, map, switchMap, withLatestFrom} from 'rxjs/operators';
import {ActiveLoader, DeactiveLoader, SetServerError} from '../../core/actions/layout.actions';
import {RequestFailed} from '../../core/actions/http.actions';
import * as outputActions from '../actions/common-experiment-output.actions';
import {ExperimentOutputState} from '../../../features/experiments/reducers/experiment-output.reducer';
import {LOG_BATCH_SIZE} from '../shared/common-experiments.const';
import {selectSelectedSettingsxAxisType} from '../reducers';
import {REFRESH_EXPERIMENTS} from '../actions/common-experiments-view.actions';
import {EventsGetTaskLogResponse} from '../../../business-logic/model/events/eventsGetTaskLogResponse';
import {HTTP} from '../../../app.constants';
import {ScalarKeyEnum} from '../../../business-logic/model/events/scalarKeyEnum';
import {selectCompareHistogramCacheAxisType} from '../../experiments-compare/reducers';


@Injectable()
export class CommonExperimentOutputEffects {
  @Effect()
  activeLoader = this.actions$.pipe(
    ofType(outputActions.CHANGE_PROJECT_REQUESTED, outputActions.getExperimentLog, outputActions.EXPERIMENT_SCALAR_REQUESTED, outputActions.EXPERIMENT_PLOTS_REQUESTED),
    filter(action => !action?.['from']),
    map(action => new ActiveLoader(action.type))
  );

  @Effect()
  getLog$ = this.actions$.pipe(
    ofType(outputActions.getExperimentLog),
    switchMap((action) =>
      this.eventsApi.eventsGetTaskLog({
        task: action.id,
        batch_size: LOG_BATCH_SIZE,
        navigate_earlier: action.direction !== 'next',
        from_timestamp: action.refresh ? null : action.from,
      }).pipe(
        mergeMap((res: EventsGetTaskLogResponse) => [
          outputActions.setExperimentLog({
            events: res.events,
            total: res.total,
            direction: action.direction,
            refresh: action.refresh
          }),
          new DeactiveLoader(action.type),
          new DeactiveLoader(REFRESH_EXPERIMENTS)
        ]),
        catchError(error => [
          new RequestFailed(error),
          new DeactiveLoader(action.type),
          new DeactiveLoader(REFRESH_EXPERIMENTS),
          new SetServerError(error, null, 'Failed to fetch log')
        ])
      )
    )
  );

  @Effect()
  fetchExperimentScalar$ = this.actions$.pipe(
    ofType<outputActions.ExperimentScalarRequested>(outputActions.EXPERIMENT_SCALAR_REQUESTED),
    debounceTime(200),
    withLatestFrom(this.store.select(selectSelectedSettingsxAxisType), this.store.select(selectCompareHistogramCacheAxisType)),
    switchMap(([action, axisType, prevAxisType]) => {
      if ([ScalarKeyEnum.IsoTime, ScalarKeyEnum.Timestamp].includes(prevAxisType) &&
        [ScalarKeyEnum.IsoTime, ScalarKeyEnum.Timestamp].includes(axisType)) {
        return [
          new DeactiveLoader(REFRESH_EXPERIMENTS),
          new DeactiveLoader(action.type)
        ];
      }

      return this.eventsApi.eventsScalarMetricsIterHistogram({task: action.payload, key: axisType === ScalarKeyEnum.IsoTime ? ScalarKeyEnum.Timestamp : axisType})
        .pipe(
          mergeMap(res => [
            new outputActions.SetExperimentHistogram(res, axisType),
            new DeactiveLoader(REFRESH_EXPERIMENTS),
            new DeactiveLoader(action.type)
          ]),
          catchError(error => [
            new RequestFailed(error),
            new DeactiveLoader(action.type),
            new DeactiveLoader(REFRESH_EXPERIMENTS),
            new SetServerError(error, null, 'Failed to get Scalar Charts')
          ])
        );}
    )
  );

  @Effect()
  fetchExperimentPlots$ = this.actions$.pipe(
    ofType<outputActions.ExperimentPlotsRequested>(outputActions.EXPERIMENT_PLOTS_REQUESTED),
    debounceTime(200),
    switchMap(action =>
      this.eventsApi.eventsGetTaskPlots({task: action.payload, iters: 5})
        .pipe(
          mergeMap(res => [
            new outputActions.SetExperimentPlots(res.plots),
            new DeactiveLoader(REFRESH_EXPERIMENTS),
            new DeactiveLoader(action.type),
          ]),
          catchError(error => [
            new RequestFailed(error),
            new DeactiveLoader(action.type),
            new DeactiveLoader(REFRESH_EXPERIMENTS),
            new SetServerError(error, null, 'Failed to get Plot Charts')
          ])
        )
    )
  );

  @Effect({dispatch: false})
  downloadFullLog$ = this.actions$.pipe(
    ofType(outputActions.downloadFullLog),
    filter(action => !!action.experimentId),
    map(action => {
      const a = document.createElement('a');
      a.href = `${HTTP.API_BASE_URL}/events.download_task_log?line_type=text&task=${action.experimentId}`;
      a.target = '_blank';
      a.download= 'Log';
      a.click();
    })
  );

  constructor(
    private actions$: Actions, private store: Store<ExperimentOutputState>, private apiTasks: ApiTasksService,
    private authApi: ApiAuthService, private taskBl: BlTasksService, private eventsApi: ApiEventsService
  ) {}
}
