import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import {combineLatest, Observable} from 'rxjs';
import {ConfigurationService} from '../services/configuration.service';
import {filter, map} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import {selectCurrentUser} from '../../core/reducers/users-reducer';

@Injectable({
  providedIn: 'root'
})
export class AccountAdministrationGuard implements CanActivate {
  constructor(private configService: ConfigurationService,
    private store: Store<any>) {
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return combineLatest([
      this.configService.globalEnvironmentObservable,
      this.store.select(selectCurrentUser).pipe(filter(user => !!user))
    ]).pipe(
      map( ([env, currentUser]) => env.accountAdministration && currentUser.role === 'admin')
    );
  }
}
