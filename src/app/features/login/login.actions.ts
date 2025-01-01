import {createAction, props} from '@ngrx/store';

export const setLoginError = createAction(
  '[login] set login error',
  props<{ error: string; }>()
);
