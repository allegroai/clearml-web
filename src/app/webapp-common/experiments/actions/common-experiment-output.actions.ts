import {createAction, props} from '@ngrx/store';
import {ExperimentSettings} from '../reducers/common-experiment-output.reducer';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {MetricsPlotEvent} from '~/business-logic/model/events/metricsPlotEvent';
import {EventsScalarMetricsIterRawRequest} from '~/business-logic/model/events/eventsScalarMetricsIterRawRequest';
import {PlotSampleResponse} from '~/business-logic/model/events/plotSampleResponse';
import {
  EventsGetTaskSingleValueMetricsResponseTasks
} from '~/business-logic/model/events/eventsGetTaskSingleValueMetricsResponseTasks';
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

export const getGraphDisplayFullDetailsScalars = createAction(
  EXPERIMENTS_OUTPUT_PREFIX + 'GET_FULL_DETAILS_SCALAR',
  props<EventsScalarMetricsIterRawRequest>()
);

export const convertXtypeGraphDisplayFullDetailsScalars = createAction(
  EXPERIMENTS_OUTPUT_PREFIX + 'convertXtype_FULL_DETAILS_SCALAR',
  props<{xAxisType: ScalarKeyEnum}>()
);

export const setXtypeGraphDisplayFullDetailsScalars = createAction(
  EXPERIMENTS_OUTPUT_PREFIX + 'SET_Xtype_FULL_DETAILS_SCALAR',
  props<{xAxisType: ScalarKeyEnum}>()
);

export const setGraphDisplayFullDetailsScalars = createAction(
  EXPERIMENTS_OUTPUT_PREFIX + 'SET_FULL_DETAILS_SCALAR',
  props<{ data }>()
);

export const setGraphDisplayFullDetailsScalarsIsOpen = createAction(
  EXPERIMENTS_OUTPUT_PREFIX + 'SET_FULL_DETAILS_SCALAR_IS_OPEN',
  props<{ isOpen: boolean }>()
);

export const mergeGraphDisplayFullDetailsScalars = createAction(
  EXPERIMENTS_OUTPUT_PREFIX + 'MERGE_FULL_DETAILS_SCALAR',
  props<{data}>()
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

export const getPlotSample = createAction(
  EXPERIMENTS_OUTPUT_PREFIX + 'GET_PLOT_FOR_ITERATION',
  props<{ task: string; metric: string; variant: string; iteration: number }>()
);
export const getNextPlotSample = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'GET_NEXT_PLOT', props<{ task: string; navigateEarlier: boolean }>());
export const setCurrentPlot = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'SET_PLOT_FOR_ITERATION', props<{ event: any }>());
export const setPlotViewerScrollId = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'SET_PLOT_VIEWER_SCROLL_ID', props<{ scrollId: string }>());
export const setPlotIterations = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'SET_PLOT_ITERATIONS', props<PlotSampleResponse>());
export const setViewerEndOfTime = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'SET_VIEWER_END_OF_TIME', props<{ endOfTime: boolean }>());
export const setViewerBeginningOfTime = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'SET_VIEWER_BEGINNING_OF_TIME', props<{ beginningOfTime: boolean }>());
export const resetViewer = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'RESET_VIEWER');
export const setGraphsPerRow = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'SET_GRAPHS_PER_ROW', props<{ graphsPerRow: number }>());
