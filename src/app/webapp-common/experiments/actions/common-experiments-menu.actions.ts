import {Action, createAction, props} from '@ngrx/store';
import {ISelectedExperiment} from '../../../features/experiments/shared/experiment-info.model';
import {Project} from '../../../business-logic/model/projects/project';
import {Queue} from '../../../business-logic/model/queues/queue';
import {CloneExperimentPayload, ITableExperiment} from '../shared/common-experiment-model.model';

export const EXPERIMENTS_INFO_PREFIX = 'EXPERIMENTS_INFO_';

// EVENTS:
export const CLONE_EXPERIMENT_CLICKED = EXPERIMENTS_INFO_PREFIX + 'CLONE_EXPERIMENT_CLICKED';


export const publishClicked = createAction(
  EXPERIMENTS_INFO_PREFIX + '[publish experiments]',
  props<{ selectedEntities: ISelectedExperiment[] }>()
);

export const stopClicked = createAction(
  EXPERIMENTS_INFO_PREFIX + '[stop experiments]',
  props<{ selectedEntities: ISelectedExperiment[] }>()
);

export const changeProjectRequested = createAction(
  EXPERIMENTS_INFO_PREFIX + '[change project requested]',
  props<{ selectedEntities: ISelectedExperiment[]; project: Project }>()
);

export const dequeueClicked = createAction(
  EXPERIMENTS_INFO_PREFIX + '[dequeue experiments]',
  props<{ selectedEntities: ISelectedExperiment[] }>()
);

export class CloneExperimentClicked implements Action {
  readonly type = CLONE_EXPERIMENT_CLICKED;

  constructor(public payload: { originExperiment: ISelectedExperiment; cloneData: CloneExperimentPayload }) {
  }
}

export const addTag = createAction(
  EXPERIMENTS_INFO_PREFIX + '[add tag to experiment]',
  props<{ experiments: Partial<ITableExperiment>[]; tag: string }>()
);

export const getAllTasksChildren = createAction(
  EXPERIMENTS_INFO_PREFIX + '[get all tasks children]',
  props<{ experiments: string[]}>()
);

export const setAllTasksChildren = createAction(
  EXPERIMENTS_INFO_PREFIX + '[set all tasks children]',
  props<{ experiments: ITableExperiment[]}>()
);

export const removeTag = createAction(
  EXPERIMENTS_INFO_PREFIX + '[remove tag from experiment]',
  props<{ experiments: Partial<ITableExperiment>[]; tag: string }>()
);
export const shareSelectedExperiments = createAction(
  EXPERIMENTS_INFO_PREFIX + '[share experiments]',
  props<{ share: boolean; task: string }>()
);

export const navigateToQueue = createAction(
  EXPERIMENTS_INFO_PREFIX + '[navigate to queue]',
  props<{ experimentId: string }>()
);

export const resetClicked = createAction(
  EXPERIMENTS_INFO_PREFIX + '[reset experiments]',
  props<{ selectedEntities: ISelectedExperiment[] }>()
);

export const enqueueClicked = createAction(
  EXPERIMENTS_INFO_PREFIX + '[enqueue experiments]',
  props<{ selectedEntities: ISelectedExperiment[]; queue: Queue }>()
);

export const archiveSelectedExperiments = createAction(
  EXPERIMENTS_INFO_PREFIX + '[archive selected experiments]',
  props<{ selectedEntities: ISelectedExperiment[]; skipUndo?: boolean }>()
);

export const restoreSelectedExperiments = createAction(
  EXPERIMENTS_INFO_PREFIX + '[restore selected experiments]',
  props<{ selectedEntities: ISelectedExperiment[]; skipUndo?: boolean }>()
);
