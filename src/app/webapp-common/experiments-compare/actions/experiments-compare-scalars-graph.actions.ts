import {createAction, props} from '@ngrx/store';
import {GroupedHyperParams, HyperParams, MetricOption, MetricValueType} from '../reducers/experiments-compare-charts.reducer';

export const EXPERIMENTS_COMPARE_SCALARS_GRAPH = 'EXPERIMENTS_COMPARE_SCALARS_GRAPH_';

export const GET_EXPERIMENTS_PARAMS = EXPERIMENTS_COMPARE_SCALARS_GRAPH + 'GET_EXPERIMENTS_PARAMS';
export const SET_METRICS_LIST = EXPERIMENTS_COMPARE_SCALARS_GRAPH + 'SET_METRICS_LIST';
export const SET_PARAMS_LIST = EXPERIMENTS_COMPARE_SCALARS_GRAPH + 'SET_PARAMS_LIST';
export const SET_TASKS = EXPERIMENTS_COMPARE_SCALARS_GRAPH + 'SET_TASKS';
export const SET_HIDE_IDENTICAL_HYPER_PARAMS = EXPERIMENTS_COMPARE_SCALARS_GRAPH + 'SET_HIDE_IDENTICAL_HYPER_PARAMS';
export const SET_VALUE_TYPE = EXPERIMENTS_COMPARE_SCALARS_GRAPH + 'SET_VALUE_TYPE';

export const getExperimentsHyperParams = createAction(GET_EXPERIMENTS_PARAMS, props<{ experimentsIds: string[]; autoRefresh?: boolean }>());
export const setMetricsList = createAction(SET_METRICS_LIST, props<{ metricsList: MetricOption[] }>());
export const setTasks = createAction(SET_TASKS, props<{ tasks: any }>());
export const setvalueType = createAction(SET_VALUE_TYPE, props<{ valueType: MetricValueType }>());
export const setHyperParamsList = createAction(SET_PARAMS_LIST, props<{ hyperParams: GroupedHyperParams }>());
export const setShowIdenticalHyperParams = createAction(SET_HIDE_IDENTICAL_HYPER_PARAMS);
