import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {ApiTasksService} from '~/business-logic/api-services/tasks.service';
import {ApiAuthService} from '~/business-logic/api-services/auth.service';
import {BlTasksService} from '~/business-logic/services/tasks.service';
import {ApiEventsService} from '~/business-logic/api-services/events.service';
import {catchError, expand, filter, map, mergeMap, reduce, switchMap, withLatestFrom} from 'rxjs/operators';
import {activeLoader, deactivateLoader, setServerError} from '../../core/actions/layout.actions';
import {requestFailed} from '../../core/actions/http.actions';
import * as outputActions from '../actions/common-experiment-output.actions';
import {
  mergeGraphDisplayFullDetailsScalars, setExperimentScalarSingleValue, setXtypeGraphDisplayFullDetailsScalars
} from '../actions/common-experiment-output.actions';
import {ExperimentOutputState} from '~/features/experiments/reducers/experiment-output.reducer';
import {LOG_BATCH_SIZE} from '../shared/common-experiments.const';
import {
  selectExperimentHistogramCacheAxisType,
  selectFullScreenChart,
  selectFullScreenChartIsOpen,
  selectFullScreenChartXtype, selectPipelineSelectedStep, selectPlotViewerScrollId,
  selectSelectedSettingsxAxisType
} from '../reducers';
import {refreshExperiments} from '../actions/common-experiments-view.actions';
import {EventsGetTaskLogResponse} from '~/business-logic/model/events/eventsGetTaskLogResponse';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {EMPTY} from 'rxjs';
import {selectSelectedExperiment} from '~/features/experiments/reducers';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {PlotSampleResponse} from '~/business-logic/model/events/plotSampleResponse';


@Injectable()
export class CommonExperimentOutputEffects {

  constructor(
    private actions$: Actions, private store: Store<ExperimentOutputState>, private apiTasks: ApiTasksService,
    private authApi: ApiAuthService, private taskBl: BlTasksService, private eventsApi: ApiEventsService
  ) {
  }

