import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {IExperimentCompareChartsState} from '../reducers/experiments-compare-charts.reducer';
import * as chartActions from '../actions/experiments-compare-charts.actions';
import {activeLoader, deactivateLoader, setServerError} from '../../core/actions/layout.actions';
import {catchError, debounceTime, mergeMap, map, withLatestFrom, filter, switchMap} from 'rxjs/operators';
import {ApiTasksService} from '~/business-logic/api-services/tasks.service';
import {ApiAuthService} from '~/business-logic/api-services/auth.service';
import {BlTasksService} from '~/business-logic/services/tasks.service';
import {ApiEventsService} from '~/business-logic/api-services/events.service';
import {requestFailed} from '../../core/actions/http.actions';
import {selectCompareHistogramCacheAxisType, selectCompareSelectedSettingsxAxisType} from '../reducers';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {selectActiveWorkspaceReady} from '~/core/reducers/view.reducer';


@Injectable()
export class ExperimentsCompareChartsEffects {

  constructor(private actions$: Actions, private store: Store<IExperimentCompareChartsState>, private apiTasks: ApiTasksService,
              private authApi: ApiAuthService, private taskBl: BlTasksService, private eventsApi: ApiEventsService) {
  }

  activeLoader = createEffect(() => this.actions$.pipe(
    ofType(chartActions.getMultiScalarCharts, chartActions.getMultiPlotCharts),
    filter(action => !(action as any).payload?.autoRefresh),
    map(action => activeLoader(action.type))
  ));

  getMultiScalarCharts = createEffect(() => this.actions$.pipe(
    ofType(chartActions.getMultiScalarCharts),
    switchMap((action) => this.store.select(selectActiveWorkspaceReady).pipe(
      filter(ready => ready),
      map(() => action))),
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
        tasks: action.taskIds,
        key: !axisType || axisType === ScalarKeyEnum.IsoTime ? ScalarKeyEnum.Timestamp : axisType
      }).pipe(
        mergeMap(res => [
          // also here
          chartActions.setExperimentHistogram({payload: res, axisType}),
          deactivateLoader(action.type)]
        ),
        catchError(error => [
          requestFailed(error), deactivateLoader(action.type),
          setServerError(error, null, 'Failed to get Scalar Charts', action.autoRefresh)
        ])
      );
    })
  ));

  getMultiPlotCharts = createEffect(() => this.actions$.pipe(
    ofType(chartActions.getMultiPlotCharts),
    debounceTime(200),
    mergeMap((action) =>
      // eslint-disable-next-line @typescript-eslint/naming-convention
      this.eventsApi.eventsGetMultiTaskPlots({tasks: action.taskIds, iters: 1, no_scroll: true})
        .pipe(
          map(res => res.plots),
          mergeMap(plots => [
            chartActions.setExperimentPlots({plots}),
            deactivateLoader(action.type)]),
          catchError(error => [
            requestFailed(error), deactivateLoader(action.type),
            setServerError(error, null, 'Failed to get Plot Charts', action.autoRefresh)
          ])
        )
    )
  ));

}
