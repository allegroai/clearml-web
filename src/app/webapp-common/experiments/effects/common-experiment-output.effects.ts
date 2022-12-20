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
import {setExperimentScalarSingleValue} from '../actions/common-experiment-output.actions';
import {ExperimentOutputState} from '~/features/experiments/reducers/experiment-output.reducer';
import {LOG_BATCH_SIZE} from '../shared/common-experiments.const';
import {selectExperimentHistogramCacheAxisType, selectPipelineSelectedStep, selectSelectedSettingsxAxisType} from '../reducers';
import {refreshExperiments} from '../actions/common-experiments-view.actions';
import {EventsGetTaskLogResponse} from '~/business-logic/model/events/eventsGetTaskLogResponse';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {EMPTY} from 'rxjs';
import {selectSelectedExperiment} from '~/features/experiments/reducers';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {EventsGetTaskPlotsResponse} from '~/business-logic/model/events/eventsGetTaskPlotsResponse';


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

  fetchExperimentPlots$ = createEffect(() => this.actions$.pipe(
    ofType(outputActions.experimentPlotsRequested),
    switchMap(action => this.eventsApi.eventsGetTaskPlots({task: action.task, iters: 1}).pipe(
      map((res: EventsGetTaskPlotsResponse) => [res.plots.length, res] as [number, EventsGetTaskPlotsResponse]),
      expand(([plotsLength, data]) => (data.total < 10000 ? (plotsLength < data.total) : (data.plots.length > 0))
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ? this.eventsApi.eventsGetTaskPlots({task: action.task, iters: 1, scroll_id: data.scroll_id}).pipe(
          map((res: EventsGetTaskPlotsResponse) => [plotsLength + res.plots.length, res] as [number, EventsGetTaskPlotsResponse])
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
}
