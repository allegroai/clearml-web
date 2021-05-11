import {Injectable} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {uniq} from 'lodash/fp';
import {map, tap} from 'rxjs/operators';
import {NAVIGATION_ACTIONS} from '../../../app.constants';
import {encodeFilters, encodeOrder} from '../../shared/utils/tableParamEncode';
import {NavigateTo, NavigationEnd, SetRouterSegments, setURLParams} from '../actions/router.actions';


@Injectable()
export class RouterEffects {

  constructor(
    private actions$: Actions, private router: Router,
    private route: ActivatedRoute, private store: Store<any>
  ) {
  }

  // TODO: (itay) remove after delete old pages.
  @Effect({dispatch: false})
  activeLoader = this.actions$.pipe(
    ofType<NavigateTo>(NAVIGATION_ACTIONS.NAVIGATE_TO),
    tap(action => {
      (!action.payload.params || !action.payload.url) ?
        this.router.navigateByUrl(action.payload.url, /* Removed unsupported properties by Angular migration: queryParams. */ {}) :
        this.router.navigate([action.payload.url, action.payload.params], {queryParams: <any>{unGuard: action.payload.unGuard}});
    })
  );

  @Effect()
  routerNavigationEnd = this.actions$.pipe(
    ofType<NavigationEnd>(NAVIGATION_ACTIONS.NAVIGATION_END),
    map(() => new SetRouterSegments({url: this.getRouterUrl(), params: this.getRouterParams(), config: this.getRouterConfig(), queryParams: this.route.snapshot.queryParams}))
  );

  @Effect({dispatch: false})
  setTableParams = this.actions$.pipe(
    ofType(setURLParams),
    map((action) => {
      const firstUpdate = !this.route.snapshot.queryParams.order;
      const filterStr = encodeFilters(action.filters);
      this.router.navigate(
        [],
        {
          relativeTo: this.route,
          replaceUrl: firstUpdate,
          queryParams: {
            columns: uniq(action.columns),
            order: encodeOrder(action.orders),
            filter: filterStr ? filterStr : undefined,
            archive: action.isArchived ? true : undefined,
            deep: action.isDeep ? true : undefined
          }
        });
    })
  );

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

