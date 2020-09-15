import {HTTP, HTTP_ACTIONS, VIEW_ACTIONS} from '../../../app.constants';
import {createSelector} from '@ngrx/store';
import {get} from 'lodash/fp';
import {setScaleFactor} from '../actions/layout.actions';

export interface ViewState {
  loading: {[endpoint: string]: boolean};
  dialog: boolean;
  notification: {title: string; message: string};
  resultMessage: string;
  loggedOut: boolean;
  backdropActive: boolean;
  autoRefresh: boolean;
  compareAutoRefresh: boolean;
  applicationVisible: boolean;
  scaleFactor: number;
}

export const initViewState: ViewState = {
  loading: {},
  dialog: false,

  notification:  null,
  resultMessage: null,
  loggedOut: false,
  backdropActive: false,
  autoRefresh: true,
  compareAutoRefresh: false,
  applicationVisible: true,
  scaleFactor: 100
};

export const views = state => state.views as ViewState;
export const selectLoading = createSelector(views, state => state.loading);
export const selectBackdropActive = createSelector(views, state => state.backdropActive);

export const selectNotification = createSelector(views, state => state.notification);

export const selectLoggedOut = createSelector(views, state => state.loggedOut);
export const selectResultMessage = createSelector(views, state => state.resultMessage);
export const selectAutoRefresh = createSelector(views, state => state && state.autoRefresh);
export const selectCompareAutoRefresh = createSelector(views, state => state.compareAutoRefresh);
export const selectAppVisible = createSelector(views, state => state.applicationVisible);
export const selectScaleFactor = createSelector(views, state => state.scaleFactor);


export function viewReducer(viewState: ViewState = initViewState, action) {

  switch (action.type) {
    case HTTP_ACTIONS.REQUEST_FAILED:
      const isLoggedOut = action.payload.err && action.payload.err.status === 401;
      return {...viewState, loggedOut: isLoggedOut};
    case VIEW_ACTIONS.DEACTIVE_LOADER:
      return {
        ...viewState,
        loading: {...viewState.loading, [action.payload.endpoint]: false}
      };
    case VIEW_ACTIONS.ACTIVE_LOADER:
      return {
        ...viewState,
        loading: {...viewState.loading, [action.payload.endpoint]: true}
      };
    case VIEW_ACTIONS.VISIBILITY_CHANGED:
      return {...viewState, applicationVisible: action.visible};
    case setScaleFactor.type:
      return {...viewState, scaleFactor: action.scale};
    case VIEW_ACTIONS.RESET_LOADER:
      return {...viewState, loading: {}};
    case HTTP.API_REQUEST_SUCCESS:
      return {
        ...viewState,
        loading: {...viewState.loading, [get('payload.endpoint', action) ? action.payload.endpoint : 'default']: false}
      };

    case HTTP.API_REQUEST:
      return {
        ...viewState,
        loading: {...viewState.loading, [get('payload.endpoint', action) ? action.payload.endpoint : 'default']: true}
      };

    case VIEW_ACTIONS.SET_NOTIFICATION_DIALOG:
      return {...viewState, notification: action.payload};
    case VIEW_ACTIONS.SET_BACKDROP:
      return {...viewState, backdropActive: action.payload};
    case VIEW_ACTIONS.SET_AUTO_REFRESH:
      return {...viewState, autoRefresh: action.payload.autoRefresh};
    case VIEW_ACTIONS.SET_COMPARE_AUTO_REFRESH:
      return {...viewState, compareAutoRefresh: action.payload.autoRefresh};
    default:
      return viewState;
  }
}
