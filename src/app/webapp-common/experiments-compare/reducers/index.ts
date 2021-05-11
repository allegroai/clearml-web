import {ActionReducerMap, createSelector} from '@ngrx/store';
import {ExperimentCompareDetailsState, experimentsCompareDetailsReducer} from './experiments-compare-details.reducer';
import {experimentsCompareChartsReducer, GroupedHyperParams, IExperimentCompareChartsState, IExperimentCompareSettings, MetricOption, MetricValueType} from './experiments-compare-charts.reducer';
import {experimentsCompareMetricsValuesReducer, IExperimentCompareMetricsValuesState, MetricSortBy} from './experiments-compare-metrics-values.reducer';
import {experimentsCompareDebugImagesReducer} from './experiments-compare-debug-images.reducer';
import {get} from 'lodash/fp';
import {Task} from '../../../business-logic/model/tasks/task';
import {compareHeader, CompareHeaderState} from './compare-header.reducer';
import {IExperimentDetail} from '../../../features/experiments-compare/experiments-compare-models';
import {ScalarKeyEnum} from '../../../business-logic/model/events/scalarKeyEnum';
import {scalarsGraphReducer, ScalarsGraphState} from './experiments-compare-scalars-graph.reducer';
import {ExperimentParams} from '../shared/experiments-compare-details.model';
import {ExperimentCompareParamsState, experimentsCompareParamsReducer} from './experiments-compare-params.reducer';
import {GroupByCharts} from '../../experiments/reducers/common-experiment-output.reducer';

export const experimentsCompareReducers: ActionReducerMap<any, any> = {
  details      : experimentsCompareDetailsReducer,
  params       : experimentsCompareParamsReducer,
  metricsValues: experimentsCompareMetricsValuesReducer,
  charts       : experimentsCompareChartsReducer,
  debugImages  : experimentsCompareDebugImagesReducer,
  compareHeader,
  scalarsGraph : scalarsGraphReducer
};

export function experimentsCompare(state) {
  return state.experimentsCompare;
}

// Details
export const experimentsDetails = createSelector(experimentsCompare, (state): ExperimentCompareDetailsState => state ? state.details : {});
export const selectExperimentsDetails = createSelector(experimentsDetails, (state): Array<IExperimentDetail> => state.experiments);
export const selectExperimentIdsDetails = createSelector(selectExperimentsDetails,
  (experiments): Array<IExperimentDetail['id']> => experiments.map(exp => exp.id));

// Params
export const experimentsParams = createSelector(experimentsCompare, (state): ExperimentCompareParamsState => state ? state.params : {});
export const selectExperimentsParams = createSelector(experimentsParams, (state): Array<ExperimentParams> => state.experiments);
export const selectExperimentIdsParams = createSelector(selectExperimentsParams,
  (experiments): Array<IExperimentDetail['id']> => experiments.map(exp => exp.id));


// select experiments for compare and header
export const selectCompareHeader = createSelector(experimentsCompare, (state): CompareHeaderState => state ? state.compareHeader : {});
export const selectExperimentsForCompareSearchResults = createSelector(selectCompareHeader, (state): Array<Task> => state ? state.searchResultsExperiments : []);
export const selectExperimentsForCompareSearchTerm = createSelector(selectCompareHeader, (state) => state?.searchTerm);
export const selectShowAddExperimentsForCompare = createSelector(selectCompareHeader, (state) => state?.showSearch);
export const selectHideIdenticalFields = createSelector(selectCompareHeader, (state) => state?.hideIdenticalRows);
export const selectShowScalarsOptions = createSelector(selectCompareHeader, (state) => state?.showScalarOptions);
export const selectRefreshing = createSelector(selectCompareHeader, (state) => state ? {refreshing: state.refreshing, autoRefresh: state.autoRefresh} : {refreshing: false, autoRefresh: false});
export const selectExperimentsUpdateTime = createSelector(selectCompareHeader, (state) => state ? state.experimentsUpdateTime : {});
export const selectNavigationPreferences = createSelector(selectCompareHeader, (state) => state ? state.navigationPreferences : {});

