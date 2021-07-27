import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {IExperimentCompareMetricsValuesState} from '../reducers/experiments-compare-metrics-values.reducer';
import * as metricsValuesActions from '../actions/experiments-compare-metrics-values.actions';
import {activeLoader, deactivateLoader, setServerError} from '../../../webapp-common/core/actions/layout.actions';
import {catchError, mergeMap, map} from 'rxjs/operators';
import {requestFailed} from '../../core/actions/http.actions';
import {ApiTasksService} from '../../../business-logic/api-services/tasks.service';
import {setRefreshing} from '../actions/compare-header.actions';


@Injectable()
export class ExperimentsCompareMetricsValuesEffects {

  constructor(private actions$: Actions, private store: Store<IExperimentCompareMetricsValuesState>, public tasksApiService: ApiTasksService) {
  }

  @Effect()
  activeLoader = this.actions$.pipe(
    ofType(metricsValuesActions.GET_COMPARED_EXPERIMENTS_METRICS_VALUES),
    map(action => activeLoader(action.type))
  );

  @Effect()
  getComparedExperimentsMetricsValues = this.actions$.pipe(
    ofType<metricsValuesActions.GetComparedExperimentsMetricsValues>(metricsValuesActions.GET_COMPARED_EXPERIMENTS_METRICS_VALUES),
    mergeMap((action) => this.tasksApiService.tasksGetAllEx({id: action.payload.taskIds, only_fields: ['last_metrics', 'name', 'status', 'completed', 'last_update', 'last_iteration', 'project.name']})
      .pipe(
        map(res => action.payload.taskIds.map(id => res.tasks.find(ex => ex.id === id))),
        mergeMap(experiments => [
          new metricsValuesActions.SetComparedExperiments(experiments),
          setRefreshing({payload: false}),
          deactivateLoader(action.type)]),
        catchError(error => [
          requestFailed(error), deactivateLoader(action.type), setRefreshing({payload: false}),
          setServerError(error, null, 'Failed to get Compared Experiments', action.payload.autoRefresh)
        ])
      )
    )
  );
}
