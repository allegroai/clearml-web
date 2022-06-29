import {Action, createAction, props} from '@ngrx/store';
import {ISelectedExperiment} from '~/features/experiments/shared/experiment-info.model';
import {ExperimentSettings} from '../reducers/common-experiment-output.reducer';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {MetricsPlotEvent} from '~/business-logic/model/events/metricsPlotEvent';
import {EventsScalarMetricsIterRawRequest} from '~/business-logic/model/events/eventsScalarMetricsIterRawRequest';
import {EventsScalarMetricsIterRawResponse} from '~/business-logic/model/events/eventsScalarMetricsIterRawResponse';
import {PlotSampleResponse} from '~/business-logic/model/events/plotSampleResponse';
import { EventsGetTaskSingleValueMetricsResponseTasks } from '~/business-logic/model/events/eventsGetTaskSingleValueMetricsResponseTasks';

export const EXPERIMENTS_OUTPUT_PREFIX = 'EXPERIMENTS_OUTPUT_';


export const GET_EXPERIMENT_LOG = EXPERIMENTS_OUTPUT_PREFIX + 'GET_EXPERIMENT_LOG';
export const SET_EXPERIMENT_LOG = EXPERIMENTS_OUTPUT_PREFIX + 'SET_EXPERIMENT_LOG';
export const SET_EXPERIMENT_SCALAR_SINGLE_VALUE = EXPERIMENTS_OUTPUT_PREFIX + 'SET_EXPERIMENT_SCALAR_SINGLE_VALUE';
export const SET_EXPERIMENT_METRICS_SEARCH_TERM = EXPERIMENTS_OUTPUT_PREFIX + 'SET_EXPERIMENT_METRICS_SEARCH_TERM';
export const SET_EXPERIMENT_HISTOGRAM = EXPERIMENTS_OUTPUT_PREFIX + 'SET_EXPERIMENT_HISTOGRAM';
export const SET_EXPERIMENT_PLOTS = EXPERIMENTS_OUTPUT_PREFIX + 'SET_EXPERIMENT_PLOTS';
export const RESET_OUTPUT = EXPERIMENTS_OUTPUT_PREFIX + 'RESET_OUTPUT';


// EVENTS:

export const EXPERIMENT_METRICS_REQUESTED = EXPERIMENTS_OUTPUT_PREFIX + 'EXPERIMENT_METRICS_REQUESTED';
export const EXPERIMENT_PLOTS_REQUESTED = EXPERIMENTS_OUTPUT_PREFIX + 'EXPERIMENT_PLOTS_REQUESTED';
export const EXPERIMENT_SCALAR_REQUESTED = EXPERIMENTS_OUTPUT_PREFIX + 'EXPERIMENT_SCALAR_REQUESTED';

export const CHANGE_PROJECT_REQUESTED = EXPERIMENTS_OUTPUT_PREFIX + 'CHANGE_PROJECT_REQUESTED';
export const UPDATE_EXPERIMENT_SETTINGS = EXPERIMENTS_OUTPUT_PREFIX + 'UPDATE_EXPERIMENT_SETTINGS';
export const RESET_EXPERIMENT_METRICS = EXPERIMENTS_OUTPUT_PREFIX + 'RESET_EXPERIMENT_METRICS';
export const RESET_EXPERIMENT_SCALARS = EXPERIMENTS_OUTPUT_PREFIX + 'RESET_EXPERIMENT_SCALARS';
export const RESET_EXPERIMENT_PLOTS = EXPERIMENTS_OUTPUT_PREFIX + 'RESET_EXPERIMENT_PLOTS';

export const SET_LOG_FILTER = EXPERIMENTS_OUTPUT_PREFIX + 'SET_LOG_FILTER';
export const RESET_LOG_FILTER = EXPERIMENTS_OUTPUT_PREFIX + 'RESET_LOG_FILTER';


export class ResetOutput implements Action {
  readonly type = RESET_OUTPUT;
}


export class ExperimentMetricsRequested implements Action {
  readonly type = EXPERIMENT_METRICS_REQUESTED;

  constructor(public payload: ISelectedExperiment) {
  }
}

export const experimentPlotsRequested = createAction(
  EXPERIMENT_PLOTS_REQUESTED,
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
  props<{ data: EventsScalarMetricsIterRawResponse }>()
);

export class ExperimentScalarRequested implements Action {
  readonly type = EXPERIMENT_SCALAR_REQUESTED;

  constructor(public payload: string) {
  }
}

export class SetExperimentHistogram implements Action {
  readonly type = SET_EXPERIMENT_HISTOGRAM;

  constructor(public payload: { [metric: string]: { [variant: string]: unknown } }, public axisType: ScalarKeyEnum) {
  }
}

export class SetExperimentPlots implements Action {
  readonly type = SET_EXPERIMENT_PLOTS;

  constructor(public payload: MetricsPlotEvent[]) {
  }
}

export const getExperimentLog = createAction(
  GET_EXPERIMENT_LOG,
  props<{ id: string; direction?: string; refresh?: boolean; from?: number }>()
);

export const setExperimentLog = createAction(
  SET_EXPERIMENT_LOG,
  props<{ events: any[]; direction?: string; total: number; refresh?: boolean }>()
);

export const setExperimentScalarSingleValue = createAction(
  SET_EXPERIMENT_SCALAR_SINGLE_VALUE,
  props<EventsGetTaskSingleValueMetricsResponseTasks >()
);

export class SetExperimentSettings implements Action {
  readonly type = UPDATE_EXPERIMENT_SETTINGS;

  constructor(public payload: { id: string; changes: Partial<ExperimentSettings> }) {
  }
}

export class SetExperimentMetricsSearchTerm implements Action {
  readonly type = SET_EXPERIMENT_METRICS_SEARCH_TERM;

  constructor(public payload: { searchTerm: string }) {
  }
}

export class ResetExperimentMetrics implements Action {
  readonly type = RESET_EXPERIMENT_METRICS;
}

export class SetLogFilter implements Action {
  readonly type = SET_LOG_FILTER;

  constructor(public filterString: string) {
  }
}

export class ResetLogFilter implements Action {
  readonly type = RESET_LOG_FILTER;

}

export const downloadFullLog = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'DOWNLOAD_FULL_LOG', props<{ experimentId: string }>());
export const toggleSettings = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'TOGGLE_SETTINGS');

export const getPlotSample = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'GET_PLOT_FOR_ITERATION', props<{ task: string; metric: string; variant: string; iteration: number }>());
export const getNextPlotSample = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'GET_NEXT_PLOT', props<{ task: string; navigateEarlier: boolean }>());
export const setCurrentPlot = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'SET_PLOT_FOR_ITERATION', props<{ event: any }>());
export const setPlotViewerScrollId = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'SET_PLOT_VIEWER_SCROLL_ID', props<{ scrollId: string }>());
export const setPlotIterations = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'SET_PLOT_ITERATIONS', props<PlotSampleResponse>());
export const setViewerEndOfTime = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'SET_VIEWER_END_OF_TIME', props<{ endOfTime: boolean }>());
export const setViewerBeginningOfTime = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'SET_VIEWER_BEGINNING_OF_TIME', props<{ beginningOfTime: boolean }>());
export const resetViewer = createAction(EXPERIMENTS_OUTPUT_PREFIX + 'RESET_VIEWER');
