import {createAction, props} from '@ngrx/store';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {EventsGetMultiTaskPlotsResponse} from '~/business-logic/model/events/eventsGetMultiTaskPlotsResponse';
import {ExperimentCompareSettings} from '@common/experiments-compare/reducers/experiments-compare-charts.reducer';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';


export const EXPERIMENTS_COMPARE_METRICS_CHARTS_ = 'EXPERIMENTS_COMPARE_METRICS_CHARTS_';

// COMMANDS:
export const SET_EXPERIMENT_PLOTS               = EXPERIMENTS_COMPARE_METRICS_CHARTS_ + 'SET_EXPERIMENT_PLOTS';

// EVENTS:


export const getMultiScalarCharts = createAction(
  EXPERIMENTS_COMPARE_METRICS_CHARTS_ + 'GET_MULTI_SCALAR_CHARTS',
  props<{ taskIds: string[]; entity: EntityTypeEnum; autoRefresh?: boolean; cached?: boolean }>()
);

export const getMultiPlotCharts = createAction(
  EXPERIMENTS_COMPARE_METRICS_CHARTS_ + 'GET_MULTI_PLOT_CHARTS',
  props<{ taskIds: Array<string>; entity: EntityTypeEnum; autoRefresh?: boolean }>()
);

export const setSelectedExperiments = createAction(
  EXPERIMENTS_COMPARE_METRICS_CHARTS_ + 'SET_SELECTED_EXPERIMENTS',
  props<{selectedExperiments: string[]}>()
);

export const setExperimentHistogram = createAction(
  EXPERIMENTS_COMPARE_METRICS_CHARTS_ + 'SET_EXPERIMENT_HISTOGRAM',
  props<{payload; axisType: ScalarKeyEnum}>()
);

export const setAxisCache = createAction(
  EXPERIMENTS_COMPARE_METRICS_CHARTS_ + '[set scalar axis type cache]',
  props<{axis: ScalarKeyEnum}>()
);

export const setExperimentPlots = createAction(
  EXPERIMENTS_COMPARE_METRICS_CHARTS_ + 'SET_EXPERIMENT_PLOTS',
  props<{plots: EventsGetMultiTaskPlotsResponse['plots']}>()
);

export const setExperimentSettings = createAction(
  EXPERIMENTS_COMPARE_METRICS_CHARTS_+ 'UPDATE_EXPERIMENT_SETTINGS',
  props<{ id: string[]; changes: Partial<ExperimentCompareSettings> }>()
);

export const setExperimentMetricsSearchTerm = createAction(
  EXPERIMENTS_COMPARE_METRICS_CHARTS_ + 'SET_EXPERIMENT_METRICS_SEARCH_TERM',
  props<{ searchTerm: string }>()
);

export const resetExperimentMetrics  = createAction(EXPERIMENTS_COMPARE_METRICS_CHARTS_ + 'RESET_EXPERIMENT_METRICS');
