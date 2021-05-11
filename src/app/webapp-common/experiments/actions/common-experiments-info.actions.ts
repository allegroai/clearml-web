import {Action, createAction, props} from '@ngrx/store';
import {Task} from '../../../business-logic/model/tasks/task';
import {IExperimentInfo, ISelectedExperiment} from '../../../features/experiments/shared/experiment-info.model';
import {Model} from '../../../business-logic/model/models/model';
import {ITableExperiment} from '../shared/common-experiment-model.model';
import {ParamsItem} from '../../../business-logic/model/tasks/paramsItem';
import {ConfigurationItem} from '../../../business-logic/model/tasks/configurationItem';
import {IExperimentInfoState} from '../../../features/experiments/reducers/experiment-info.reducer';
import {experimentSectionsEnum} from '../../../features/experiments/shared/experiments.const';
import {ActivatedRoute} from '@angular/router';
import {ITask} from '../../../business-logic/model/al-task';

export const EXPERIMENTS_INFO_PREFIX = 'EXPERIMENTS_INFO_';
export const GET_EXPERIMENT_INFO = EXPERIMENTS_INFO_PREFIX + 'GET_EXPERIMENT_INFO';
export const AUTO_REFRESH_EXPERIMENT_INFO = EXPERIMENTS_INFO_PREFIX + 'AUTO_REFRESH_EXPERIMENT_INFO';
export const SET_EXPERIMENT = EXPERIMENTS_INFO_PREFIX + 'SET_EXPERIMENT';
export const EXPERIMENT_UPDATED_SUCCESSFULLY = EXPERIMENTS_INFO_PREFIX + 'EXPERIMENT_UPDATED_SUCCESSFULLY';
export const SET_EXPERIMENT_INFO_DATA = EXPERIMENTS_INFO_PREFIX + 'SET_EXPERIMENT_INFO_DATA';
export const RESET_EXPERIMENT_INFO = EXPERIMENTS_INFO_PREFIX + 'RESET_EXPERIMENT_INFO';
export const UPDATE_EXPERIMENT_INFO_DATA = EXPERIMENTS_INFO_PREFIX + 'UPDATE_EXPERIMENT_INFO_DATA';
export const MODEL_SELECTED = EXPERIMENTS_INFO_PREFIX + 'MODEL_SELECTED';

export const SET_EXPERIMENT_FORM_ERRORS = EXPERIMENTS_INFO_PREFIX + 'SET_EXPERIMENT_FORM_ERRORS';
export const SET_EXPERIMENT_ERRORS = EXPERIMENTS_INFO_PREFIX + 'SET_EXPERIMENT_ERRORS';
export const ACTIVATE_EDIT = EXPERIMENTS_INFO_PREFIX + 'ACTIVATE_EDIT';
export const DEACTIVATE_EDIT = EXPERIMENTS_INFO_PREFIX + 'DEACTIVATE_EDIT';
export const RESET_STATE = EXPERIMENTS_INFO_PREFIX + 'RESET_STATE';
// EVENTS:
export const EXPERIMENT_DATA_UPDATED = EXPERIMENTS_INFO_PREFIX + 'EXPERIMENT_DATA_UPDATED';
export const EXPERIMENT_SAVE = EXPERIMENTS_INFO_PREFIX + 'EXPERIMENT_SAVE';
export const EXPERIMENT_SAVE_SECTION = EXPERIMENTS_INFO_PREFIX + 'EXPERIMENT_SAVE_SECTION';
export const EXPERIMENT_CANCEL_EDIT = EXPERIMENTS_INFO_PREFIX + 'EXPERIMENT_CANCEL_EDIT';
export const EXPERIMENT_DETAILS_UPDATED = EXPERIMENTS_INFO_PREFIX + 'EXPERIMENT_DETAILS_UPDATED';

export class GetExperimentInfo implements Action {
  readonly type = GET_EXPERIMENT_INFO;
  constructor(public payload: Task['id']) {
  }
}

export class ResetExperimentInfo implements Action {
  readonly type = RESET_EXPERIMENT_INFO;
}

export class AutoRefreshExperimentInfo implements Action {
  readonly type = AUTO_REFRESH_EXPERIMENT_INFO;

  constructor(public payload: Task['id']) {
  }
}

export class SetExperiment implements Action {
  readonly type = SET_EXPERIMENT;

