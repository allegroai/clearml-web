import {createAction, props} from '@ngrx/store';
import {USERS_PREFIX} from '~/app.constants';
import {GetCurrentUserResponseUserObject} from '~/business-logic/model/users/getCurrentUserResponseUserObject';
import {UsersGetCurrentUserResponseSettings} from "~/business-logic/model/users/usersGetCurrentUserResponseSettings";

export interface GettingStarted {
  agentName: string;
  configure: string;
  install: string;
  packageName: string;
}

  export const setCurrentUser = createAction(USERS_PREFIX + 'SET_CURRENT_USER',
  props<{user?: GetCurrentUserResponseUserObject; gettingStarted?: GettingStarted; settings?: UsersGetCurrentUserResponseSettings}>()
);

export const resetCurrentUser = createAction(USERS_PREFIX + 'Reset Current User');
