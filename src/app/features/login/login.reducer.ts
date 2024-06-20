import {createReducer, on} from '@ngrx/store';
import {initCommonLoginState, loginReducers, CommonLoginState} from '@common/login/login-reducer';
import {setLoginError} from '~/features/login/login.actions';


export const login = state => state.login as CommonLoginState;

export const loginReducer = createReducer(
  initCommonLoginState,
  on(setLoginError, (state, action): CommonLoginState => ({...state,error: action.error})),
  ...loginReducers
);
