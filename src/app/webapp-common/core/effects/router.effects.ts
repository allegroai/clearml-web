import {Injectable} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {uniq} from 'lodash/fp';
import {map, tap} from 'rxjs/operators';
import {NAVIGATION_ACTIONS} from '~/app.constants';
import {encodeFilters, encodeOrder} from '../../shared/utils/tableParamEncode';
import {NavigateTo, NavigationEnd, SetRouterSegments, setURLParams} from '../actions/router.actions';


@Injectable()
export class RouterEffects {

  constructor(
    private actions$: Actions, private router: Router,
    private route: ActivatedRoute
  ) {
  }

  // TODO: (itay) remove after delete old pages.
  activeLoader = createEffect(() => this.actions$.pipe(
    ofType<NavigateTo>(NAVIGATION_ACTIONS.NAVIGATE_TO),
    tap(action => {
      (!action.payload.params || !action.payload.url) ?
        this.router.navigateByUrl(action.payload.url, /* Removed unsupported properties by Angular migration: queryParams. */ {}) :
        this.router.navigate([action.payload.url, action.payload.params], {queryParams: {unGuard: action.payload.unGuard}});
    })
  ), {dispatch: false});

  routerNavigationEnd = createEffect(() => this.actions$.pipe(
    ofType<NavigationEnd>(NAVIGATION_ACTIONS.NAVIGATION_END),
    map(() => new SetRouterSegments({url: this.getRouterUrl(), params: this.getRouterParams(), config: this.getRouterConfig(), queryParams: this.route.snapshot.queryParams}))
  ));

  setTableParams = createEffect(() => this.actions$.pipe(
    ofType(setURLParams),
    map((action) => {
      const firstUpdate = !this.route.snapshot.queryParams.order;
      this.router.navigate(
        [],
        {
          relativeTo: this.route,
          replaceUrl: firstUpdate,
          queryParamsHandling: action.update ? 'merge' : '',
          queryParams: {
            ...(action.columns && {columns: uniq(action.columns)}),
            ...(action.orders && {order: encodeOrder(action.orders)}),
            ...(action.filters && {filter: encodeFilters(action.filters)}),
            ...(action.isArchived && {archive:  true}),
            ...(action.isDeep && {deep:  true})
          }
        });
    })
  ), {dispatch: false});

  getRouterParams(): Params {
    let route = this.route.snapshot.firstChild;
    let params: Params = {};

    while (route) {
      params = {...params, ...route.params};
      route = route.firstChild;
    }
    return params;
  }

  getRouterConfig(): string[] {
    let route = this.route.snapshot.firstChild;
    let config = [];

    while (route) {
      const path = route.routeConfig.path.split('/').filter((item) => !!item);
      config = config.concat(path);
      route = route.firstChild;
    }
    return config;
  }

  getRouterUrl(): string {
    return this.router.url;
  }
}

