import {MessageSeverityEnum, VIEW_ACTIONS, VIEW_PREFIX} from '../../../app.constants';
import {Action, createAction, props} from '@ngrx/store';
import {omit} from 'lodash/fp';

export class SetAutoRefresh {
  public type = VIEW_ACTIONS.SET_AUTO_REFRESH;
  public payload: { autoRefresh: boolean };

  constructor(autoRefresh: boolean) {
    this.payload = {autoRefresh};
  }
}

export class SetCompareAutoRefresh {
  public type = VIEW_ACTIONS.SET_COMPARE_AUTO_REFRESH;
  public payload: { autoRefresh: boolean };

  constructor(autoRefresh: boolean) {
    this.payload = {autoRefresh};
  }
}
export class SetServerError {
  public type = VIEW_ACTIONS.SET_SERVER_ERROR;
  public payload: {
    serverError: any;
    contextSubCode?: number;
    customMessage?: string;
    aggregateSimilar: boolean;
  };

  constructor(serverError: any, contextSubCode?: number, customMessage?: string, aggregateSimilar = false) {
    this.payload = {serverError: omit(['headers'], serverError), contextSubCode, customMessage, aggregateSimilar};
  }
}

export class SetNotificationDialog {
  public type = VIEW_ACTIONS.SET_NOTIFICATION_DIALOG;
  public payload: { message: string; title: string };

  constructor(payload: { message: string; title: string }) {
    this.payload = payload;
  }
}

export class ResetLoader implements Action {
  readonly type = VIEW_ACTIONS.RESET_LOADER;

  constructor() {
  }
}

export class SetBackdrop implements Action {
  readonly type = VIEW_ACTIONS.SET_BACKDROP;

  constructor(public payload: boolean) {
  }
}

export class ActiveLoader {
  type = VIEW_ACTIONS.ACTIVE_LOADER;
  public payload: any;

  constructor(endpoint = 'default') {
    this.payload = {endpoint};
  }
}

export class DeactiveLoader {
  type = VIEW_ACTIONS.DEACTIVE_LOADER;
  public payload: any;

  constructor(endpoint = 'default') {
    this.payload = {endpoint};
  }
}

export class VisibilityChanged {
  type = VIEW_ACTIONS.VISIBILITY_CHANGED;

  constructor(public visible: boolean) {}
}

export class AddMessage implements Action {
  readonly type = VIEW_ACTIONS.ADD_MESSAGE;
  public payload: {
    severity: string;
    msg: string;
    userActions?: {actions: any[]; name: string}[];
  };

  constructor(severity: MessageSeverityEnum, msg: string, userActions?: {actions: any[]; name: string}[]) {
    this.payload = {severity, msg, userActions};
  }
}

export const setServerUpdatesAvailable = createAction(
  VIEW_ACTIONS.SET_SERVER_UPDATES_AVAILABLE,
  props<{availableUpdates}>()
);

export const setScaleFactor = createAction(
  VIEW_ACTIONS + '[set scale]',
  props<{scale: number}>()
);

export const neverShowPopupAgain = createAction(VIEW_PREFIX + 'NEVER_SHOW_POPUP_AGAIN', props<{ popupId: string; reset?: boolean }>());

export const plotlyReady = createAction(VIEW_ACTIONS + '[plotly ready]');
