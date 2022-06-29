import {createReducer, createSelector, on} from '@ngrx/store';

import {initUsers, users, usersReducerFunctions, UsersState} from '@common/core/reducers/users-reducer';
import {setCurrentUser} from '../actions/users.action';
import {of} from 'rxjs';

export const selectHasDataFeature = createSelector(users, state => false);
export const selectHasUserManagement = createSelector(users, () => false);

export const usersReducer = createReducer<UsersState>(initUsers,
  ...usersReducerFunctions,
  on(setCurrentUser, (state, action) => ({
    ...state,
    currentUser: action.user,
    gettingStarted: action.getting_started,
    activeWorkspace: action.user?.company,
    userWorkspaces: [action.user?.company],
  }))
);

export const selectFeatures = createSelector(users, (state) => []);
// eslint-disable-next-line @typescript-eslint/naming-convention
export const selectTermsOfUse = createSelector(users, state => ({accept_required: null}));
export const selectInvitesPending = createSelector(users, state => []);
export const userAllowedToCreateQueue$ = store => of(true);
