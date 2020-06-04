import {ActionReducerMap, createFeatureSelector, createSelector} from '@ngrx/store';
import {experimentsCompareDetailsReducer, IExperimentCompareDetailsState} from './experiments-compare-details.reducer';
import {experimentsCompareChartsReducer, HyperParams, IExperimentCompareChartsState, IExperimentCompareSettings, MetricOption, MetricValueType} from './experiments-compare-charts.reducer';
import {experimentsCompareMetricsValuesReducer, IExperimentCompareMetricsValuesState, MetricSortBy} from './experiments-compare-metrics-values.reducer';
import {experimentsCompareDebugImagesReducer} from './experiments-compare-debug-images.reducer';
import {get} from 'lodash/fp';
import {Task} from '../../../business-logic/model/tasks/task';
import {compareHeader, CompareHeaderState} from './compare-header.reducer';
import {IExperimentDetail} from '../../../features/experiments-compare/experiments-compare-models';
import {ScalarKeyEnum} from '../../../business-logic/model/events/scalarKeyEnum';
import {scalarsGraphReducer, ScalarsGraphState} from './experiments-compare-scalars-graph.reducer';

export const experimentsCompareReducers: ActionReducerMap<any, any> = {
  details      : experimentsCompareDetailsReducer,
  metricsValues: experimentsCompareMetricsValuesReducer,
  charts       : experimentsCompareChartsReducer,
  debugImages  : experimentsCompareDebugImagesReducer,
  compareHeader: compareHeader,
  scalarsGraph : scalarsGraphReducer
};

export const experimentsCompare = createFeatureSelector<any>('experimentsCompare');

// Details
export const experimentsDetails = createSelector(experimentsCompare, (state): IExperimentCompareDetailsState => state ? state.details : {});
export const selectExperimentsDetails = createSelector(experimentsDetails, (state): Array<IExperimentDetail> => state.experiments);
export const selectExpandedPaths = createSelector(experimentsDetails, (state): Array<string> => state.expandedPaths);
export const selectExperimentIds = createSelector(selectExperimentsDetails,
  (experiments): Array<IExperimentDetail['id']> => experiments.map(exp => exp.id));

// select experiments for compare and header
export const selectCompareHeader = createSelector(experimentsCompare, (state): CompareHeaderState => state ? state.compareHeader : {});
export const selectExperimentsForCompareSearchResults = createSelector(selectCompareHeader, (state): Array<Task> => state ? state.searchResultsExperiments : []);
export const selectExperimentsForCompareSearchTerm = createSelector(selectCompareHeader, (state): string => state ? state.searchTerm : '');
export const selectShowAddExperimentsForCompare = createSelector(selectCompareHeader, (state): boolean => state ? state.showSearch : false);
export const selectHideIdenticalFields = createSelector(selectCompareHeader, (state): boolean => state ? state.hideIdenticalRows : false);
export const selectShowScalarsOptions = createSelector(selectCompareHeader, (state): boolean => state ? state.showScalarOptions : false);
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
export const selectCompareTasksScalarCharts = createSelector(compareCharts, state => state.metricsHistogramCharts);
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

export const selectScalarsGraph = createSelector(experimentsCompare, (state): ScalarsGraphState => state ? state.scalarsGraph : {});
export const selectScalarsGraphShowIdenticalHyperParams = createSelector(selectScalarsGraph, (state): boolean => state ? state.showIdenticalHyperParams : true);
export const selectScalarsGraphMetrics = createSelector(selectScalarsGraph, (state): MetricOption[] => state.metrics);
export const selectScalarsGraphHyperParams = createSelector(selectScalarsGraph, (state): HyperParams => state ? state.hyperParams : {});
export const selectScalarsGraphTasks = createSelector(selectScalarsGraph, (state): any[] => state ? state.tasks : []);
export const selectMetricValueType = createSelector(selectScalarsGraph, (state): MetricValueType => state ? state.valueType : 'value');

