import {ActionCreator, createSelector, on, ReducerTypes} from '@ngrx/store';
import {setTOU} from './login.actions';

export interface CommonLoginState {
  inviteId: string;
  error: string;
  terms: string;
}

export const initCommonLoginState: CommonLoginState = {
  inviteId: null,
  error: null,
  terms: '',
};

export const login = state => state.login as CommonLoginState;

export const selectInviteId = createSelector(login, state => state?.inviteId);
export const selectLoginError = createSelector(login, state => state?.error);
export const selectTerms = createSelector(login, state => state.terms);

export const loginReducers = [
  on(setTOU, (state, action):CommonLoginState => ({...state, terms: action.terms})),
] as ReducerTypes<CommonLoginState, ActionCreator[]>[];
