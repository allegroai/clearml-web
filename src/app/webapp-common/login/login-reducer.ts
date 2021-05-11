import {createSelector} from '@ngrx/store';
import {setLoginError, setTOU, setUserLoginState} from './login.actions';
import {SignupInfo} from '../../business-logic/model/login/signupInfo';

export interface UsersState {
  userInfo: SignupInfo;
  inviteId: string;
  error: string;
  validateEmail: {email: string; resendUrl: string};
  terms: string;
  crmForm: any;
}

const initLogin: UsersState = {
  userInfo: null,
  inviteId: null,
  error: null,
  validateEmail: null,
  // validateEmail: {
  //   'email':'auth0_test@allegro.ai',
  //   'resendUrl':'https://dev-allegro.eu.auth0.com/authorize?scope=openid+profile+email&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A4300%2Fcallback_auth0&audience=https%3A%2F%2Fdev-allegro.eu.auth0.com%2Fapi%2Fv2%2F&state=resend_verification_email%2F%3Fsignup%3D&client_id=eBzG7h6oOqpK79mr8kqW8f7e9yWVmcgm'
  // },
  terms: '',
  crmForm: null
};

export const login = state => state.login as UsersState;

export const selectUserInfo = createSelector(login, state => state.userInfo);
export const selectInviteId = createSelector(login, state => state?.inviteId);
export const selectLoginError = createSelector(login, state => state?.error);
export const selectValidateEmail = createSelector(login, state => state?.validateEmail);
export const selectTerms = createSelector(login, state => state.terms);
export const selectCrmForm = createSelector(login, state => state.crmForm);

export function loginReducer(state = initLogin, action) {

  switch (action.type) {
    case setUserLoginState.type:
      return {...state, userInfo: action.user, inviteId: action.inviteId || null, crmForm: action.crmForm};
    case setLoginError.type:
      return {
        ...state,
        error: (action as ReturnType<typeof setLoginError>).error,
        validateEmail: (action as ReturnType<typeof setLoginError>).verifyEmail
      };
    case setTOU.type:
      return {...state, terms: action.terms};
    default:
      return state;
  }
}
