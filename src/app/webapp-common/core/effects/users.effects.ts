import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {MESSAGES_SEVERITY} from '~/app.constants';
import {ApiUsersService} from '~/business-logic/api-services/users.service';
import {
  fetchCurrentUser,
  getApiVersion,
  logout,
  logoutSuccess,
  setApiVersion, setCurrentUserName,
  setUserWorkspacesFromUser, updateCurrentUser
} from '../actions/users.actions';
import {catchError, map, mergeMap, switchMap} from 'rxjs/operators';
import {requestFailed} from '../actions/http.actions';
import {addMessage} from '../actions/layout.actions';
import {ApiLoginService} from '~/business-logic/api-services/login.service';
import {LoginLogoutResponse} from '~/business-logic/model/login/loginLogoutResponse';
import {ErrorService} from '../../shared/services/error.service';
import {ApiServerService} from '~/business-logic/api-services/server.service';
import {ServerInfoResponse} from '~/business-logic/model/server/serverInfoResponse';
import {setCurrentUser} from '~/core/actions/users.action';
import {UsersUpdateResponse} from '~/business-logic/model/users/usersUpdateResponse';


@Injectable()
export class CommonUserEffects {

  constructor(
    private actions: Actions, private userService: ApiUsersService,
    private router: Router, private loginApi: ApiLoginService,
    private serverService: ApiServerService,
    private store: Store<any>, private errorService: ErrorService
  ) {
  }

  fetchUser$ = createEffect(() => this.actions.pipe(
    ofType(fetchCurrentUser),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    mergeMap(() => this.userService.usersGetCurrentUser({get_supported_features: true})
      .pipe(
        switchMap((res) => [setCurrentUser(res)]),
        catchError(error => [requestFailed(error)])
      )
    )
  ));

  logoutFlow = createEffect(() => this.actions.pipe(
    ofType(logout),
    mergeMap(action => this.loginApi.loginLogout({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      redirect_url: window.location.origin + '/login',
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
      mergeMap((res: UsersUpdateResponse) => {
        if (res.updated) {
          return [setCurrentUserName({name: user.name})];
        }
      })
    )),
    catchError(err => [addMessage(MESSAGES_SEVERITY.ERROR, `Update User Failed ${this.errorService.getErrorMsg(err?.error)}`)])
  ));
}