  constructor(public payload: ISelectedExperiment) {
  }
}

export class ExperimentUpdatedSuccessfully implements Action {
  readonly type = EXPERIMENT_UPDATED_SUCCESSFULLY;

  constructor(public payload: string) {
  }
}

export class SetExperimentInfoData implements Action {
  readonly type = SET_EXPERIMENT_INFO_DATA;

  constructor(public payload: IExperimentInfo) {
  }
}

export const getExperiment = createAction(
  EXPERIMENTS_INFO_PREFIX + '[set experiment]',
  props<{ experimentId: string }>()
);

export const getExperimentUncommittedChanges = createAction(
  EXPERIMENTS_INFO_PREFIX + '[get uncommitted change]',
  props<{ experimentId: string; autoRefresh?: boolean }>()
);

export const setExperimentUncommittedChanges = createAction(
  EXPERIMENTS_INFO_PREFIX + '[set uncommitted change]',
  props<{ diff: string }>()
);

export class UpdateExperimentInfoData implements Action {
  readonly type = UPDATE_EXPERIMENT_INFO_DATA;

  constructor(public payload: { id: ITableExperiment['id']; changes: Partial<IExperimentInfo> }) {
  }
}
export const saveExperimentInputModel = createAction(
  EXPERIMENTS_INFO_PREFIX + '[save input model]', props<{ modelId: string; modelName: string; route: ActivatedRoute}>());

export const saveHyperParamsSection = createAction(
  EXPERIMENTS_INFO_PREFIX + 'SAVE_HYPERPARAMS', props<{ hyperparams: ParamsItem[] }>());

export const saveExperimentConfigObj = createAction(
  EXPERIMENTS_INFO_PREFIX + 'SAVE_CONFIG_OBJ', props<{ configuration: ConfigurationItem[] }>());

export const deleteHyperParamsSection = createAction(
  EXPERIMENTS_INFO_PREFIX + 'DELETE_HYPERPARAMS_SECTION', props<{ section: string }>());

export const hyperParamsSectionUpdated = createAction(
  EXPERIMENTS_INFO_PREFIX + 'UPDATE_HYPERPARAMS', props<{ section: string; hyperparams: ParamsItem[] }>());

export const getExperimentConfigurationNames = createAction(
  EXPERIMENTS_INFO_PREFIX + 'GET_CONFIGURATION', props<{ experimentId: string }>());

export const setExperimentSaving = createAction(
  EXPERIMENTS_INFO_PREFIX + 'SET_SAVING', props<{ saving: boolean }>());

export const getExperimentConfigurationObj = createAction(
  EXPERIMENTS_INFO_PREFIX + 'GET_CONFIGURATION_OBJ');

export const updateExperimentAtPath = createAction(
  EXPERIMENTS_INFO_PREFIX + 'UPDATE_EXPERIMENT_AT_PATH',
  props<{ path: string; value: any }>()
);

// COMMANDS:

export class ExperimentDataUpdated implements Action {
  readonly type = EXPERIMENT_DATA_UPDATED;

  constructor(public payload: { id: Task['id']; changes: Partial<IExperimentInfo> }) {
  }
}

export class SaveExperiment implements Action {
  readonly type = EXPERIMENT_SAVE;
}

export const saveExperimentSection = createAction(EXPERIMENT_SAVE_SECTION, props<Task>());

export class CancelExperimentEdit implements Action {
  readonly type = EXPERIMENT_CANCEL_EDIT;
}

export class ExperimentDetailsUpdated implements Action {
  readonly type = EXPERIMENT_DETAILS_UPDATED;

  constructor(public payload: { id: Task['id']; changes: any }) {
  }
}

export class SetExperimentErrors implements Action {
  readonly type = SET_EXPERIMENT_ERRORS;

  constructor(public payload: { [key: string]: IExperimentInfoState['errors'] }) {
  }
}

export class ActivateEdit implements Action {
  readonly type = ACTIVATE_EDIT;

  constructor(public payload: string) {
  }
}

export class DeactivateEdit implements Action {
  readonly type = DEACTIVATE_EDIT;

}

export class SetExperimentFormErrors implements Action {
  readonly type = SET_EXPERIMENT_FORM_ERRORS;

  constructor(public payload: { [key: string]: any } | null) {
  }
}
