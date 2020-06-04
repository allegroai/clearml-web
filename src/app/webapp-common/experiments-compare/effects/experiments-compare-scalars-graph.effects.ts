import {Injectable} from '@angular/core';
import {Actions, createEffect, Effect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {IExperimentCompareMetricsValuesState} from '../reducers/experiments-compare-metrics-values.reducer';
import {ActiveLoader, DeactiveLoader, SetServerError} from '../../../webapp-common/core/actions/layout.actions';
import {catchError, flatMap, map} from 'rxjs/operators';
import {RequestFailed} from '../../core/actions/http.actions';
import {ApiTasksService} from '../../../business-logic/api-services/tasks.service';
import {getExperimentsHyperParams, setHyperParamsList, setMetricsList, setTasks} from '../actions/experiments-compare-scalars-graph.actions';
import {setRefreshing} from '../actions/compare-header.actions';
import {HyperParams} from '../reducers/experiments-compare-charts.reducer';

@Injectable()
export class ExperimentsCompareScalarsGraphEffects {

  constructor(private actions$: Actions, private store: Store<IExperimentCompareMetricsValuesState>, public tasksApiService: ApiTasksService) {
  }

  @Effect()
  activeLoader = createEffect(() => this.actions$.pipe(
    ofType(getExperimentsHyperParams),
    map(action => new ActiveLoader(action.type))
  )
  );

  loadMovies$ = createEffect(() => this.actions$.pipe(
    ofType(getExperimentsHyperParams),
    flatMap((action) => this.tasksApiService.tasksGetAllEx({
      id: action.experimentsIds,
      only_fields: ['last_metrics', 'name', 'last_iteration', 'execution.parameters']
    })
      .pipe(
        // map(res => res.tasks)),
        flatMap(res => {
          const metricsList = this.getMetricOptions(res.tasks);
          const paramsHasDiffs = this.getParametersHasDiffs(res.tasks);
          return [
            setTasks({tasks: res.tasks}),
            setMetricsList({metricsList: metricsList}),
            setHyperParamsList({hyperParams: paramsHasDiffs}),
            setRefreshing({payload: false}),
            new DeactiveLoader(action.type)];
        }),
        catchError(error => [
          new RequestFailed(error), new DeactiveLoader(action.type), setRefreshing({payload: false}),
          new SetServerError(error, null, 'Failed to get Compared Experiments')
        ])
      )
    ))
  );

  getMetricOptions(tasks) {
    const metrics = {};
    for (const task of tasks) {
      for (const metric in task.last_metrics) {
        for (const variant in task.last_metrics[metric]) {
          const metricName = task.last_metrics[metric][variant].metric;
          const variantName = task.last_metrics[metric][variant].variant;
          !metrics[metricName] && (metrics[metricName] = {});
          if (!metrics[metricName][variantName]) {
            metrics[metricName][variantName] = {};
            metrics[metricName][variantName]['name'] = `${metricName}/${variantName}`;
            metrics[metricName][variantName]['path'] = `${metric}.${variant}`;
          }
        }
      }
    }
    const metricsList = Object.keys(metrics).sort((a, b) => a.toLowerCase() > b.toLowerCase() ? 1 :  -1).map(metricName => ({
      metricName,
      variants: Object.keys(metrics[metricName]).sort().map(variant => ({
        name: variant,
        value: metrics[metricName][variant]
      }))
    }));
    return metricsList;
  }

  private getParametersHasDiffs(tasks): HyperParams  {
    const numberOfTasks = tasks.length;
    const paramsValues: {string?: any[]} = {};
    tasks.forEach(task => {
      Object.entries(task.execution.parameters).forEach( ([param, value]) =>
        paramsValues.hasOwnProperty(param) ? paramsValues[param].push(value) : (paramsValues[param] = [value])
      );
    });

    return Object.entries(paramsValues).reduce((acc, [paramKey, values]) => {
      acc[paramKey] = values.every(value => value !== '') && (numberOfTasks != values.length || values.some(val => val !== values[0]));
      return acc;
    }, {});
  }
}
