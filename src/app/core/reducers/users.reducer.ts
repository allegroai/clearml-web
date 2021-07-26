import {createReducer, createSelector, on} from '@ngrx/store';

import {initUsers, users, usersReducerFunctions, UsersState} from '../../webapp-common/core/reducers/users-reducer';
import {setCurrentUser} from '../actions/users.action';

export const selectHasDataFeature = createSelector(users, () => false);
export const selectHasUserManagement = createSelector(users, () => false);

export const usersReducer = createReducer<UsersState>(initUsers,
  ...usersReducerFunctions,
  on(setCurrentUser, (state, action) => ({
    ...state,
    currentUser: action.user,
    activeWorkspace: action.user.company,
    userWorkspaces: [action.user.company],
    termsOfUse: action.terms_of_use,
  }))
);
