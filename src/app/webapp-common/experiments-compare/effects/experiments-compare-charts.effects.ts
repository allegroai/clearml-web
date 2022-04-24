import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {IExperimentCompareChartsState} from '../reducers/experiments-compare-charts.reducer';
import * as chartActions from '../actions/experiments-compare-charts.actions';
import {GetMultiPlotCharts, GetMultiScalarCharts} from '../actions/experiments-compare-charts.actions';
import {activeLoader, deactivateLoader, setServerError} from '../../core/actions/layout.actions';
import {catchError, debounceTime, mergeMap, map, withLatestFrom, filter} from 'rxjs/operators';
import {ApiTasksService} from '~/business-logic/api-services/tasks.service';
import {ApiAuthService} from '~/business-logic/api-services/auth.service';
import {BlTasksService} from '~/business-logic/services/tasks.service';
import {ApiEventsService} from '~/business-logic/api-services/events.service';
import {requestFailed} from '../../core/actions/http.actions';
import {selectCompareHistogramCacheAxisType, selectCompareSelectedSettingsxAxisType} from '../reducers';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';


@Injectable()
export class ExperimentsCompareChartsEffects {

  constructor(private actions$: Actions, private store: Store<IExperimentCompareChartsState>, private apiTasks: ApiTasksService,
              private authApi: ApiAuthService, private taskBl: BlTasksService, private eventsApi: ApiEventsService) {
  }

  activeLoader = createEffect(() => this.actions$.pipe(
    ofType(chartActions.GET_MULTI_SCALAR_CHARTS, chartActions.GET_MULTI_PLOT_CHARTS),
    filter(action => !(action as any).payload?.autoRefresh),
    map(action => activeLoader(action.type))
  ));

  getMultiScalarCharts = createEffect(() => this.actions$.pipe(
    ofType<GetMultiScalarCharts>(chartActions.GET_MULTI_SCALAR_CHARTS),
    debounceTime(200),
    withLatestFrom(this.store.select(selectCompareSelectedSettingsxAxisType), this.store.select(selectCompareHistogramCacheAxisType)),
    mergeMap(([action, axisType, prevAxisType]) => {
      if ([ScalarKeyEnum.IsoTime, ScalarKeyEnum.Timestamp].includes(prevAxisType) &&
        [ScalarKeyEnum.IsoTime, ScalarKeyEnum.Timestamp].includes(axisType) &&
        prevAxisType !== axisType
      ) {
        return [deactivateLoader(action.type)];
      }
      return this.eventsApi.eventsMultiTaskScalarMetricsIterHistogram({
        tasks: action.payload.taskIds,
        key: !axisType || axisType === ScalarKeyEnum.IsoTime ? ScalarKeyEnum.Timestamp : axisType
      }).pipe(
        mergeMap(res => [
          // also here
          new chartActions.SetExperimentHistogram(res, axisType),
          deactivateLoader(action.type)]
        ),
        catchError(error => [
          requestFailed(error), deactivateLoader(action.type),
          setServerError(error, null, 'Failed to get Scalar Charts', action.payload.autoRefresh)
        ])
      );
    })
  ));

  getMultiPlotCharts = createEffect(() => this.actions$.pipe(
    ofType<GetMultiPlotCharts>(chartActions.GET_MULTI_PLOT_CHARTS),
    debounceTime(200),
    mergeMap((action) =>
      this.eventsApi.eventsGetMultiTaskPlots({tasks: action.payload.taskIds, iters: 1, no_scroll: true})
        .pipe(
          map(res => res.plots),
          mergeMap(res => [
            new chartActions.SetExperimentPlots(res),
            deactivateLoader(action.type)]),
          catchError(error => [
            requestFailed(error), deactivateLoader(action.type),
            setServerError(error, null, 'Failed to get Plot Charts', action.payload.autoRefresh)
          ])
        )
    )
  ));

}
