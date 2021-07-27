import {createAction, props} from '@ngrx/store';
import {USERS_PREFIX} from '../../../app.constants';
import {OrganizationCreateInviteResponse} from '../../../business-logic/model/organization/organizationCreateInviteResponse';
import {GetCurrentUserResponseUserObjectCompany} from '../../../business-logic/model/users/getCurrentUserResponseUserObjectCompany';

export const fetchCurrentUser = createAction(USERS_PREFIX +'FETCH_USER');

export const setCurrentUserName = createAction(USERS_PREFIX + 'SET_CURRENT_USER_NAME',
  props<{name: string}>()
);
export const termsOfUseAccepted = createAction(USERS_PREFIX + '[TOS accepted]');

export const logout = createAction(USERS_PREFIX + 'LOGOUT', props<{provider?: string}>());
export const logoutSuccess = createAction(USERS_PREFIX + 'LOGOUT_SUCCESS');

export const setPreferences = createAction(USERS_PREFIX +'SET_PREF', props<{payload: any}>());
export const getInviteUserLink = createAction(USERS_PREFIX +'GET_INVITE_USER_LINK');
export const setInviteUserLink = createAction(USERS_PREFIX +'SET_INVITE_USER_LINK',
  props<OrganizationCreateInviteResponse>()
);

export const addWorkspace = createAction(USERS_PREFIX + ' add workspace', props<{inviteId: string}>());
export const setFilterByUser =  createAction(USERS_PREFIX +'SET_FILTERED_BY_USER', props<{showOnlyUserWork: boolean}>());
export const leaveWorkspace = createAction(
  USERS_PREFIX + ' leave workspace',
  props<{workspace: GetCurrentUserResponseUserObjectCompany}>()
);

export const setWorkspace = createAction(
  USERS_PREFIX + ' set workspace',
  props<{workspace: GetCurrentUserResponseUserObjectCompany}>()
);

export const setActiveWorkspace = createAction(
  USERS_PREFIX + ' set active workspace',
  props<{workspace: GetCurrentUserResponseUserObjectCompany}>()
);

export const setSelectedWorkspaceTab = createAction(
  USERS_PREFIX + ' set selected workspace tab',
  props<{workspace: GetCurrentUserResponseUserObjectCompany}>()
);

export const removeWorkspace = createAction(
  USERS_PREFIX + ' set selected workspace',
  props<{workspaceId: string}>()
);

export const getUserWorkspaces = createAction(USERS_PREFIX + ' get user workspaces');

export const setUserWorkspaces = createAction(
  USERS_PREFIX + ' set user workspaces',
  props<{workspaces: any[]}>()
);

export const setUserWorkspacesFromUser = createAction(USERS_PREFIX + ' set user workspaces from current user');

export const setAccountAdministrationPage = createAction(`${USERS_PREFIX} route to account-administration`  );
export const getApiVersion = createAction(`${USERS_PREFIX} get api version`  );
export const setApiVersion = createAction(`${USERS_PREFIX} set api version`, props<{serverVersions: {server: string; api: string}}>());

