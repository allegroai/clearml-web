import {createAction, props} from '@ngrx/store';
import {PROJECTS_PREFIX} from '@common/core/actions/projects.actions';
import {CommonReadyForDeletion} from '@common/projects/common-projects.reducer';

export const setProjectReadyForDeletion= createAction(
  PROJECTS_PREFIX + 'SET_PROJECT_READY_FOR_DELETION',
  props<{readyForDeletion: CommonReadyForDeletion}>()
);
