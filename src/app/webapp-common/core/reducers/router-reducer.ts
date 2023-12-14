import {createReducer, createSelector, on} from '@ngrx/store';
import {Params} from '@angular/router';
import {setRouterSegments} from '@common/core/actions/router.actions';

export interface RouterState {
  url: string;
  params: Params;
  queryParams: Params;
  config: string[];
  skipNextNavigation: boolean;
}

const initRouter: RouterState = {
  url: window.location.pathname,
  params: null,
  queryParams: null,
  config: null,
  skipNextNavigation: false,
};

export const selectRouter = state => state.router as RouterState;
export const selectRouterUrl = createSelector(selectRouter, router => router && router.url);
export const selectRouterParams = createSelector(selectRouter, router => router && router?.params);
export const selectRouterQueryParams = createSelector(selectRouter, router => router && router.queryParams);
export const selectRouterConfig = createSelector(selectRouter, router => router && router.config);

export const routerReducer = createReducer(initRouter,
  on(setRouterSegments, (state, action) => ({
    ...state, params: action.params, queryParams: action.queryParams,
    url: action.url, config: action.config
  })),
);
