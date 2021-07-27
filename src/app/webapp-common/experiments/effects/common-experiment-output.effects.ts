import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {ApiTasksService} from '../../../business-logic/api-services/tasks.service';
import {ApiAuthService} from '../../../business-logic/api-services/auth.service';
import {BlTasksService} from '../../../business-logic/services/tasks.service';
import {ApiEventsService} from '../../../business-logic/api-services/events.service';
import {catchError, filter, mergeMap, map, switchMap, withLatestFrom} from 'rxjs/operators';
import {activeLoader, deactivateLoader, setServerError} from '../../core/actions/layout.actions';
import {requestFailed} from '../../core/actions/http.actions';
import * as outputActions from '../actions/common-experiment-output.actions';
import {ExperimentOutputState} from '../../../features/experiments/reducers/experiment-output.reducer';
import {LOG_BATCH_SIZE} from '../shared/common-experiments.const';
import {selectSelectedSettingsxAxisType} from '../reducers';
import {refreshExperiments} from '../actions/common-experiments-view.actions';
import {EventsGetTaskLogResponse} from '../../../business-logic/model/events/eventsGetTaskLogResponse';
import {HTTP} from '../../../app.constants';
import {ScalarKeyEnum} from '../../../business-logic/model/events/scalarKeyEnum';
import {selectCompareHistogramCacheAxisType} from '../../experiments-compare/reducers';


@Injectable()
export class CommonExperimentOutputEffects {
  activeLoader = createEffect(() => this.actions$.pipe(
    ofType(outputActions.CHANGE_PROJECT_REQUESTED, outputActions.getExperimentLog, outputActions.EXPERIMENT_SCALAR_REQUESTED, outputActions.EXPERIMENT_PLOTS_REQUESTED),
    filter(action => !action?.['from']),
    map(action => activeLoader(action.type))
  ));

  getLog$ = createEffect(() => this.actions$.pipe(
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
          deactivateLoader(action.type),
          deactivateLoader(refreshExperiments.type)
        ]),
        catchError(error => [
          requestFailed(error),
          deactivateLoader(action.type),
          deactivateLoader(refreshExperiments.type),
          setServerError(error, null, 'Failed to fetch log')
        ])
      )
    )
  ));

  fetchExperimentScalar$ = createEffect(() => this.actions$.pipe(
    ofType<outputActions.ExperimentScalarRequested>(outputActions.EXPERIMENT_SCALAR_REQUESTED),
    withLatestFrom(this.store.select(selectSelectedSettingsxAxisType), this.store.select(selectCompareHistogramCacheAxisType)),
    switchMap(([action, axisType, prevAxisType]) => {
      if ([ScalarKeyEnum.IsoTime, ScalarKeyEnum.Timestamp].includes(prevAxisType) &&
        [ScalarKeyEnum.IsoTime, ScalarKeyEnum.Timestamp].includes(axisType)) {
        return [
          deactivateLoader(refreshExperiments.type),
          deactivateLoader(action.type)
        ];
      }

      return this.eventsApi.eventsScalarMetricsIterHistogram({task: action.payload, key: axisType === ScalarKeyEnum.IsoTime ? ScalarKeyEnum.Timestamp : axisType})
        .pipe(
          mergeMap(res => [
            new outputActions.SetExperimentHistogram(res, axisType),
            deactivateLoader(refreshExperiments.type),
            deactivateLoader(action.type)
          ]),
          catchError(error => [
            requestFailed(error),
            deactivateLoader(action.type),
            deactivateLoader(refreshExperiments.type),
            setServerError(error, null, 'Failed to get Scalar Charts')
          ])
        );}
    )
  ));

  fetchExperimentPlots$ = createEffect(() => this.actions$.pipe(
    ofType<outputActions.ExperimentPlotsRequested>(outputActions.EXPERIMENT_PLOTS_REQUESTED),
    switchMap(action =>
      this.eventsApi.eventsGetTaskPlots({task: action.payload, iters: 5})
        .pipe(
          mergeMap(res => [
            new outputActions.SetExperimentPlots(res.plots),
            deactivateLoader(refreshExperiments.type),
            deactivateLoader(action.type),
          ]),
          catchError(error => [
            requestFailed(error),
            deactivateLoader(action.type),
            deactivateLoader(refreshExperiments.type),
            setServerError(error, null, 'Failed to get Plot Charts')
          ])
        )
    )
  ));

  downloadFullLog$ = createEffect(() => this.actions$.pipe(
    ofType(outputActions.downloadFullLog),
    filter(action => !!action.experimentId),
    map(action => {
      const a = document.createElement('a');
      a.href = `${HTTP.API_BASE_URL}/events.download_task_log?line_type=text&task=${action.experimentId}`;
      a.target = '_blank';
      a.download= 'Log';
      a.click();
    })
  ), {dispatch: false});

  constructor(
    private actions$: Actions, private store: Store<ExperimentOutputState>, private apiTasks: ApiTasksService,
    private authApi: ApiAuthService, private taskBl: BlTasksService, private eventsApi: ApiEventsService
  ) {}
}
