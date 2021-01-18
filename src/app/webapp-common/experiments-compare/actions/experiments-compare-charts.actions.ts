import {Action, createAction, props} from '@ngrx/store';
import {ISmAction} from '../../core/models/actions';
import {IExperimentSettings} from '../../experiments/reducers/common-experiment-output.reducer';
import {ScalarKeyEnum} from '../../../business-logic/model/events/scalarKeyEnum';


export const EXPERIMENTS_COMPARE_METRICS_CHARTS_ = 'EXPERIMENTS_COMPARE_METRICS_CHARTS_';

// COMMANDS:
export const SET_SELECTED_EXPERIMENTS           = EXPERIMENTS_COMPARE_METRICS_CHARTS_ + 'SET_SELECTED_EXPERIMENTS';
export const SET_EXPERIMENT_METRICS_SEARCH_TERM = EXPERIMENTS_COMPARE_METRICS_CHARTS_ + 'SET_EXPERIMENT_METRICS_SEARCH_TERM';
export const SET_EXPERIMENT_HISTOGRAM           = EXPERIMENTS_COMPARE_METRICS_CHARTS_ + 'SET_EXPERIMENT_HISTOGRAM';
export const SET_EXPERIMENT_PLOTS               = EXPERIMENTS_COMPARE_METRICS_CHARTS_ + 'SET_EXPERIMENT_PLOTS';

export const SET_MULTI_SCALAR_CHARTS            = EXPERIMENTS_COMPARE_METRICS_CHARTS_ + 'SET_MULTI_SCALAR_CHARTS';
export const SET_MULTI_PLOT_CHARTS              = EXPERIMENTS_COMPARE_METRICS_CHARTS_ + 'SET_MULTI_PLOT_CHARTS';

// EVENTS:

export const GET_MULTI_SCALAR_CHARTS            = EXPERIMENTS_COMPARE_METRICS_CHARTS_ + 'GET_MULTI_SCALAR_CHARTS';
export const GET_MULTI_PLOT_CHARTS              = EXPERIMENTS_COMPARE_METRICS_CHARTS_ + 'GET_MULTI_PLOT_CHARTS';



export const UPDATE_EXPERIMENT_SETTINGS        = EXPERIMENTS_COMPARE_METRICS_CHARTS_ + 'UPDATE_EXPERIMENT_SETTINGS';
export const RESET_EXPERIMENT_METRICS          = EXPERIMENTS_COMPARE_METRICS_CHARTS_ + 'RESET_EXPERIMENT_METRICS';



export class GetMultiScalarCharts implements ISmAction {
  public type = GET_MULTI_SCALAR_CHARTS;

  constructor(public payload: { taskIds: string[]; autoRefresh?: boolean; cached?: boolean }) {}
}

export class GetMultiPlotCharts implements ISmAction {
  readonly type = GET_MULTI_PLOT_CHARTS;

  constructor(public payload: { taskIds: Array<string>; autoRefresh?: boolean }) {}
}

export class SetSelectedExperiments implements Action {
  readonly type = SET_SELECTED_EXPERIMENTS;

  constructor(public payload: {selectedExperiments: Array<string>}) {
  }
}
export class SetExperimentHistogram implements Action {
  readonly type = SET_EXPERIMENT_HISTOGRAM;

  constructor(public payload: any,  public axisType: ScalarKeyEnum) {
  }
}

export const setAxisCache = createAction(
  EXPERIMENTS_COMPARE_METRICS_CHARTS_ + '[set scalar axis type cache]',
  props<{axis: ScalarKeyEnum}>()
);

export class SetExperimentPlots implements Action {
  readonly type = SET_EXPERIMENT_PLOTS;

  constructor(public payload: any) {
  }
}


export class SetExperimentSettings implements Action {
  readonly type = UPDATE_EXPERIMENT_SETTINGS;

  constructor(public payload: { id: Array<string>; changes: Partial<IExperimentSettings>}) {
  }
}

export class SetExperimentMetricsSearchTerm implements Action {
  readonly type = SET_EXPERIMENT_METRICS_SEARCH_TERM;

  constructor(public payload: { searchTerm: string}) {
  }
}

export class ResetExperimentMetrics implements Action {
  readonly type = RESET_EXPERIMENT_METRICS;
}



