import {createReducer, createSelector, on, ReducerTypes} from '@ngrx/store';
import {setTOU} from './login.actions';

export interface LoginState {
  inviteId: string;
  error: string;

  terms: string;
  crmForm: any;
}

export const initLogin: LoginState = {
  inviteId: null,
  error: null,
  terms: '',
  crmForm: null
};

export const login = state => state.login as LoginState;

export const selectInviteId = createSelector(login, state => state?.inviteId);
export const selectLoginError = createSelector(login, state => state?.error);
export const selectTerms = createSelector(login, state => state.terms);
export const selectCrmForm = createSelector(login, state => state.crmForm);

export const loginReducers = [
  on(setTOU, (state, action) => ({...state, terms: action.terms})),
] as ReducerTypes<LoginState, any>[];
