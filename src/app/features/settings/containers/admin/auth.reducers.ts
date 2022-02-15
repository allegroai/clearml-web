import {commonAuthReducer, initAuth} from '@common/core/reducers/common-auth-reducer';
import {createReducer} from '@ngrx/store';

export const authReducer = createReducer(
  initAuth,
  ...commonAuthReducer
);
