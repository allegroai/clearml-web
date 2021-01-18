import {createSelector} from '@ngrx/store';
import {setLoginError, setTOU, setUserLoginState} from './login.actions';
import {SignupInfo} from '../../business-logic/model/login/signupInfo';

export interface UsersState {
  userInfo: SignupInfo;
  inviteId: string;
  error: string;
  terms: string;
  crmForm: any;
}

const initLogin: UsersState = {
  userInfo: null,
  inviteId: null,
  error: null,
  terms: '',
  crmForm: null
};

export const login = state => state.login;

export const selectUserInfo = createSelector(login, (state): SignupInfo => state.userInfo);
export const selectInviteId = createSelector(login, (state): string => state.inviteId);
export const selectLoginError = createSelector(login, (state): string => state.error);
export const selectTerms = createSelector(login, (state): string => state.terms);
export const selectCrmForm = createSelector(login, (state): any => state.crmForm);

export function loginReducer(state = initLogin, action) {

  switch (action.type) {
    case setUserLoginState.type:
      return {...state, userInfo: action.user, inviteId: action.inviteId || null, crmForm: action.crmForm};
    case setLoginError.type:
      return {...state, error: action.error};
    case setTOU.type:
      return {...state, terms: action.terms};
    default:
      return state;
  }
}
