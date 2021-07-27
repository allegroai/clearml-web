import {HTTP_PREFIX} from '../../../app.constants';
import {omit} from 'lodash/fp';
import {HttpErrorResponse} from '@angular/common/http';
import {createAction, props} from '@ngrx/store';

export const requestFailed = createAction(
  HTTP_PREFIX + 'REQUEST_FAILED',
  (err: HttpErrorResponse) => ({err: omit(['headers'], err)})
);

export const apiRequest = createAction(
  HTTP_PREFIX + 'API Request',
  props<{method: string; endpoint: string; success: string}>()
);
