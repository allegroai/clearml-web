import {ISmAction} from '../../core/models/actions';
import {CreationStatusEnum} from './project-dialog.reducer';
import {ProjectsCreateRequest} from '~/business-logic/model/projects/projectsCreateRequest';
import {createAction, props} from '@ngrx/store';

const CREATE_PROJECT_DIALOG_PREFIX = 'CREATE_PROJECT_DIALOG_';

export const CREATE_PROJECT_ACTIONS = {
  RESET_STATE            : CREATE_PROJECT_DIALOG_PREFIX + 'RESET_STATE',
  CREATE_NEW_PROJECT     : CREATE_PROJECT_DIALOG_PREFIX + 'CREATE_NEW_PROJECT',
  SET_CREATION_STATUS    : CREATE_PROJECT_DIALOG_PREFIX + 'SET_CREATION_STATUS',
  NAVIGATE_TO_NEW_PROJECT: CREATE_PROJECT_DIALOG_PREFIX + 'NAVIGATE_TO_NEW_PROJECT'
};


export class ResetState implements ISmAction {
  readonly type = CREATE_PROJECT_ACTIONS.RESET_STATE;

  constructor() {
  }
}



export class CreateNewProject implements ISmAction {
  readonly type = CREATE_PROJECT_ACTIONS.CREATE_NEW_PROJECT;

  constructor(public payload: ProjectsCreateRequest) {
  }
}

export class NavigateToNewProject implements ISmAction {
  readonly type = CREATE_PROJECT_ACTIONS.NAVIGATE_TO_NEW_PROJECT;

  constructor(public payload: string) {
    this.payload = payload;
  }
}
export class SetNewProjectCreationStatus implements ISmAction {
  readonly type = CREATE_PROJECT_ACTIONS.SET_CREATION_STATUS;
  public payload: { creationStatus: CreationStatusEnum };

  constructor(creationStatus: CreationStatusEnum) {
    this.payload = {creationStatus};
  }
}

export const moveProject = createAction(
  CREATE_PROJECT_DIALOG_PREFIX + 'MOVE_PROJECT',
  props<{project?: string; new_location?: string; name: string; fromName: string; toName: string; projectName: string}>()
);
