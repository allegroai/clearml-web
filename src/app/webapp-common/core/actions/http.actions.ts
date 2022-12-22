import {HTTP_PREFIX} from '~/app.constants';
import {HttpErrorResponse} from '@angular/common/http';
import {createAction, props} from '@ngrx/store';

export const requestFailed = createAction(
  HTTP_PREFIX + 'REQUEST_FAILED',
  (err: HttpErrorResponse) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {headers, ...others} = err;
    return {err: {...others, error: {meta: others.error?.meta}}};
  }
);

export const apiRequest = createAction(
  HTTP_PREFIX + 'API Request',
  props<{method: string; endpoint: string; success: string}>()
);
