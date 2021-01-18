import {USERS_ACTIONS} from '../../../app.constants';
import {createSelector} from '@ngrx/store';
import {
  removeWorkspace,
  setCurrentUser,
  setInviteUserLink,
  setActiveWorkspace,
  setWorkspace,
  setSelectedWorkspaceTab, setUserWorkspaces, setUserWorkspacesFromUser
} from '../actions/users.actions';
import {GetCurrentUserResponseUserObject} from '../../../business-logic/model/users/getCurrentUserResponseUserObject';
import {OrganizationCreateInviteResponse} from '../../../business-logic/model/organization/organizationCreateInviteResponse';
import {GetCurrentUserResponseUserObjectCompany} from '../../../business-logic/model/users/getCurrentUserResponseUserObjectCompany';
import {OrganizationGetUserCompaniesResponseCompanies} from '../../../business-logic/model/organization/organizationGetUserCompaniesResponseCompanies';

export interface UsersState {
  currentUser: GetCurrentUserResponseUserObject;
  termsOfUse: any;
  inviteLink: OrganizationCreateInviteResponse;


  inviteLinkId: string;
  activeWorkspace: GetCurrentUserResponseUserObjectCompany;
  selectedWorkspaceTab: GetCurrentUserResponseUserObjectCompany;
  workspaces: GetCurrentUserResponseUserObjectCompany[];
  userWorkspaces: OrganizationGetUserCompaniesResponseCompanies[];
}

const initUsers: UsersState = {
  currentUser: null,
  termsOfUse: null,
  inviteLink: null,
  inviteLinkId: null,
  activeWorkspace: null,
  selectedWorkspaceTab: null,
  workspaces: [],
  userWorkspaces: []
};

export const users = state => state.users as UsersState;

export const selectCurrentUser = createSelector(users, (state): GetCurrentUserResponseUserObject => state.currentUser);
export const selectWorkspaces = createSelector(users, (state): GetCurrentUserResponseUserObjectCompany[] => state.workspaces);
export const selectActiveWorkspace = createSelector(users, (state): GetCurrentUserResponseUserObjectCompany => state.activeWorkspace);
export const selectUserWorkspaces = createSelector(users, (state) => state.userWorkspaces);
export const selectSelectedWorkspaceTab = createSelector(users, (state) => state.selectedWorkspaceTab);
export const selectTermsOfUse = createSelector(users, state => state.termsOfUse);
export const selectInviteLink = createSelector(users, state => state.inviteLink);


export function usersReducer(state = initUsers, action) {

  switch (action.type) {
    case USERS_ACTIONS.FETCH_CURRENT_USER:
      return {...state};
    case setInviteUserLink.type:
      return {...state, inviteLink:{id: action.id, allocated_users: action.allocated_users, allowed_users: action.allowed_users}};
    case setCurrentUser.type: {
      const lastWorkspace = window.localStorage.getItem('lastWorkspace');
      window.localStorage.removeItem('lastWorkspace');
      const workspaces = action.user? [action.user.company, ...(action.user?.companies || [])] : [];
      const activeWorkspace = workspaces.find(workspace => workspace.id === lastWorkspace);
      const altWorkspace = workspaces.find(workspace => workspace.id === state.activeWorkspace?.id);
      return {
        ...state,
        currentUser: action.user,
        termsOfUse: action.terms_of_use,
        workspaces: workspaces,
        activeWorkspace: activeWorkspace || altWorkspace || action.user?.company
      };
    }
    case USERS_ACTIONS.LOGOUT:
      return {
        ...state,
        currentUser: null
      };
    case setWorkspace.type: {
      const workspace = (action as ReturnType<typeof setWorkspace>).workspace;
      return {...state,
        workspaces: [...state.workspaces, ...(!state.workspaces.find(ws => ws.id === workspace.id) ? [action.workspace] : [])],
        activeWorkspace: action.workspace
      };
    }
    case setActiveWorkspace.type:
      return {...state, activeWorkspace: action.workspace};
    case setSelectedWorkspaceTab.type:
      return {...state, selectedWorkspaceTab: action.workspace};
    case removeWorkspace.type: {
      const workspaceId = (action as ReturnType<typeof removeWorkspace>).workspaceId;
      const workspaces = state.workspaces.filter(ws => ws.id !== workspaceId);
      return {
        ...state,
        ...(workspaceId === state.activeWorkspace.id && {activeWorkspace: workspaces[0]}),
        workspaces,
        userWorkspaces: state.userWorkspaces.filter(ws => ws.id !== workspaceId)
      };
    }
    case setUserWorkspaces.type:
      return {...state, userWorkspaces: (action as ReturnType<typeof setUserWorkspaces>).workspaces};
    case setUserWorkspacesFromUser.type:
      return {...state, ...(state.currentUser?.company && {userWorkspaces: [state.currentUser?.company]})};
    default:
      return state;
  }
}
