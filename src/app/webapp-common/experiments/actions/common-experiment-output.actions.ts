import {createAction, props} from '@ngrx/store';
import {ExperimentSettings} from '../reducers/common-experiment-output.reducer';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {MetricsPlotEvent} from '~/business-logic/model/events/metricsPlotEvent';
import {EventsGetTaskSingleValueMetricsResponseTasks} from '~/business-logic/model/events/eventsGetTaskSingleValueMetricsResponseTasks';
import {ChartHoverModeEnum} from '../shared/common-experiments.const';

export interface SeriesData {
  name: string;
  x: number[];
  y: number[];
}

export interface HistogramCharts {
  [metric: string]: { [variant: string]: SeriesData };
}

export const EXPERIMENTS_OUTPUT_PREFIX = 'EXPERIMENTS_OUTPUT_';

export const resetOutput = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'RESET_OUTPUT');

export const experimentPlotsRequested = createAction(
  EXPERIMENTS_OUTPUT_PREFIX + 'EXPERIMENT_PLOTS_REQUESTED',
  props<{ task: string }>()
);

export const experimentScalarRequested  = createAction(
  EXPERIMENTS_OUTPUT_PREFIX + 'EXPERIMENT_SCALAR_REQUESTED',
  props<{experimentId: string}>()
);

export const setHistogram = createAction(
  EXPERIMENTS_OUTPUT_PREFIX + 'SET_EXPERIMENT_HISTOGRAM',
  props<{histogram: HistogramCharts; axisType: ScalarKeyEnum}>()
);
export const setScalarsHoverMode = createAction(
  EXPERIMENTS_OUTPUT_PREFIX + 'SET SCALARS HOVER MODE',
  props<{ hoverMode: ChartHoverModeEnum }>()
);

export const setExperimentPlots = createAction(
  EXPERIMENTS_OUTPUT_PREFIX + 'SET_EXPERIMENT_PLOTS',
  props<{plots: MetricsPlotEvent[]}>()
);

export const getExperimentLog = createAction(
  EXPERIMENTS_OUTPUT_PREFIX + 'GET_EXPERIMENT_LOG',
  props<{ id: string; direction?: string; refresh?: boolean; from?: number; autoRefresh?: boolean }>()
);

export const setExperimentLog = createAction(
  EXPERIMENTS_OUTPUT_PREFIX + 'SET_EXPERIMENT_LOG',
  props<{ events: any[]; direction?: string; total: number; refresh?: boolean }>()
);

export const setExperimentLogLoading = createAction(
  EXPERIMENTS_OUTPUT_PREFIX + 'SET_EXPERIMENT_LOG loading',
  props<{loading: boolean}>()
);

export const setExperimentLogAtStart = createAction(
  EXPERIMENTS_OUTPUT_PREFIX + 'SET_EXPERIMENT_LOG as start',
  props<{atStart: boolean}>()
);

export const setExperimentScalarSingleValue = createAction(
  EXPERIMENTS_OUTPUT_PREFIX + 'SET_EXPERIMENT_SCALAR_SINGLE_VALUE',
  props<EventsGetTaskSingleValueMetricsResponseTasks >()
);

export const setExperimentSettings = createAction(
  EXPERIMENTS_OUTPUT_PREFIX + 'UPDATE_EXPERIMENT_SETTINGS',
  props<{ id: string; changes: Partial<ExperimentSettings> }>()
);

export const setExperimentMetricsSearchTerm = createAction(
  EXPERIMENTS_OUTPUT_PREFIX + 'SET_EXPERIMENT_METRICS_SEARCH_TERM',
  props<{ searchTerm: string }>()
);

export const resetExperimentMetrics  = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'RESET_EXPERIMENT_METRICS');

export const setLogFilter = createAction(
  EXPERIMENTS_OUTPUT_PREFIX + 'SET_LOG_FILTER',
  props<{filter: string}>()
);

export const resetLogFilter = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'RESET_LOG_FILTER');
export const downloadFullLog = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'DOWNLOAD_FULL_LOG', props<{ experimentId: string }>());
export const toggleSettings = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'TOGGLE_SETTINGS');
export const setGraphsPerRow = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'SET_GRAPHS_PER_ROW', props<{ graphsPerRow: number }>());

