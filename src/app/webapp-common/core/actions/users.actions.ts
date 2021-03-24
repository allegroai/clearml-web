import {Action, createAction, props} from '@ngrx/store';
import {USERS_ACTIONS, USERS_PREFIX} from '../../../app.constants';
import {User} from '../../../business-logic/model/users/user';
import {OrganizationCreateInviteResponse} from "../../../business-logic/model/organization/organizationCreateInviteResponse";
import {GetCurrentUserResponseUserObjectCompany} from '../../../business-logic/model/users/getCurrentUserResponseUserObjectCompany';


export class FetchCurrentUser implements Action {
  type = USERS_ACTIONS.FETCH_CURRENT_USER;

}

export const setCurrentUser = createAction(
  USERS_ACTIONS.SET_CURRENT_USER,
  props<{user: User; terms_of_use?: any}>()
);

export class Logout implements Action {
  type = USERS_ACTIONS.LOGOUT;
}

export class SetPreferences implements Action {
  type = USERS_ACTIONS.SET_PREF;

  constructor(public payload) {}
}

export const getInviteUserLink = createAction(USERS_PREFIX +'GET_INVITE_USER_LINK');
export const setInviteUserLink = createAction(USERS_PREFIX +'SET_INVITE_USER_LINK',
  props<OrganizationCreateInviteResponse>()
);

export const addWorkspace = createAction(
  '[login] add workspace',
  props<{inviteId: string}>()
);

export const leaveWorkspace = createAction(
  '[login] leave workspace',
  props<{workspace: GetCurrentUserResponseUserObjectCompany}>()
);

export const setWorkspace = createAction(
  '[users] set workspace',
  props<{workspace: GetCurrentUserResponseUserObjectCompany}>()
);

export const setActiveWorkspace = createAction(
  '[users] set active workspace',
  props<{workspace: GetCurrentUserResponseUserObjectCompany}>()
);

export const setSelectedWorkspaceTab = createAction(
  '[users] set selected workspace tab',
  props<{workspace: GetCurrentUserResponseUserObjectCompany}>()
);

export const removeWorkspace = createAction(
  '[users] set selected workspace',
  props<{workspaceId: string}>()
);

export const getUserWorkspaces = createAction('[login] get user workspaces');

export const setUserWorkspaces = createAction(
  '[users] set user workspaces',
  props<{workspaces: any[]}>()
);

export const setUserWorkspacesFromUser = createAction('[users] set user workspaces from current user');
