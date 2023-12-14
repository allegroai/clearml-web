import {Injectable} from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {Store} from '@ngrx/store';

@Injectable({providedIn: 'root'})
export class RouterHelperGuard implements CanActivate {

  constructor(public router: Router, public store: Store<any>) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const viewMode = (route.url[0] && route.queryParams[route.url[0].path] || 'values').replace(/.*_/, '') || 'values'; // i.e: graph, min_values
    const defaultViewMode = route.url[1].path; // usually 'values'
    if (viewMode !== defaultViewMode) {
      this.router.navigateByUrl(state.url.replace(defaultViewMode, viewMode), /* Removed unsupported properties by Angular migration: queryParamsHandling. */ {});
      return false;
    }
    return true;
  }
}
