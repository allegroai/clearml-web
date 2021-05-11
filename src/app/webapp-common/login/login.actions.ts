import {createAction, props} from '@ngrx/store';
import {User} from '../../business-logic/model/users/user';


export const setUserLoginState = createAction(
  '[login] set user login state',
  props<{ user: User; inviteId: string; crmForm: any }>()
);

export const setLoginError = createAction(
  '[login] set login error',
  props<{error: string; verifyEmail?: {email: string; resendUrl: string}}>()
);

export const getTOU = createAction('[login] get TOU');

export const setTOU = createAction(
  '[login] set TOU',
  props<{terms: string}>()
);
