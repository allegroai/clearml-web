import {createSelector, Action} from '@ngrx/store';
import {NAVIGATION_ACTIONS} from '../../../app.constants';
import {SetRouterSegments} from '../actions/router.actions';
import {Params} from '@angular/router';

export interface RouterState {
  url: string;
  params: Params;
  queryParams: Params;
  config: string[];
  skipNextNavigation: boolean;
}

const initRouter = {
  url               : window.location.pathname,
  params            : null,
  queryParams       : null,
  config            : null,
  skipNextNavigation: false
};

export const selectRouter       = state => state.router as RouterState;
export const selectRouterUrl    = createSelector(selectRouter, router => router && router.url);
export const selectRouterParams = createSelector(selectRouter, router => router && router.params);
export const selectRouterQueryParams = createSelector(selectRouter, router => router && router.queryParams);
export const selectRouterConfig = createSelector(selectRouter, router => router && router.config);

export function routerReducer(state: RouterState = initRouter, action: Action): RouterState {
  switch (action.type) {
    case NAVIGATION_ACTIONS.SET_ROUTER_SEGMENT: {
      const payload = (action as SetRouterSegments).payload;
      return {...state, params: payload.params, queryParams: payload.queryParams,
        url: payload.url, config: payload.config};
    }
    default:
      return state;
  }

}
