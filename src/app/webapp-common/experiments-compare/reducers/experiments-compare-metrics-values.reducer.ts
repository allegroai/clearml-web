import * as actions from '../actions/experiments-compare-metrics-values.actions';
import {Task} from '../../../business-logic/model/tasks/task';

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


export function experimentsCompareMetricsValuesReducer(state: IExperimentCompareMetricsValuesState = initialState, action): IExperimentCompareMetricsValuesState {
  switch (action.type) {
    case actions.SET_COMPARED_EXPERIMENTS:
      return {...state, experiments: action.payload.experiments};
    case actions.RESET_STATE:
      return {...initialState};
    case actions.SET_METRIC_VALUES_SORT_BY:
      return {
        ...state, metricSortBy: {
          ...state.metricSortBy,
          [action.payload.metric]: {keyOrValue: action.payload.keyOrValue, order: action.payload.order, keyOrder: action.payload.keyOrder}
        }
      };
    default:
      return state;
  }
}
