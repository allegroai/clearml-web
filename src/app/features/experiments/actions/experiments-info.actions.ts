
import {Action} from '@ngrx/store';
import {Task} from '../../../business-logic/model/tasks/task';
import {IExperimentInfo} from '../shared/experiment-info.model';
import {IExperimentInfoState} from '../reducers/experiment-info.reducer';
import {experimentSectionsEnum} from '../shared/experiments.const';
import {Model} from '../../../business-logic/model/models/model';
import {EXPERIMENTS_INFO_PREFIX} from '../../../webapp-common/experiments/actions/common-experiments-info.actions';


// COMMANDS:
export const SET_EXPERIMENT_FORM_ERRORS      = EXPERIMENTS_INFO_PREFIX + 'SET_EXPERIMENT_FORM_ERRORS';
export const SET_EXPERIMENT_INFO_MODEL_DATA  = EXPERIMENTS_INFO_PREFIX + 'SET_EXPERIMENT_INFO_INPUT_MODEL_DATA';
export const SET_EXPERIMENT_ERRORS           = EXPERIMENTS_INFO_PREFIX + 'SET_EXPERIMENT_ERRORS';
export const ACTIVATE_EDIT                   = EXPERIMENTS_INFO_PREFIX + 'ACTIVATE_EDIT';
export const SET_FREEZE_INFO                 = EXPERIMENTS_INFO_PREFIX + 'SET_FREEZE_INFO';
export const DEACTIVATE_EDIT                 = EXPERIMENTS_INFO_PREFIX + 'DEACTIVATE_EDIT';
export const UPDATE_SECTION_KNOWLEDGE        = EXPERIMENTS_INFO_PREFIX + 'UPDATE_SECTION_KNOWLEDGE';
export const ADD_CUSTOM_OUTPUT_LABEL         = EXPERIMENTS_INFO_PREFIX + 'ADD_CUSTOM_OUTPUT_LABEL';
export const RESET_STATE                     = EXPERIMENTS_INFO_PREFIX + 'RESET_STATE';

// EVENTS:
export const EXPERIMENT_DATA_UPDATED      = EXPERIMENTS_INFO_PREFIX + 'EXPERIMENT_DATA_UPDATED';
export const EXPERIMENT_SAVE              = EXPERIMENTS_INFO_PREFIX + 'EXPERIMENT_SAVE';
export const EXPERIMENT_CANCEL_EDIT       = EXPERIMENTS_INFO_PREFIX + 'EXPERIMENT_CANCEL_EDIT';
export const EXPERIMENT_DETAILS_UPDATED   = EXPERIMENTS_INFO_PREFIX + 'EXPERIMENT_DETAILS_UPDATED';
export const MODEL_SELECTED               = EXPERIMENTS_INFO_PREFIX + 'MODEL_SELECTED';
export const CUSTOM_OUTPUT_LABEL_ADDED    = EXPERIMENTS_INFO_PREFIX + 'CUSTOM_OUTPUT_LABEL_ADDED';


export class CustomOutputLabelAdded implements Action {
  readonly type = CUSTOM_OUTPUT_LABEL_ADDED;

  constructor(public payload: { label: string; value: number }) {
  }
}



export class ModelSelected implements Action {
  readonly type = MODEL_SELECTED;
  public payload: {
    model: Model;
    fieldsToPopulate: { labelEnum: boolean; networkDesign: boolean };
  };

  constructor(payload: {
    model: Model;
    fieldsToPopulate: { labelEnum: boolean; networkDesign: boolean };
  }) {
    this.payload = payload;
  }
}

export class UpdateSectionKnowledge implements Action {
  readonly type = UPDATE_SECTION_KNOWLEDGE;

  constructor(public payload: experimentSectionsEnum) {
  }
}

export class ExperimentDataUpdated implements Action {
  readonly type = EXPERIMENT_DATA_UPDATED;

  constructor(public payload: { id: Task['id']; changes: Partial<IExperimentInfo> }) {
  }
}

export class SaveExperiment implements Action {
  readonly type = EXPERIMENT_SAVE;

  constructor() {
  }
}

export class CancelExperimentEdit implements Action {
  readonly type = EXPERIMENT_CANCEL_EDIT;

  constructor() {
  }
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

export class SetFreezeInfo implements Action {
  readonly type = SET_FREEZE_INFO;

  constructor() {
  }
}

export class DeactivateEdit implements Action {
  readonly type = DEACTIVATE_EDIT;

  constructor() {
  }
}

export class SetExperimentFormErrors implements Action {
  readonly type = SET_EXPERIMENT_FORM_ERRORS;

  constructor(public payload: { [key: string]: any } | null) {
  }
}


