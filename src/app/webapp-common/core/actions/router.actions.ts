import {ISmAction} from '../models/actions';
import {NAVIGATION_PREFIX, NAVIGATION_ACTIONS} from '../../../app.constants';
import {Action, createAction, props} from '@ngrx/store';
import {Params} from '@angular/router';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {SortMeta} from 'primeng/api';


// TODO: remove this action...
export class NavigateTo implements ISmAction {
  readonly type = NAVIGATION_ACTIONS.NAVIGATE_TO;

  constructor(public payload: {
    url: string;
    params?: Params;
    unGuard?: boolean;
  }) {}
}

export class NavigationEnd implements Action {
  readonly type = NAVIGATION_ACTIONS.NAVIGATION_END;
}

export class SetRouterSegments implements Action {
  readonly type = NAVIGATION_ACTIONS.SET_ROUTER_SEGMENT;

  constructor(public payload: {
    url: string;
    params: Params;
    queryParams: Params;
    config: string[];
  }) {}
}

export const setURLParams = createAction(
  NAVIGATION_PREFIX + 'SET_URL_PARAMS',
  props<{
    columns?: string[];
    orders: SortMeta[];
    filters?: { [key: string]: FilterMetadata };
    isArchived: boolean;
    isDeep?: boolean;
  }>()
);
