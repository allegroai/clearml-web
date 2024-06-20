import {CreationStatusEnum} from './project-dialog.reducer';
import {ProjectsCreateRequest} from '~/business-logic/model/projects/projectsCreateRequest';
import {createAction, props} from '@ngrx/store';

export const resetState = createAction('[CREATE_PROJECT_DIALOG] RESET_STATE');
export const createNewProject = createAction('[CREATE_PROJECT_DIALOG] CREATE_NEW_PROJECT', props<{req: ProjectsCreateRequest; dialogId: string}>());
export const navigateToNewProject = createAction('[CREATE_PROJECT_DIALOG] NAVIGATE_TO_NEW_PROJECT', props<{id: string}>());
export const setCreationStatus = createAction('[CREATE_PROJECT_DIALOG] SET_CREATION_STATUS', props<{status: CreationStatusEnum}>());
export const moveProject = createAction(
  '[CREATE_PROJECT_DIALOG] MOVE_PROJECT',
  props<{project?: string; new_location?: string; name: string; fromName: string; toName: string; projectName: string; dialogId: string}>()
);
