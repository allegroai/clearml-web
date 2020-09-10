import {Action, createAction, props} from '@ngrx/store';
import {ISelectedModel} from '../shared/models.model';
import {Project} from '../../../business-logic/model/projects/project';

const MODELS_PREFIX = 'MODELS_MENU_';

//COMMANDS:

//EVENTS:
export const ARCHIVE_CLICKED       = MODELS_PREFIX + 'ARCHIVE_CLICKED';
export const RESTORE_CLICKED       = MODELS_PREFIX + 'RESTORE_CLICKED';
export const PUBLISH_MODEL_CLICKED = MODELS_PREFIX + 'PUBLISH_MODEL_CLICKED';
export const CHANGE_PROJECT_REQUESTED = MODELS_PREFIX + 'CHANGE_PROJECT_REQUESTED';


export class PublishModelClicked implements Action {
  readonly type = PUBLISH_MODEL_CLICKED;

  constructor(public payload: ISelectedModel) {
  }

}

export class ChangeProjectRequested implements Action {
  readonly type = CHANGE_PROJECT_REQUESTED;

  constructor(public payload: { model: ISelectedModel, project: Project }) {
  }
}

export const addTag = createAction(
  MODELS_PREFIX + '[add tag to model]',
  props<{models: ISelectedModel[]; tag: string}>()
);

export const removeTag = createAction(
  MODELS_PREFIX + '[remove tag from model]',
  props<{models: ISelectedModel[]; tag: string}>()
);
