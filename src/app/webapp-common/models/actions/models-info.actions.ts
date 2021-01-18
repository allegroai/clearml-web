import {Action, createAction, props} from '@ngrx/store';
import {Model} from '../../../business-logic/model/models/model';
import {SelectedModel, TableModel} from '../shared/models.model';
import {ModelsUpdateRequest} from '../../../business-logic/model/models/modelsUpdateRequest';


const MODELS_PREFIX = 'MODELS_INFO_';


// COMMANDS:
export const GET_MODEL_INFO             = MODELS_PREFIX + 'GET_MODEL_INFO';
export const REFRESH_MODEL_INFO         = MODELS_PREFIX + 'REFRESH_MODEL_INFO';
export const SET_MODEL                  = MODELS_PREFIX + 'SET_MODEL';
export const ACTIVATE_MODEL_EDIT        = MODELS_PREFIX + 'ACTIVATE_EDIT';
export const MODEL_CANCEL_EDIT          = MODELS_PREFIX + 'MODEL_CANCEL_EDIT';
export const SET_IS_MODEL_SAVING        = MODELS_PREFIX + 'SET_IS_MODEL_SAVING';


// EVENTS:
export const MODEL_DETAILS_UPDATED      = MODELS_PREFIX + 'MODEL_DETAILS_UPDATED';
export const EDIT_MODEL                 = MODELS_PREFIX + 'EDIT_MODEL';


export class GetModelInfo implements Action {
  readonly type = GET_MODEL_INFO;

  constructor(public payload: Model['id']) {
  }
}
export class ActivateModelEdit implements Action {
  readonly type = ACTIVATE_MODEL_EDIT;

  constructor(public payload: string) {
  }
}
export class CancelModelEdit implements Action {
  readonly type = MODEL_CANCEL_EDIT;

  constructor() {
  }
}
export class RefreshModelInfo implements Action {
  readonly type = REFRESH_MODEL_INFO;

  constructor(public payload: Model['id']) {
  }
}

export class SetModel implements Action {
  readonly type = SET_MODEL;

  constructor(public payload: SelectedModel) {
  }
}
export class EditModel implements Action {
  readonly type = EDIT_MODEL;

  constructor(public payload: SelectedModel) {
  }
}
export class SetIsModelSaving implements Action {
  readonly type = SET_IS_MODEL_SAVING;

  constructor(public payload: boolean) {
  }
}
export class ModelDetailsUpdated implements Action {
  readonly type = MODEL_DETAILS_UPDATED;

  constructor(public payload: { id: Model['id']; changes: Partial<ModelsUpdateRequest> }) {
  }
}

export const updateModelDetails = createAction(
  MODELS_PREFIX + '[update model details]',
  props<{id: string; changes: Partial<ModelsUpdateRequest>}>()
);
