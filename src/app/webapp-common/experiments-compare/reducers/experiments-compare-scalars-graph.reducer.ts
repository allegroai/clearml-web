import {createReducer, on} from '@ngrx/store';
import {setHyperParamsList, setMetricsList, setShowIdenticalHyperParams, setTasks, setvalueType} from '../actions/experiments-compare-scalars-graph.actions';
import {GroupedHyperParams, HyperParams, MetricOption, MetricValueType} from './experiments-compare-charts.reducer';

export interface ScalarsGraphState {
  showIdenticalHyperParams: boolean;
  metrics: MetricOption[];
  hyperParams: GroupedHyperParams;
  tasks: any;
  valueType: MetricValueType;
}

export const initialState: ScalarsGraphState = {
  showIdenticalHyperParams: true,
  metrics: null,
  hyperParams: null,
  tasks: [],
  valueType: 'value'
};

const _scalarsGraphReducer = createReducer(initialState,
  on(setShowIdenticalHyperParams, (state: ScalarsGraphState) => ({...state, showIdenticalHyperParams: !state.showIdenticalHyperParams})),
  on(setMetricsList, (state: ScalarsGraphState, {metricsList}) => ({...state, metrics: metricsList})),
  on(setHyperParamsList, (state: ScalarsGraphState, {hyperParams}) => ({...state, hyperParams: hyperParams})),
  on(setTasks, (state: ScalarsGraphState, {tasks}) => ({...state, tasks: tasks})),
  on(setvalueType, (state: ScalarsGraphState, {valueType}) => ({...state, valueType})),
);

export function scalarsGraphReducer(state, action) {
  return _scalarsGraphReducer(state, action);
}
