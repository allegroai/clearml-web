import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {IExperimentCompareChartsState} from '../reducers/experiments-compare-charts.reducer';
import * as chartActions from '../actions/experiments-compare-charts.actions';
import {GetMultiPlotCharts, GetMultiScalarCharts} from '../actions/experiments-compare-charts.actions';
import {ActiveLoader, DeactiveLoader, SetServerError} from '../../core/actions/layout.actions';
import {catchError, debounceTime, flatMap, map, withLatestFrom} from 'rxjs/operators';
import {ApiTasksService} from '../../../business-logic/api-services/tasks.service';
import {ApiAuthService} from '../../../business-logic/api-services/auth.service';
import {BlTasksService} from '../../../business-logic/services/tasks.service';
import {ApiEventsService} from '../../../business-logic/api-services/events.service';
import {RequestFailed} from '../../core/actions/http.actions';
import {selectCompareHistogramCacheAxisType, selectCompareSelectedSettingsxAxisType} from '../reducers';
import {setRefreshing} from '../actions/compare-header.actions';
import {ScalarKeyEnum} from '../../../business-logic/model/events/scalarKeyEnum';


@Injectable()
export class ExperimentsCompareChartsEffects {

  constructor(private actions$: Actions, private store: Store<IExperimentCompareChartsState>, private apiTasks: ApiTasksService,
              private authApi: ApiAuthService, private taskBl: BlTasksService, private eventsApi: ApiEventsService) {
  }

  @Effect()
  activeLoader = this.actions$.pipe(
    ofType(chartActions.GET_MULTI_SCALAR_CHARTS, chartActions.GET_MULTI_PLOT_CHARTS),
    map(action => new ActiveLoader(action.type))
  );

  @Effect()
  getMultiScalarCharts = this.actions$.pipe(
    ofType<GetMultiScalarCharts>(chartActions.GET_MULTI_SCALAR_CHARTS),
    debounceTime(200),
    withLatestFrom(this.store.select(selectCompareSelectedSettingsxAxisType), this.store.select(selectCompareHistogramCacheAxisType)),
    flatMap(([action, axisType, prevAxisType]) => {
      if ([ScalarKeyEnum.IsoTime, ScalarKeyEnum.Timestamp].includes(prevAxisType) &&
        [ScalarKeyEnum.IsoTime, ScalarKeyEnum.Timestamp].includes(axisType)) {
        return [setRefreshing({payload: false}), new DeactiveLoader(action.type)];
      }
      return this.eventsApi.eventsMultiTaskScalarMetricsIterHistogram({
        tasks: action.payload.taskIds,
        key: !axisType || axisType === ScalarKeyEnum.IsoTime ? ScalarKeyEnum.Timestamp : axisType
      }).pipe(
        flatMap(res => [
          // also here
          new chartActions.SetExperimentHistogram(res, axisType),
          setRefreshing({payload: false}),
          new DeactiveLoader(action.type)]
        ),
        catchError(error => [
          new RequestFailed(error), new DeactiveLoader(action.type), setRefreshing({payload: false}),
          new SetServerError(error, null, 'Failed to get Scalar Charts', action.payload.autoRefresh)
        ])
      );
    })
  );

  @Effect()
  getMultiPlotCharts = this.actions$.pipe(
    ofType<GetMultiPlotCharts>(chartActions.GET_MULTI_PLOT_CHARTS),
    debounceTime(200),
    flatMap((action) =>
      this.eventsApi.eventsGetMultiTaskPlots({tasks: action.payload.taskIds, iters: 1})
        .pipe(
          map(res => res.plots),
          flatMap(res => [
            new chartActions.SetExperimentPlots(res),
            setRefreshing({payload: false}),
            new DeactiveLoader(action.type)]),
          catchError(error => [
            new RequestFailed(error), new DeactiveLoader(action.type), setRefreshing({payload: false}),
            new SetServerError(error, null, 'Failed to get Plot Charts', action.payload.autoRefresh)
          ])
        )
    )
  );

}
