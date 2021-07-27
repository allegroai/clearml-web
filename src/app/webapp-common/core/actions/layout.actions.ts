import {MessageSeverityEnum, VIEW_PREFIX} from '../../../app.constants';
import {createAction, props} from '@ngrx/store';
import {omit} from 'lodash/fp';
import {HttpErrorResponse} from '@angular/common/http';

export const setAutoRefresh = createAction(
  VIEW_PREFIX + '[set auto refresh]',
  props<{autoRefresh: boolean}>()
);

export const setCompareAutoRefresh = createAction(
  VIEW_PREFIX + '[set compare auto refresh]',
  props<{autoRefresh: boolean}>()
);

export const setServerError = createAction(
  VIEW_PREFIX + '[set server error]',
  (serverError: HttpErrorResponse, contextSubCode?: number, customMessage?: string, aggregateSimilar = false) => ({
    serverError: omit(['headers'], serverError) as Omit<HttpErrorResponse, 'headers'>,
    contextSubCode,
    customMessage,
    aggregateSimilar
  })
);

export const setNotificationDialog = createAction(
  VIEW_PREFIX + '[set notification dialog]',
  props<{message: string; title: string}>()
);

export const resetLoader = createAction(VIEW_PREFIX + '[reset loader]');

export const setBackdrop = createAction(
  VIEW_PREFIX + '[set backdrop]',
  props<{payload: boolean}>()
);

export const activeLoader = createAction(
  VIEW_PREFIX + '[activate loader]',
  (endpoint: string) => ({endpoint})
);

export const deactivateLoader = createAction(
  VIEW_PREFIX + '[deactivate loader]',
  (endpoint: string) => ({endpoint})
);


export const visibilityChanged = createAction(
  VIEW_PREFIX + '[visibility changed]',
  props<{visible: boolean}>()
);

export const addMessage = createAction(
  VIEW_PREFIX + '[add message]',
  (severity: MessageSeverityEnum, msg: string, userActions?: {actions: any[]; name: string}[]) =>
    ({severity, msg, userActions})
);

export const removeMessage = createAction(VIEW_PREFIX + '[remove message]');

export const setServerUpdatesAvailable = createAction(
  VIEW_PREFIX + '[set server updates available]',
  props<{availableUpdates}>()
);

export const setScaleFactor = createAction(
  VIEW_PREFIX + '[set scale]',
  props<{scale: number}>()
);

export const firstLogin = createAction(
  VIEW_PREFIX + '[set first Login]',
  props<{first: boolean}>()
);

export const neverShowPopupAgain = createAction(VIEW_PREFIX + 'NEVER_SHOW_POPUP_AGAIN', props<{ popupId: string; reset?: boolean }>());

export const plotlyReady = createAction(VIEW_PREFIX + '[plotly ready]');
