import {USERS_ACTIONS} from '../../../app.constants';
import {createSelector} from '@ngrx/store';

export interface IUsersState {
  currentUser: string;
  termsOfUse: boolean;
}

const initUsers: IUsersState = {
  currentUser: null,
  termsOfUse : null,
};

export const users = state => state.users;

export const selectCurrentUser = createSelector(users, state => state.currentUser);
export const selectTermsOfUse  = createSelector(users, state => state.termsOfUse);

export function usersReducer(state = initUsers, action) {

  switch (action.type) {
    case USERS_ACTIONS.FETCH_CURRENT_USER:
      return {...state};
    case USERS_ACTIONS.SET_CURRENT_USER:
      return {
        ...state,
        currentUser: action.payload.user,
        termsOfUse: action.payload.terms_of_use
      };
    case USERS_ACTIONS.LOGOUT:
      return {
        ...state,
        currentUser: null
      };
    default:
      return state;
  }
}
