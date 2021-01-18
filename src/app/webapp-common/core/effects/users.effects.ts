import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Actions, createEffect, Effect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {MESSAGES_SEVERITY, USERS_ACTIONS} from '../../../app.constants';
import {ApiUsersService} from '../../../business-logic/api-services/users.service';
import {
  FetchCurrentUser,
  getInviteUserLink, getUserWorkspaces,
  leaveWorkspace,
  removeWorkspace, setActiveWorkspace,
  setCurrentUser,
  setInviteUserLink, setUserWorkspaces, setUserWorkspacesFromUser
} from '../actions/users.actions';
import {catchError, flatMap, map, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {RequestFailed} from '../actions/http.actions';
import {logoutFn} from '../../../shared/utils/logout-utils';
import {ApiAuthService} from '../../../business-logic/api-services/auth.service';
import {ApiOrganizationService} from '../../../business-logic/api-services/organization.service';
import {AddMessage, DeactiveLoader, SetServerError} from '../actions/layout.actions';
import {OrganizationCreateInviteResponse} from '../../../business-logic/model/organization/organizationCreateInviteResponse';
import {ApiLoginService} from '../../../business-logic/api-services/login.service';
import {OrganizationGetUserCompaniesResponse} from '../../../business-logic/model/organization/organizationGetUserCompaniesResponse';
import {selectRouterUrl} from '../reducers/router-reducer';


@Injectable()
export class CommonUserEffects {

  constructor(
    private actions: Actions, private userService: ApiUsersService, private organizationService: ApiOrganizationService,
    private router: Router, private authService: ApiAuthService, private loginApi: ApiLoginService, private store: Store<any>
  ) {
  }

  @Effect()
  fetchUser$ = this.actions.pipe(
    ofType<FetchCurrentUser>(USERS_ACTIONS.FETCH_CURRENT_USER),
    flatMap(() => this.userService.usersGetCurrentUser({})
      .pipe(
        switchMap((res) => [setCurrentUser(res)]),
        catchError(error => [new RequestFailed(error)])
      )
    )
  );

  @Effect()
  getUserInviteLink$ = this.actions.pipe(
    ofType(getInviteUserLink.type),
    switchMap((action) =>
      this.organizationService.organizationCreateInvite({})
        .pipe(
          mergeMap((res: OrganizationCreateInviteResponse) => [
            setInviteUserLink(res)
          ]),
          catchError(error => [
            new RequestFailed(error),
            new DeactiveLoader(action.type),
            new SetServerError(error, null, 'Fetch invite link failed')
          ])
        )
    )
  );

  @Effect()
  logoutFlow = this.actions.pipe(
    ofType(USERS_ACTIONS.LOGOUT),
    flatMap(() => {
      logoutFn(this.router, this.authService);
      return [{type: USERS_ACTIONS.LOGOUT_SUCCESS}];
    })
  );

  leaveWorkspace = createEffect(() => this.actions.pipe(
    ofType(leaveWorkspace),
    mergeMap((action) => this.loginApi.loginLeaveCompany({company_id: action.workspace.id}).pipe(
      mergeMap(() => [removeWorkspace({workspaceId: action.workspace.id})]),
      catchError(() => [new AddMessage(MESSAGES_SEVERITY.ERROR, 'Failed to Leave Workspace')])
    )),
  ));

  getUserWorkspaces = createEffect(() => this.actions.pipe(
    ofType(getUserWorkspaces),
    mergeMap(action => this.organizationService.organizationGetUserCompanies({})),
    map((res: OrganizationGetUserCompaniesResponse) => setUserWorkspaces({workspaces: res.companies})),
    catchError(err => [setUserWorkspacesFromUser()])
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
}
