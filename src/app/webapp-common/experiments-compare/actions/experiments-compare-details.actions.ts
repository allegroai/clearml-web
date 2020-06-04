import {Action} from '@ngrx/store';
import {Task} from '../../../business-logic/model/tasks/task';
import {IExperimentDetail} from '../../../features/experiments-compare/experiments-compare-models';

export const EXPERIMENTS_COMPARE_DETAILS_PREFIX = 'EXPERIMENTS_COMPARE_DETAILS_';

// commands.
export const SET_EXPERIMENTS = EXPERIMENTS_COMPARE_DETAILS_PREFIX + 'SET_EXPERIMENTS';
export const EXPAND_NODE = EXPERIMENTS_COMPARE_DETAILS_PREFIX + 'EXPAND_NODE';
export const EXPAND_NODES = EXPERIMENTS_COMPARE_DETAILS_PREFIX + 'EXPAND_NODES';
export const COLLAPSE_NODE = EXPERIMENTS_COMPARE_DETAILS_PREFIX + 'COLLAPSE_NODE';
export const RESET_STATE = EXPERIMENTS_COMPARE_DETAILS_PREFIX + 'RESET_STATE';

// events.
export const EXPERIMENT_LIST_UPDATED = EXPERIMENTS_COMPARE_DETAILS_PREFIX + 'EXPERIMENT_LIST_UPDATED';
export const REFETCH_EXPERIMENT_REQUESTED = EXPERIMENTS_COMPARE_DETAILS_PREFIX + 'REFETCH_EXPERIMENT_REQUESTED';


export class ExperimentListUpdated implements Action {
  readonly type = EXPERIMENT_LIST_UPDATED;

  constructor(public payload: Array<Task['id']>) {
  }
}

export class SetExperiments implements Action {
  readonly type = SET_EXPERIMENTS;

  constructor(public payload: Array<IExperimentDetail>) {
  }
}

export class ExpandNode implements Action {
  readonly type = EXPAND_NODE;

  // the node path.
  constructor(public payload: string | Array<string>) {
  }
}

export class CollapseNode implements Action {
  readonly type = COLLAPSE_NODE;

  // the node path.
  constructor(public payload: string) {
  }
}

export class ResetState implements Action {
  readonly type = RESET_STATE;
}
