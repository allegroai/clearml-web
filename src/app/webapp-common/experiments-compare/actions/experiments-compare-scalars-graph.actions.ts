import {createAction, props} from '@ngrx/store';
import {GroupedHyperParams, MetricOption, MetricValueType} from '../reducers/experiments-compare-charts.reducer';

export const EXPERIMENTS_COMPARE_SCALARS_GRAPH = 'EXPERIMENTS_COMPARE_SCALARS_GRAPH_';


export const getExperimentsHyperParams = createAction(
  EXPERIMENTS_COMPARE_SCALARS_GRAPH + 'GET_EXPERIMENTS_PARAMS',
  props<{ experimentsIds: string[]; autoRefresh?: boolean }>()
);
export const setMetricsList = createAction(
  EXPERIMENTS_COMPARE_SCALARS_GRAPH + 'SET_METRICS_LIST',
  props<{ metricsList: MetricOption[] }>()
);
export const setTasks = createAction(
  EXPERIMENTS_COMPARE_SCALARS_GRAPH + 'SET_TASKS',
  props<{ tasks: any }>()
);
export const setvalueType = createAction(
  EXPERIMENTS_COMPARE_SCALARS_GRAPH + 'SET_VALUE_TYPE',
  props<{ valueType: MetricValueType }>()
);
export const setHyperParamsList = createAction(
  EXPERIMENTS_COMPARE_SCALARS_GRAPH + 'SET_PARAMS_LIST',
  props<{ hyperParams: GroupedHyperParams }>()
);
export const setShowIdenticalHyperParams = createAction(EXPERIMENTS_COMPARE_SCALARS_GRAPH + 'SET_HIDE_IDENTICAL_HYPER_PARAMS');


