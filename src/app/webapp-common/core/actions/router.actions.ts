import {NAVIGATION_PREFIX} from '~/app.constants';
import {createAction, props} from '@ngrx/store';
import {Params} from '@angular/router';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {SortMeta} from 'primeng/api';
import {CrumbTypeEnum, IBreadcrumbsLink} from '@common/layout/breadcrumbs/breadcrumbs.component';

export const BREADCRUMBS_PREFIX = 'BREADCRUMBS_';


export const navigationEnd = createAction(NAVIGATION_PREFIX + 'NAVIGATION_END');

export const setRouterSegments = createAction(
  NAVIGATION_PREFIX + 'SET_ROUTER_SEGMENT',
  props<{
    url: string;
    params: Params;
    queryParams: Params;
    config: string[];
    data: any;
  }>()
);

export const setURLParams = createAction(
  NAVIGATION_PREFIX + 'SET_URL_PARAMS',
  props<{
    columns?: string[];
    orders?: SortMeta[];
    filters?: { [key: string]: FilterMetadata };
    isArchived?: boolean;
    isDeep?: boolean;
    update?: boolean;
    version?: string;
  }>()
);

export const setBreadcrumbs = createAction(
  BREADCRUMBS_PREFIX + 'SET_BREADCRUMBS',
  props<{ breadcrumbs: IBreadcrumbsLink[][]}>()
);

export const setTypeBreadcrumbs = createAction(
  BREADCRUMBS_PREFIX + 'SET_TYPE_BREADCRUMBS',
  props<{ breadcrumb: IBreadcrumbsLink; type?: CrumbTypeEnum }>()
);