  activeLoader = createEffect(() => this.actions$.pipe(
    ofType(outputActions.getExperimentLog, outputActions.experimentScalarRequested, outputActions.experimentPlotsRequested),
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
        withLatestFrom(
          this.store.select(selectSelectedExperiment),
          this.store.select(selectPipelineSelectedStep)),
        mergeMap(([res, selectedTask, pipeStep]: [EventsGetTaskLogResponse, IExperimentInfo, IExperimentInfo]) => [
          ...((action.id === (pipeStep?.id || selectedTask.id)) ?
              [outputActions.setExperimentLog({
                events: res.events,
                total: res.total,
                direction: action.direction,
                refresh: action.refresh
              })] :
              action.direction === 'prev' && res.total > 0 && res.events?.length === 0 ?
                [outputActions.setExperimentLogAtStart({atStart: true})] :
                [outputActions.setExperimentLogLoading({loading: false})]
          ),
          deactivateLoader(action.type),
          deactivateLoader(refreshExperiments.type)
        ]),
        catchError(error => [
          requestFailed(error),
          deactivateLoader(action.type),
          deactivateLoader(refreshExperiments.type),
          setServerError(error, null, 'Failed to fetch log'),
          outputActions.setExperimentLogLoading({loading: false})
        ])
      )
    )
  ));

  fetchExperimentScalarFullDetails$ = createEffect(() => this.actions$.pipe(
    ofType(outputActions.getGraphDisplayFullDetailsScalars),
    withLatestFrom(
      this.store.select(selectFullScreenChart),
      this.store.select(selectFullScreenChartXtype)
    ),
    switchMap(([action, fullScreenData, chartType]) => this.eventsApi.eventsScalarMetricsIterRaw({
      task: action.task,
      metric: action.metric,
      key: action.key ? action.key : chartType,
      /* eslint-disable @typescript-eslint/naming-convention */
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
              key: action.key ? action.key : chartType,
              count_total: true,
              batch_size: 200000,
              /* eslint-enable @typescript-eslint/naming-convention */
            }).pipe(
              withLatestFrom(this.store.select(selectFullScreenChartIsOpen)),
              map(([res, isOpen2]) => [returnedTillNow + res.returned, res, isOpen2])
            )
            : EMPTY
        ),
        reduce((acc, [, data]) => {
          const graphData = acc ? acc : fullScreenData.data;
          return graphData.map((item) => ({
            ...item,
            y: (acc ? item.y : []).concat(data?.variants?.[item.name]?.y || []),
            x: (acc ? item.x : []).concat(data?.variants?.[item.name]?.[action.key || chartType] || [])
          }));
        }, null),
        mergeMap(data => [
          ...action.key ? [setXtypeGraphDisplayFullDetailsScalars({xAxisType: action.key})] : [],
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
    switchMap(action => this.eventsApi.eventsGetTaskPlots({task: action.task, iters: 1}).pipe(
      map(res => [res.plots.length, res]),
      expand(([plotsLength, data]) => plotsLength < data.total
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ? this.eventsApi.eventsGetTaskPlots({task: action.task, iters: 1, scroll_id: data.scroll_id}).pipe(
          map(res => [plotsLength + res.plots.length, res])
        )
        : EMPTY
      ),
      reduce((acc, [, data]) => acc.concat(data.plots), [])
    )),
    mergeMap((allPlots: any) => [
      outputActions.setExperimentPlots({plots: allPlots}),
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

  fetchExperimentScalarSingleValue$ = createEffect(() => this.actions$.pipe(
    ofType(outputActions.experimentScalarRequested),
    switchMap((action) => this.eventsApi.eventsGetTaskSingleValueMetrics({
      tasks: [action.experimentId]
    })),
    mergeMap((res) => [setExperimentScalarSingleValue(res?.tasks[0])]
    )
  ));

  fetchExperimentScalar$ = createEffect(() => this.actions$.pipe(
    ofType(outputActions.experimentScalarRequested),
    withLatestFrom(this.store.select(selectSelectedSettingsxAxisType), this.store.select(selectExperimentHistogramCacheAxisType)),
    switchMap(([action, axisType, prevAxisType]) => {
        if ([ScalarKeyEnum.IsoTime, ScalarKeyEnum.Timestamp].includes(prevAxisType) &&
          [ScalarKeyEnum.IsoTime, ScalarKeyEnum.Timestamp].includes(axisType)) {
          return [
            deactivateLoader(refreshExperiments.type),
            deactivateLoader(action.type)
          ];
        }

        return this.eventsApi.eventsScalarMetricsIterHistogram({
          task: action.experimentId,
          key: axisType === ScalarKeyEnum.IsoTime ? ScalarKeyEnum.Timestamp : axisType
        })
          .pipe(
            mergeMap(res => [
              outputActions.setHistogram({histogram: res, axisType}),
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

  fetchPlotsForIter$ = createEffect(() => this.actions$.pipe(
    ofType(outputActions.getPlotSample),
    withLatestFrom(this.store.select(selectPlotViewerScrollId)),
    switchMap(([action, scrollId]) =>
      this.eventsApi.eventsGetPlotSample({
        /* eslint-disable @typescript-eslint/naming-convention */
        task: action.task,
        iteration: action.iteration,
        metric: action.metric,
        scroll_id: scrollId,
        navigate_current_metric: false
        /* eslint-enable @typescript-eslint/naming-convention */
      })
        .pipe(
          mergeMap((res: PlotSampleResponse) => [
            // eslint-disable-next-line @typescript-eslint/naming-convention
            outputActions.setPlotIterations({min_iteration: res.min_iteration, max_iteration: res.max_iteration}),
            outputActions.setCurrentPlot({event: res.events}), deactivateLoader(action.type),
            outputActions.setPlotViewerScrollId({scrollId: res.scroll_id}),
          ]),
          catchError(error => [requestFailed(error), deactivateLoader(action.type)])
        )
    )
  ));

  getNextPlotsForIter$ = createEffect(() => this.actions$.pipe(
    ofType(outputActions.getNextPlotSample),
    withLatestFrom(this.store.select(selectPlotViewerScrollId)),
    switchMap(([action, scrollId]) =>
      this.eventsApi.eventsNextPlotSample({
        /* eslint-disable @typescript-eslint/naming-convention */
        task: action.task,
        scroll_id: scrollId,
        navigate_earlier: action.navigateEarlier,
        ...(action.iteration && {next_iteration: true})
        /* eslint-enable @typescript-eslint/naming-convention */
      })
        .pipe(
          mergeMap(res => {
            if (res.events.length === 0) {
              return [action.navigateEarlier ? outputActions.setViewerBeginningOfTime({beginningOfTime: true}) : outputActions.setViewerEndOfTime({endOfTime: true})];
            } else {
              return [
                // eslint-disable-next-line @typescript-eslint/naming-convention
                outputActions.setPlotIterations({min_iteration: res.min_iteration, max_iteration: res.max_iteration}),
                outputActions.setCurrentPlot({event: res.events}), deactivateLoader(action.type),
                outputActions.setPlotViewerScrollId({scrollId: res.scroll_id}),
                !action.navigateEarlier ? outputActions.setViewerBeginningOfTime({beginningOfTime: false}) : outputActions.setViewerEndOfTime({endOfTime: false})
              ];
            }
          }),
          catchError(error => [requestFailed(error), deactivateLoader(action.type)])
        )
    )
  ));
}
