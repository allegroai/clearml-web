import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {ApiTasksService} from '../../../business-logic/api-services/tasks.service';
import {ApiAuthService} from '../../../business-logic/api-services/auth.service';
import {BlTasksService} from '../../../business-logic/services/tasks.service';
import {ApiEventsService} from '../../../business-logic/api-services/events.service';
import {catchError, expand, filter, map, mergeMap, reduce, switchMap, withLatestFrom} from 'rxjs/operators';
import {activeLoader, deactivateLoader, setServerError} from '../../core/actions/layout.actions';
import {requestFailed} from '../../core/actions/http.actions';
import * as outputActions from '../actions/common-experiment-output.actions';
import {
  mergeGraphDisplayFullDetailsScalars,
  setXtypeGraphDisplayFullDetailsScalars
} from '../actions/common-experiment-output.actions';
import {ExperimentOutputState} from '../../../features/experiments/reducers/experiment-output.reducer';
import {LOG_BATCH_SIZE} from '../shared/common-experiments.const';
import {
  selectFullScreenChart,
  selectFullScreenChartIsOpen,
  selectFullScreenChartXtype,
  selectSelectedSettingsxAxisType
} from '../reducers';
import {refreshExperiments} from '../actions/common-experiments-view.actions';
import {EventsGetTaskLogResponse} from '../../../business-logic/model/events/eventsGetTaskLogResponse';
import {HTTP} from '../../../app.constants';
import {ScalarKeyEnum} from '../../../business-logic/model/events/scalarKeyEnum';
import {EMPTY} from 'rxjs';
import {getOr} from 'lodash/fp';
import {selectCompareHistogramCacheAxisType} from '../../experiments-compare/reducers';


@Injectable()
export class CommonExperimentOutputEffects {

  constructor(
    private actions$: Actions, private store: Store<ExperimentOutputState>, private apiTasks: ApiTasksService,
    private authApi: ApiAuthService, private taskBl: BlTasksService, private eventsApi: ApiEventsService
  ) {
  }

  activeLoader = createEffect(() => this.actions$.pipe(
    ofType(outputActions.CHANGE_PROJECT_REQUESTED, outputActions.getExperimentLog, outputActions.EXPERIMENT_SCALAR_REQUESTED, outputActions.experimentPlotsRequested),
    filter(action => !action?.['from']),
    map(action => activeLoader(action.type))
  ));

  getLog$ = createEffect(() => this.actions$.pipe(
    ofType(outputActions.getExperimentLog),
    switchMap((action) =>
      this.eventsApi.eventsGetTaskLog({
        /* eslint-disable @typescript-eslint/naming-convention */
        task: action.id,
        batch_size: LOG_BATCH_SIZE,
        navigate_earlier: action.direction !== 'next',
        from_timestamp: action.refresh ? null : action.from,
        /* eslint-enable @typescript-eslint/naming-convention */
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

  fetchExperimentScalarFullDetails$ = createEffect(() => this.actions$.pipe(
    ofType(outputActions.getGraphDisplayFullDetailsScalars),
    withLatestFrom(this.store.select(selectFullScreenChart), this.store.select(selectFullScreenChartXtype)),
    switchMap(([action, fullScreenData, chartType]) => this.eventsApi.eventsScalarMetricsIterRaw({
      task: action.task,
      metric: action.metric,
      key: action.key? action.key : chartType,
      count_total: true,
      batch_size: 200000,
    })
      .pipe(
        withLatestFrom(this.store.select(selectFullScreenChartIsOpen)),
        map(([res, isOpen]) => [res.returned, res, isOpen]),
        expand(([returnedTillNow, data, isOpen]) => (returnedTillNow < data.total) && isOpen ? this.eventsApi.eventsScalarMetricsIterRaw({
            task: action.task,
            metric: action.metric,
            scroll_id: data.scroll_id,
            key: action.key? action.key : chartType,
            count_total: true,
            batch_size: 200000,
          }).pipe(
          withLatestFrom(this.store.select(selectFullScreenChartIsOpen)),
          map(([res, isOpen]) => [returnedTillNow + res.returned, res, isOpen])
          )
          : EMPTY
        ),
        reduce((acc, [, data]) => {
            const graphData = acc ? acc : fullScreenData.data;
            return graphData.map((item) => ({
                ...item,
                y: !acc ? getOr([], `variants[${item.name}].y`, data) : (item.y).concat(getOr([], `variants[${item.name}].y`, data)),
                x: !acc ? getOr([], `variants[${item.name}][${action.key? action.key : chartType}]`, data) : (item.x).concat(getOr([], `variants[${item.name}][${action.key? action.key : chartType}]`, data))
              }));
          }
          , null)
      ,
    mergeMap( (data: any) => [
        ... action.key ? [setXtypeGraphDisplayFullDetailsScalars({xAxisType: action.key})]:[],
      mergeGraphDisplayFullDetailsScalars({data}),
      deactivateLoader(outputActions.getGraphDisplayFullDetailsScalars.type),
    ]),
    catchError(error => [
      requestFailed(error),
      deactivateLoader(outputActions.getGraphDisplayFullDetailsScalars.type),
      setServerError(error, null, 'Failed to get full detailed Chart')
    ])))
  ));

  fetchExperimentPlots$ = createEffect(() => this.actions$.pipe(
    ofType(outputActions.experimentPlotsRequested),
    switchMap(action => this.eventsApi.eventsGetTaskPlots({task: action.task, iters: 5}).pipe(
      map(res => [res.plots.length, res]),
      expand(([plotsLength, data]) => plotsLength < data.total
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ? this.eventsApi.eventsGetTaskPlots({task: action.task, iters: 5, scroll_id: data.scroll_id}).pipe(
          map(res => [plotsLength + res.plots.length, res])
        )
        : EMPTY
      ),
      reduce((acc, [, data]) => acc.concat(data.plots), [])
    )),
    mergeMap((allPlots: any) => [
      new outputActions.SetExperimentPlots(allPlots),
      deactivateLoader(refreshExperiments.type),
      deactivateLoader(outputActions.experimentPlotsRequested.type),
    ]),
    catchError(error => [
      requestFailed(error),
      deactivateLoader(outputActions.experimentPlotsRequested.type),
      deactivateLoader(refreshExperiments.type),
      setServerError(error, null, 'Failed to get Plot Charts')
    ])
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

        return this.eventsApi.eventsScalarMetricsIterHistogram({
          task: action.payload,
          key: axisType === ScalarKeyEnum.IsoTime ? ScalarKeyEnum.Timestamp : axisType
        })
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
          );
      }
    )
  ));

  downloadFullLog$ = createEffect(() => this.actions$.pipe(
    ofType(outputActions.downloadFullLog),
    filter(action => !!action.experimentId),
    map(action => {
      const a = document.createElement('a');
      a.href = `${HTTP.API_BASE_URL}/events.download_task_log?line_type=text&task=${action.experimentId}`;
      a.target = '_blank';
      a.download = 'Log';
      a.click();
    })
  ), {dispatch: false});
}