// Metric Values
export const compareMetricsValues = createSelector(experimentsCompare, (state): IExperimentCompareMetricsValuesState => state ? state.metricsValues : {});
export const selectCompareMetricsValuesExperiments = createSelector(compareMetricsValues, (state): Array<Task> => state.experiments);
export const selectCompareMetricsValuesSortConfig = createSelector(compareMetricsValues, (state): MetricSortBy => state.metricSortBy);

// Charts
export const compareCharts = createSelector(experimentsCompare, (state): IExperimentCompareChartsState => state ? state.charts : {});
export const selectSelectedExperiments = createSelector(compareCharts, (state): Array<string> => state ? state.selectedExperiments : []);
export const selectCompareHistogramCacheAxisType = createSelector(compareCharts, (state) => state.cachedAxisType);
export const selectCompareTasksPlotCharts = createSelector(compareCharts, state => state.metricsPlotsCharts);

export const selectSelectedExperimentSettings = createSelector(compareCharts, selectSelectedExperiments,
  (output, currentExperiments): IExperimentCompareSettings => output.settingsList && output.settingsList.find((setting) => currentExperiments && setting.id.join() === currentExperiments.join()));

export const selectSelectedSettingsHiddenPlot = createSelector(selectSelectedExperimentSettings,
  (settings): Array<string> => get('hiddenMetricsPlot', settings) || []);

export const selectSelectedSettigsHyperParams = createSelector(selectSelectedExperimentSettings,
  (settings): Array<string> => get('selectedHyperParams', settings) || []);

export const selectSelectedSettigsMetric = createSelector(selectSelectedExperimentSettings,
  (settings) => get('selectedMetric', settings) || null);

export const selectSelectedSettingsHiddenScalar = createSelector(selectSelectedExperimentSettings,
  (settings): Array<string> => get('hiddenMetricsScalar', settings) || []);

export const selectExperimentMetricsSearchTerm = createSelector(compareCharts, (state) => state.searchTerm);
export const selectCompareSelectedSettingsSmoothWeight = createSelector(selectSelectedExperimentSettings,
  (settings): number => get('smoothWeight', settings) || 0);

export const selectCompareSelectedSettingsxAxisType = createSelector(selectSelectedExperimentSettings,
  (settings): ScalarKeyEnum => get('xAxisType', settings) || ScalarKeyEnum.Iter);

export const selectCompareSelectedSettingsGroupBy = createSelector(selectSelectedExperimentSettings,
  (settings): GroupByCharts => settings?.groupBy || GroupByCharts.None);


export const selectScalarsGraph = createSelector(experimentsCompare, (state): ScalarsGraphState => state ? state.scalarsGraph : {});
export const selectScalarsGraphShowIdenticalHyperParams = createSelector(selectScalarsGraph, (state): boolean => state ? state.showIdenticalHyperParams : true);
export const selectScalarsGraphMetrics = createSelector(selectScalarsGraph, (state): MetricOption[] => state.metrics);
export const selectScalarsGraphHyperParams = createSelector(selectScalarsGraph, (state): GroupedHyperParams => state ? state.hyperParams : {});
export const selectScalarsGraphTasks = createSelector(selectScalarsGraph, (state): any[] => state ? state.tasks : []);
export const selectMetricValueType = createSelector(selectScalarsGraph, (state): MetricValueType => state ? state.valueType : 'value');

export const selectCompareTasksScalarCharts = createSelector(
  selectCompareSelectedSettingsxAxisType,
  compareCharts,
  (axisType, state) => {
    if (!axisType || axisType === ScalarKeyEnum.IsoTime) {
      return  {
        metrics: Object.keys(state.metricsHistogramCharts.metrics).reduce((metricAcc, metricName) => {
          const metric = state.metricsHistogramCharts.metrics[metricName];
          metricAcc[metricName] = Object.keys(metric).reduce((groupAcc, groupName) => {
            const group = metric[groupName];
            groupAcc[groupName] = Object.keys(group).reduce((graphAcc, graphName) => {
              const graph = group[graphName];
              graphAcc[graphName] = {...graph, x: graph.x.map(ts => new Date(ts))};
              return graphAcc;
            }, {});
            return groupAcc;
          }, {});
          return metricAcc;
        }, {})
      };
    }
    return state.metricsHistogramCharts;
  });
