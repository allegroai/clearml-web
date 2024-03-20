import {Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {activeLoader, deactivateLoader, setServerError} from '../../core/actions/layout.actions';
import {catchError, mergeMap, map} from 'rxjs/operators';
import {requestFailed} from '../../core/actions/http.actions';
import {ApiTasksService} from '~/business-logic/api-services/tasks.service';
import {
  getExperimentsHyperParams,
  setHyperParamsList,
  setMetricsList,
  setMetricsResults,
  setTasks
} from '../actions/experiments-compare-scalars-graph.actions';
import {GroupedHyperParams, HyperParams} from '../reducers/experiments-compare-charts.reducer';
import {Store} from '@ngrx/store';
import {selectSelectedSettingsMetric} from '@common/experiments-compare/reducers';
import {MetricVariantResult} from '~/business-logic/model/projects/metricVariantResult';

@Injectable()
export class ExperimentsCompareScalarsGraphEffects {

  constructor(private readonly store: Store, private actions$: Actions, public tasksApiService: ApiTasksService) {
  }

  activeLoader = createEffect(() => this.actions$.pipe(
    ofType(getExperimentsHyperParams),
    map(action => activeLoader(action.type))
  ));

  getExperimentsHyperParams$ = createEffect(() => this.actions$.pipe(
    ofType(getExperimentsHyperParams),
    concatLatestFrom(() => this.store.select(selectSelectedSettingsMetric)),
    mergeMap(([action, /*metric*/]) => this.tasksApiService.tasksGetAllEx({
        id: action.experimentsIds,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        only_fields: ['last_metrics', 'name', 'last_iteration', 'hyperparams'],
        // ...(action.scatter && metric && {[`last_metrics.${metric.path}.value`]: [Number.MIN_VALUE, null]})
      })
        .pipe(
          // map(res => res.tasks)),
          mergeMap(res => {
            const metricsList = this.getMetricOptions(res.tasks);
            const metricVariantsResults = this.getMetricResults(res.tasks);
            const paramsHasDiffs = this.getParametersHasDiffs(res.tasks);
            return [
              setTasks({tasks: res.tasks}),
              setMetricsList({metricsList}),
              setMetricsResults({metricVariantsResults: metricVariantsResults}),
              setHyperParamsList({hyperParams: paramsHasDiffs}),
              deactivateLoader(action.type)];
          }),
          catchError(error => [
            requestFailed(error), deactivateLoader(action.type),
            setServerError(error, null, 'Failed to get Compared Experiments')
          ])
        )
    ))
  );

  getMetricResults(tasks): Array<MetricVariantResult> {
    const metrics = [];
    for (const task of tasks) {
      for (const metric in task.last_metrics) {
        for (const variant in task.last_metrics[metric]) {
          const metricName = task.last_metrics[metric][variant].metric;
          const variantName = task.last_metrics[metric][variant].variant;
          metrics.push({
            metric: metricName,
            metric_hash: metric,
            variant: variantName,
            variant_hash: variant
          });

          //     !metrics[metricName] && (metrics[metricName] = {});
          //     if (!metrics[metricName][variantName]) {
          //       metrics[metricName][variantName] = {};
          //       metrics[metricName][variantName]['name'] = `${metricName}/${variantName}`;
          //       metrics[metricName][variantName]['path'] = `${metric}.${variant}`;
        }
      }
    }

    // return Object.keys(metrics).sort((a, b) => a.toLowerCase() > b.toLowerCase() ? 1 : -1).map(metricName => ({
    //   metricName,
    //   variants: Object.keys(metrics[metricName]).sort().map(variant => ({
    //     name: variant,
    //     value: metrics[metricName][variant]
    //   }))
    // }));
    return metrics;
  }

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
    return Object.keys(metrics).sort((a, b) => a.toLowerCase() > b.toLowerCase() ? 1 : -1).map(metricName => ({
      metricName,
      variants: Object.keys(metrics[metricName]).sort().map(variant => ({
        name: variant,
        value: metrics[metricName][variant]
      }))
    }));
  }

  private getParametersHasDiffs(tasks): GroupedHyperParams {
    const numberOfTasks = tasks.length;
    let paramsValues: { [section: string]: { [param: string]: any[] } } = {};
    tasks.forEach(task => {
      paramsValues = task.hyperparams ? Object.values(task.hyperparams).reduce((acc, paramsObj) => {
        Object.values(paramsObj).forEach((paramObj) => {
          acc[paramObj.section] = acc[paramObj.section] || {};
          acc[paramObj.section][paramObj.name] = acc[paramObj.section][paramObj.name] || [];
          acc[paramObj.section][paramObj.name].push(paramObj.value);
        });
        return acc;
      }, paramsValues) as { [section: string]: { [param: string]: any[] } } : paramsValues;
    });

    const paramsValuesHasDiff: { [section: string]: HyperParams } = {};
    Object.entries(paramsValues).forEach(([section, params]) => {
      paramsValuesHasDiff[section] = Object.entries(params).reduce((acc, [paramKey, values]) => {
        acc[paramKey] = values.every(value => value !== '') && (numberOfTasks != values.length || values.some(val => val !== values[0]));
        return acc;
      }, {});
    });
    return paramsValuesHasDiff;
  }
}
