import {Action, createAction, props} from '@ngrx/store';
import {ISelectedExperiment} from '../../../features/experiments/shared/experiment-info.model';
import {Project} from '../../../business-logic/model/projects/project';
import {Queue} from '../../../business-logic/model/queues/queue';
import {CloneExperimentPayload} from '../shared/common-experiment-model.model';

export const EXPERIMENTS_INFO_PREFIX = 'EXPERIMENTS_INFO_';

// EVENTS:
export const RESET_CLICKED = EXPERIMENTS_INFO_PREFIX + 'RESET_CLICKED';
export const PUBLISH_CLICKED = EXPERIMENTS_INFO_PREFIX + 'PUBLISH_CLICKED';
export const STOP_CLICKED = EXPERIMENTS_INFO_PREFIX + 'STOP_CLICKED';
export const ARCHIVE_CLICKED = EXPERIMENTS_INFO_PREFIX + 'ARCHIVE_CLICKED';
export const RESTORE_CLICKED = EXPERIMENTS_INFO_PREFIX + 'RESTORE_CLICKED';
export const CHANGE_PROJECT_REQUESTED = EXPERIMENTS_INFO_PREFIX + 'CHANGE_PROJECT_REQUESTED';
export const ENQUEUE_CLICKED = EXPERIMENTS_INFO_PREFIX + 'ENQUEUE_CLICKED';
export const DEQUEUE_CLICKED = EXPERIMENTS_INFO_PREFIX + 'DEQUEUE_CLICKED';
export const CLONE_EXPERIMENT_CLICKED = EXPERIMENTS_INFO_PREFIX + 'CLONE_EXPERIMENT_CLICKED';


export class ResetClicked implements Action {
  readonly type = RESET_CLICKED;

  constructor(public payload: ISelectedExperiment) {
  }
}

export class PublishClicked implements Action {
  readonly type = PUBLISH_CLICKED;

  constructor(public payload: ISelectedExperiment) {
  }
}

export class StopClicked implements Action {
  readonly type = STOP_CLICKED;

  constructor(public payload: ISelectedExperiment) {
  }
}

export class ChangeProjectRequested implements Action {
  readonly type = CHANGE_PROJECT_REQUESTED;

  constructor(public payload: { experiment: ISelectedExperiment; project: Project }) {
  }
}

export class EnqueueClicked implements Action {
  readonly type = ENQUEUE_CLICKED;
  public payload: { experiment: ISelectedExperiment; queue: Queue };

  constructor(experiment: ISelectedExperiment, queue: Queue) {
    this.payload = {experiment, queue};
  }
}


export class DequeueClicked implements Action {
  readonly type = DEQUEUE_CLICKED;

  constructor(public payload: ISelectedExperiment) {
  }
}

export class CloneExperimentClicked implements Action {
  readonly type = CLONE_EXPERIMENT_CLICKED;

  constructor(public payload: { originExperiment: ISelectedExperiment; cloneData: CloneExperimentPayload }) {
  }
}

export const addTag = createAction(
  EXPERIMENTS_INFO_PREFIX + '[add tag to experiment]',
  props<{ experiments: ISelectedExperiment[]; tag: string }>()
);

export const removeTag = createAction(
  EXPERIMENTS_INFO_PREFIX + '[remove tag from experiment]',
  props<{ experiments: ISelectedExperiment[]; tag: string }>()
);
export const shareSelectedExperiments = createAction(
  EXPERIMENTS_INFO_PREFIX + '[share experiments]',
  props<{ share: boolean; task: string }>()
);
