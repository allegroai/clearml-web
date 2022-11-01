import * as actions from '../actions/experiments-compare-metrics-values.actions';
import {Task} from '~/business-logic/model/tasks/task';
import {createReducer, on} from '@ngrx/store';

export interface MetricSortBy {
  keyOrValue?: 'key' | 'value';
  order?: 'asc' | 'desc';
  keyOrder?: Array<string>;
}

export interface IExperimentCompareMetricsValuesState {
  experiments: Array<Task>;
  metricSortBy: MetricSortBy;
}

export const initialState: IExperimentCompareMetricsValuesState = {
  experiments : null,
  metricSortBy: {}
};

export const experimentsCompareMetricsValuesReducer = createReducer(
  initialState,
  on(actions.setComparedExperiments, (state, action) => ({...state, experiments: action.experiments})),
  on(actions.resetState, () => ({...initialState})),
  on(actions.setMetricValuesSortBy, (state, action) => ({
    ...state, metricSortBy: {
      ...state.metricSortBy,
      [action.metric]: {keyOrValue: action.keyOrValue, order: action.order, keyOrder: action.keyOrder}
    }
  })),
);
