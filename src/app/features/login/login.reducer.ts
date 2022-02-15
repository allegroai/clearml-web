import {createReducer, on} from '@ngrx/store';
import {initLogin, loginReducers, LoginState as CommonLoginState} from '../../webapp-common/login/login-reducer';
import {setLoginError} from '~/features/login/login.actions';


export const login = state => state.login as CommonLoginState;

export const loginReducer = createReducer(
  initLogin,
  on(setLoginError, (state, action) => ({...state,error: action.error})),
  ...loginReducers
);
