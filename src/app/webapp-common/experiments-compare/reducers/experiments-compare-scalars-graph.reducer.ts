import {createReducer, on} from '@ngrx/store';
import {setHyperParamsList, setMetricsList, setShowIdenticalHyperParams, setTasks, setvalueType} from '../actions/experiments-compare-scalars-graph.actions';
import {GroupedHyperParams, MetricOption} from './experiments-compare-charts.reducer';
import {MetricValueType} from '@common/experiments-compare/experiments-compare.constants';

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

export const scalarsGraphReducer = createReducer(initialState,
  on(setShowIdenticalHyperParams, (state): ScalarsGraphState => ({...state, showIdenticalHyperParams: !state.showIdenticalHyperParams})),
  on(setMetricsList, (state, {metricsList}): ScalarsGraphState => ({...state, metrics: metricsList})),
  on(setHyperParamsList, (state, {hyperParams}): ScalarsGraphState => ({...state, hyperParams})),
  on(setTasks, (state, {tasks}): ScalarsGraphState => ({...state, tasks})),
  on(setvalueType, (state, {valueType}): ScalarsGraphState => ({...state, valueType})),
);
