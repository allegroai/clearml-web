import {createSelector, on, ReducerTypes} from '@ngrx/store';
import {
  setInviteUserLink,
  logout,
  setFilterByUser,
  termsOfUseAccepted,
  setApiVersion,
  fetchCurrentUser,
  setCurrentUserName
} from '../actions/users.actions';
import {GetCurrentUserResponseUserObject} from '../../../business-logic/model/users/getCurrentUserResponseUserObject';
import {OrganizationCreateInviteResponse} from '../../../business-logic/model/organization/organizationCreateInviteResponse';
import {UsersGetCurrentUserResponseTermsOfUse} from '../../../business-logic/model/users/usersGetCurrentUserResponseTermsOfUse';
import {GetCurrentUserResponseUserObjectCompany} from '../../../business-logic/model/users/getCurrentUserResponseUserObjectCompany';
import {OrganizationGetUserCompaniesResponseCompanies} from '../../../business-logic/model/organization/organizationGetUserCompaniesResponseCompanies';

export interface UsersState {
  currentUser: GetCurrentUserResponseUserObject;
  activeWorkspace: GetCurrentUserResponseUserObjectCompany;
  userWorkspaces: OrganizationGetUserCompaniesResponseCompanies[];
  selectedWorkspaceTab: GetCurrentUserResponseUserObjectCompany;
  workspaces: GetCurrentUserResponseUserObjectCompany[];
  termsOfUse: UsersGetCurrentUserResponseTermsOfUse;
  inviteLink: OrganizationCreateInviteResponse;
  inviteLinkId: string;
  showOnlyUserWork: boolean;
  serverVersions: { server: string; api: string };
}

export const initUsers: UsersState = {
  currentUser: null,
  activeWorkspace: null,
  userWorkspaces: [],
  selectedWorkspaceTab: null,
  workspaces: [],
  termsOfUse: null,
  inviteLink: null,
  inviteLinkId: null,
  showOnlyUserWork: false,
  serverVersions: null
};

export const users = state => state.users as UsersState;

export const selectCurrentUser = createSelector(users, (state): GetCurrentUserResponseUserObject => state.currentUser);
export const selectActiveWorkspace = createSelector(users, (state): GetCurrentUserResponseUserObjectCompany => state.activeWorkspace);
export const selectUserWorkspaces = createSelector(users, (state) => state.userWorkspaces);
export const selectSelectedWorkspaceTab = createSelector(users, (state) => state.selectedWorkspaceTab);
export const selectWorkspaces = createSelector(users, (state): GetCurrentUserResponseUserObjectCompany[] => state.workspaces);
export const selectTermsOfUse = createSelector(users, state => state.termsOfUse);
export const selectInviteLink = createSelector(users, state => state.inviteLink);
export const selectShowOnlyUserWork = createSelector(users, (state): boolean => state.showOnlyUserWork);
export const selectServerVersions = createSelector(users, (state): { server: string; api: string } => state.serverVersions);

export const usersReducerFunctions = [
  on(fetchCurrentUser, state => ({...state})),
  on(setInviteUserLink, (state, action) => ({
    ...state,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    inviteLink: {id: action.id, allocated_users: action.allocated_users, allowed_users: action.allowed_users}
  })),
  on(setCurrentUserName, (state, action) => ({
    ...state,
    currentUser: {...state.currentUser, name: action.name}
  })),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  on(termsOfUseAccepted, state => ({...state, termsOfUse: {...state.termsOfUse, accept_required: false}})),
  on(logout, state => ({
    ...state,
    currentUser: null
  })),
  on(setFilterByUser, (state, action) => ({...state, showOnlyUserWork: action.showOnlyUserWork})),
  on(setApiVersion, (state, action) => ({...state, serverVersions: action.serverVersions}))
] as ReducerTypes<UsersState, any>[];
