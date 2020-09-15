import {USERS_ACTIONS} from '../../../app.constants';
import {createSelector} from '@ngrx/store';
import {setCurrentUser} from '../actions/users.actions';

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
    case setCurrentUser.type:
      return {
        ...state,
        currentUser: action.user,
        termsOfUse: action.terms_of_use
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
