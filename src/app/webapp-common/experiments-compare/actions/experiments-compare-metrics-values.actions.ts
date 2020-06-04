import {Action} from '@ngrx/store';
import {Task} from '../../../business-logic/model/tasks/task';

export const EXPERIMENTS_COMPARE_METRICS_VALUES_ = 'EXPERIMENTS_COMPARE_METRICS_VALUES_';

export const GET_COMPARED_EXPERIMENTS_METRICS_VALUES = EXPERIMENTS_COMPARE_METRICS_VALUES_ + 'GET_COMPARED_EXPERIMENTS_METRICS_VALUES';
export const SET_COMPARED_EXPERIMENTS                = EXPERIMENTS_COMPARE_METRICS_VALUES_ + 'SET_COMPARED_EXPERIMENTS';
export const SET_METRIC_VALUES_SORT_BY               = EXPERIMENTS_COMPARE_METRICS_VALUES_ + 'SET_METRIC_VALUES_SORT_BY';
export const RESET_STATE                             = EXPERIMENTS_COMPARE_METRICS_VALUES_ + 'RESET_STATE';


export class GetComparedExperimentsMetricsValues implements Action {
  readonly type = GET_COMPARED_EXPERIMENTS_METRICS_VALUES;

  constructor(public payload: { taskIds: string[]; autoRefresh?: boolean }) {}
}

export class SetComparedExperiments implements Action {
  readonly type = SET_COMPARED_EXPERIMENTS;
  public payload: { experiments: Array<Task> };

  constructor(experiments: Array<Task>) {
    this.payload = {experiments};
  }
}

export class SetMetricValuesSortBy implements Action {
  readonly type = SET_METRIC_VALUES_SORT_BY;
  public payload: { metric: string, keyOrValue: string, order: string, keyOrder: Array<string> };

  constructor(metric: string, keyOrValue: string, order: string, keyOrder: Array<string>) {
    this.payload = {metric, keyOrValue, order, keyOrder};
  }
}

export class ResetState implements Action {
  readonly type = RESET_STATE;

  constructor() {
  }
}


