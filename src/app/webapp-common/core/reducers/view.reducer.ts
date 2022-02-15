import {createReducer, createSelector, on, ReducerTypes} from '@ngrx/store';
import * as layoutActions from '../actions/layout.actions';
import {apiRequest, requestFailed} from '@common/core/actions/http.actions';

export interface ViewState {
  loading: { [endpoint: string]: boolean };
  dialog: boolean;
  notification: { title: string; message: string };
  loggedOut: boolean;
  backdropActive: boolean;
  autoRefresh: boolean;
  compareAutoRefresh: boolean;
  applicationVisible: boolean;
  scaleFactor: number;
  firstLogin: boolean;
  firstLoginAt: number;
  neverShowPopupAgain: string[];
  plotlyReady: boolean;
  aceReady: boolean;
  preferencesReady: boolean;
}

export const initViewState: ViewState = {
  loading: {},
  dialog: false,

  notification: null,
  loggedOut: false,
  backdropActive: false,
  autoRefresh: true,
  compareAutoRefresh: false,
  applicationVisible: true,
  scaleFactor: 100,
  firstLogin: false,
  firstLoginAt: +(window?.localStorage?.getItem('firstLogin') || 0),
  neverShowPopupAgain: [],
  plotlyReady: false,
  aceReady: false,
  preferencesReady: false
};

export const views = state => state.views as ViewState;
export const selectReady = createSelector(views, state => state.preferencesReady);
export const selectLoading = createSelector(views, state => state.loading);
export const selectBackdropActive = createSelector(views, state => state.backdropActive);

export const selectNotification = createSelector(views, state => state.notification);

export const selectLoggedOut = createSelector(views, state => state.loggedOut);
export const selectAutoRefresh = createSelector(views, state => state && state.autoRefresh);
export const selectCompareAutoRefresh = createSelector(views, state => state.compareAutoRefresh);
export const selectAppVisible = createSelector(views, state => state.applicationVisible);
export const selectScaleFactor = createSelector(views, state => state.scaleFactor);
export const selectFirstLogin = createSelector(views, state => state.firstLogin);
export const selectFirstLoginAt = createSelector(views, state => state.firstLoginAt);
export const selectPlotlyReady = createSelector(views, state => state.plotlyReady);
export const selectAceReady = createSelector(views, state => state.aceReady);
export const selectNeverShowPopups = createSelector(views, (state): string[] => state.neverShowPopupAgain);


export const viewReducers = [
  on(requestFailed, (state, action) => {
    const isLoggedOut = action.err && action.err.status === 401;
    return {...state, loggedOut: isLoggedOut};
  }),
  on(layoutActions.deactivateLoader, (state, action) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {[action.endpoint]: removed, ...loading} = state.loading;
    return {...state, loading};
  }),
  on(layoutActions.activeLoader, (state, action) => ({
    ...state,
    loading: {...state.loading, [action.endpoint]: true}
  })),
  on(layoutActions.visibilityChanged, (state, action) => ({...state, applicationVisible: action.visible})),
  on(layoutActions.setScaleFactor, (state, action) => ({...state, scaleFactor: action.scale})),
  on(layoutActions.firstLogin, (state, action) => ({...state, firstLogin: action.first, firstLoginAt: new Date().getTime()})),
  on(layoutActions.plotlyReady, (state) => ({...state, plotlyReady: true})),
  on(layoutActions.aceReady, (state) => ({...state, aceReady: true})),
  on(layoutActions.resetLoader, (state) => ({...state, loading: {}})),
  on(apiRequest, (state, action) => ({
    ...state,
    loading: {...state.loading, [action?.endpoint || 'default']: true}
  })),
  on(layoutActions.setNotificationDialog, (state, action) => ({...state, notification: action.notification})),
  on(layoutActions.setBackdrop, (state, action) => ({...state, backdropActive: action.payload})),
  on(layoutActions.setAutoRefresh, (state, action) => ({...state, autoRefresh: action.autoRefresh})),
  on(layoutActions.setCompareAutoRefresh, (state, action) => ({...state, compareAutoRefresh: action.autoRefresh})),
  on(layoutActions.neverShowPopupAgain, (state, action) => ({
    ...state,
    neverShowPopupAgain: action.reset ? state.neverShowPopupAgain.filter(popups => popups !== action.popupId) : Array.from(new Set([...state.neverShowPopupAgain, action.popupId]))
  })),
] as ReducerTypes<ViewState, any>[];

export const viewReducer = createReducer(
  initViewState,
  ...viewReducers
);
