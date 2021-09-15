import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {MESSAGES_SEVERITY} from 'app/app.constants';
import {ApiUsersService} from 'app/business-logic/api-services/users.service';
import {
  fetchCurrentUser, getApiVersion, getInviteUserLink, getUserWorkspaces, leaveWorkspace, logout, logoutSuccess, removeWorkspace, setAccountAdministrationPage, setActiveWorkspace, setApiVersion,
  setInviteUserLink, setUserWorkspaces, setUserWorkspacesFromUser
} from '../actions/users.actions';
import {catchError, map, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {requestFailed} from '../actions/http.actions';
import {ApiAuthService} from 'app/business-logic/api-services/auth.service';
import {ApiOrganizationService} from 'app/business-logic/api-services/organization.service';
import {addMessage, deactivateLoader, setServerError} from '../actions/layout.actions';
import {OrganizationCreateInviteResponse} from 'app/business-logic/model/organization/organizationCreateInviteResponse';
import {ApiLoginService} from 'app/business-logic/api-services/login.service';
import {OrganizationGetUserCompaniesResponse} from 'app/business-logic/model/organization/organizationGetUserCompaniesResponse';
import {selectRouterUrl} from '../reducers/router-reducer';
import {LoginLogoutResponse} from 'app/business-logic/model/login/loginLogoutResponse';
import {ErrorService} from '../../shared/services/error.service';
import {ApiServerService} from 'app/business-logic/api-services/server.service';
import {ServerInfoResponse} from 'app/business-logic/model/server/serverInfoResponse';
import {setCurrentUser} from 'app/core/actions/users.action';


@Injectable()
export class CommonUserEffects {

  constructor(
    private actions: Actions, private userService: ApiUsersService, private organizationService: ApiOrganizationService,
    private router: Router, private authService: ApiAuthService, private loginApi: ApiLoginService, private serverService: ApiServerService,
    private store: Store<any>, private errorService: ErrorService
  ) {
  }

  fetchUser$ = createEffect(() => this.actions.pipe(
    ofType(fetchCurrentUser),
    mergeMap(() => this.userService.usersGetCurrentUser({get_supported_features: true})
      .pipe(
        switchMap((res) => [setCurrentUser(res)]),
        catchError(error => [requestFailed(error)])
      )
    )
  ));

  getUserInviteLink$ = createEffect( () => this.actions.pipe(
    ofType(getInviteUserLink),
    switchMap((action) =>
      this.organizationService.organizationCreateInvite({})
        .pipe(
          mergeMap((res: OrganizationCreateInviteResponse) => [
            setInviteUserLink(res)
          ]),
          catchError(error => [
            requestFailed(error),
            deactivateLoader(action.type),
            setServerError(error, null, 'Fetch invite link failed')
          ])
        )
    )
  ));

  logoutFlow = createEffect( () => this.actions.pipe(
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

  setUserManagementPage = createEffect(() =>
    this.actions.pipe(
      ofType(setAccountAdministrationPage),
      map( () => {
        this.router.navigateByUrl('account-administration');
      })
    )
  , {dispatch: false});


  leaveWorkspace = createEffect(() => this.actions.pipe(
    ofType(leaveWorkspace),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    mergeMap((action) => this.loginApi.loginLeaveCompany({company_id: action.workspace.id}).pipe(
      mergeMap(() => [removeWorkspace({workspaceId: action.workspace.id})]),
      catchError(() => [addMessage(MESSAGES_SEVERITY.ERROR, 'Failed to Leave Workspace')])
    )),
  ));

  getUserWorkspaces = createEffect(() => this.actions.pipe(
    ofType(getUserWorkspaces),
    mergeMap(() => this.organizationService.organizationGetUserCompanies({})),
    map((res: OrganizationGetUserCompaniesResponse) =>
      setUserWorkspaces({workspaces: res.companies})
    ),
    catchError(() => [setUserWorkspacesFromUser()])
  ));

  switchWorkspace = createEffect(() => this.actions.pipe(
    ofType(setActiveWorkspace),
    withLatestFrom(this.store.select(selectRouterUrl)),
    map(([action, url]) => {
      if (!url.endsWith('profile')) {
        this.router.navigate(['dashboard']);
      }
    }
    )), {dispatch: false});

  getApiVersion = createEffect(() => this.actions.pipe(
    ofType(getApiVersion),
    mergeMap(() => this.serverService.serverInfo({})),
    map((res: ServerInfoResponse) =>
      setApiVersion({serverVersions: {server: res.version, api: res.api_version}})
    ),
    catchError(() => [setUserWorkspacesFromUser()])
  ));
}

