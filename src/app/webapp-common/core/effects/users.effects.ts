import {LocationStrategy} from '@angular/common';
import {inject, Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {ApiUsersService} from '~/business-logic/api-services/users.service';
import {
  getApiVersion,
  logout,
  logoutSuccess,
  setApiVersion, setCurrentUserName,
  setUserWorkspacesFromUser, updateCurrentUser
} from '../actions/users.actions';
import {catchError, filter, map, mergeMap} from 'rxjs/operators';
import {addMessage} from '../actions/layout.actions';
import {ApiLoginService} from '~/business-logic/api-services/login.service';
import {LoginLogoutResponse} from '~/business-logic/model/login/loginLogoutResponse';
import {ErrorService} from '../../shared/services/error.service';
import {ApiServerService} from '~/business-logic/api-services/server.service';
import {ServerInfoResponse} from '~/business-logic/model/server/serverInfoResponse';
import {UsersUpdateResponse} from '~/business-logic/model/users/usersUpdateResponse';
import {MESSAGES_SEVERITY} from '@common/constants';

@Injectable()
export class CommonUserEffects {
  private locationStrategy = inject(LocationStrategy);

  constructor(
    private actions: Actions, private userService: ApiUsersService,
    private router: Router, private loginApi: ApiLoginService,
    private serverService: ApiServerService,
     private errorService: ErrorService
  ) {
  }

  logoutFlow = createEffect(() => this.actions.pipe(
    ofType(logout),
    mergeMap(action => this.loginApi.loginLogout({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      redirect_url: window.location.origin + (this.locationStrategy.getBaseHref() === '/' ? '' : this.locationStrategy.getBaseHref()) + '/login',
      ...(action.provider && {provider: action.provider})
    }).pipe(
      map((res: LoginLogoutResponse) => {
        if (res.redirect_url) {
          window.location.href = res.redirect_url;
        } else {
          this.router.navigateByUrl('login');
        }
        return logoutSuccess();
      }),
      catchError(err => [addMessage(MESSAGES_SEVERITY.ERROR, `Logout Failed
${this.errorService.getErrorMsg(err?.error)}`)])
    )),
  ));

  getApiVersion = createEffect(() => this.actions.pipe(
    ofType(getApiVersion),
    mergeMap(() => this.serverService.serverInfo({})),
    map((res: ServerInfoResponse) =>
      setApiVersion({serverVersions: {server: `${res.version}-${res.build}`, api: res.api_version}})
    ),
    catchError(() => [setUserWorkspacesFromUser()])
  ));

  updateCurrentUser = createEffect(() => this.actions.pipe(
    ofType(updateCurrentUser),
    mergeMap(({user}) => this.userService.usersUpdate({...user}).pipe(
      filter((res: UsersUpdateResponse) => res.updated > 0),
      map(() => setCurrentUserName({name: user.name}))
    )),
    catchError(err => [addMessage(MESSAGES_SEVERITY.ERROR, `Update User Failed ${this.errorService.getErrorMsg(err?.error)}`)])
  ));
}

