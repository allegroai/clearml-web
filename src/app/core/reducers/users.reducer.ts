import {createReducer, createSelector, on} from '@ngrx/store';

import {initUsers, users, usersReducerFunctions, UsersState} from '@common/core/reducers/users-reducer';
import {setCurrentUser} from '../actions/users.action';

export const selectHasDataFeature = createSelector(users, () => false);
export const selectHasUserManagement = createSelector(users, () => false);

export const usersReducer = createReducer<UsersState>(initUsers,
  ...usersReducerFunctions,
  on(setCurrentUser, (state, action) => ({
    ...state,
    currentUser: action.user,
    activeWorkspace: action.user?.company,
    userWorkspaces: [action.user?.company],
  }))
);

export const selectFeatures = createSelector(users, () => []);
// eslint-disable-next-line @typescript-eslint/naming-convention
export const selectTermsOfUse = createSelector(users, () => ({accept_required: null}));
export const selectInvitesPending = createSelector(users, () => []);
