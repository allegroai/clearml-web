import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Actions, createEffect, Effect, ofType} from '@ngrx/effects';
import {ActionType, Store} from '@ngrx/store';
import {MESSAGES_SEVERITY, USERS_ACTIONS} from '../../../app.constants';
import {ApiUsersService} from '../../../business-logic/api-services/users.service';
import {
  addWhitelistEntries,
  FetchCurrentUser,
  getWhitelistEntries,
  getInviteUserLink,
  getUserWorkspaces,
  leaveWorkspace,
  logout,
  removeWorkspace,
  setActiveWorkspace,
  setCurrentUser,
  setAddWhitelistEntries,
  setWhitelistEntries,
  setInviteUserLink,
  setUserWorkspaces,
  setUserWorkspacesFromUser,
  removeWhitelistEntry,
  setRemoveWhitelistEntry,
  deleteWhitelistEntry,
  setAccountAdministrationPage, logoutSuccess
} from '../actions/users.actions';
import {catchError, map, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {RequestFailed} from '../actions/http.actions';
import {ApiAuthService} from '../../../business-logic/api-services/auth.service';
import {ApiOrganizationService} from '../../../business-logic/api-services/organization.service';
import {ActiveLoader, AddMessage, DeactiveLoader, SetServerError} from '../actions/layout.actions';
import {OrganizationCreateInviteResponse} from '../../../business-logic/model/organization/organizationCreateInviteResponse';
import {ApiLoginService} from '../../../business-logic/api-services/login.service';
import {OrganizationGetUserCompaniesResponse} from '../../../business-logic/model/organization/organizationGetUserCompaniesResponse';
import {selectRouterUrl} from '../reducers/router-reducer';
import {LoginLogoutResponse} from '../../../business-logic/model/login/loginLogoutResponse';
import {ErrorService} from '../../shared/services/error.service';
import {AuthDeleteUserResponse} from '../../../business-logic/model/auth/authDeleteUserResponse';
import {selectCurrentUser} from '../reducers/users-reducer';
import {LoginRemoveWhitelistEntriesResponse} from '../../../business-logic/model/login/loginRemoveWhitelistEntriesResponse';
import {LoginAddWhitelistEntriesResponse} from '../../../business-logic/model/login/loginAddWhitelistEntriesResponse';


@Injectable()
export class CommonUserEffects {

  constructor(
    private actions: Actions, private userService: ApiUsersService, private organizationService: ApiOrganizationService,
    private router: Router, private authService: ApiAuthService, private loginApi: ApiLoginService, private store: Store<any>,
    private errorService: ErrorService
  ) {
  }

  @Effect()
  fetchUser$ = this.actions.pipe(
    ofType<FetchCurrentUser>(USERS_ACTIONS.FETCH_CURRENT_USER),
    mergeMap(() => this.userService.usersGetCurrentUser({})
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
      catchError(err => [new AddMessage(MESSAGES_SEVERITY.ERROR, `Logout Failed
${this.errorService.getErrorMsg(err?.error)}`)])
    )),
  );

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
      catchError(() => [new AddMessage(MESSAGES_SEVERITY.ERROR, 'Failed to Leave Workspace')])
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

  userLoader = createEffect(() =>
    this.actions.pipe(
      ofType(removeWhitelistEntry, deleteWhitelistEntry, addWhitelistEntries),
      mergeMap(action => [new ActiveLoader(action.type)])
    )
  );


  getInvitedUsers = createEffect(() => this.actions.pipe(
    ofType(getWhitelistEntries),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    switchMap( () => this.loginApi.loginGetSettings({include_auth: true})),
    withLatestFrom(this.store.select(selectCurrentUser)),
    mergeMap( ([whitelistEntries, currentUser]) => {
      // make the current user to be first!
      const currentUserPosition = whitelistEntries.whitelist_entries.findIndex( whitelistEntry => whitelistEntry.user?.id === currentUser.id);
      if (currentUserPosition > -1) {
        const inviteCurrentUser = whitelistEntries.whitelist_entries.splice(currentUserPosition, 1);
        whitelistEntries.whitelist_entries = [inviteCurrentUser[0], ...whitelistEntries.whitelist_entries];
      }
      return [setWhitelistEntries({whitelistEntries})];
    })
  ));

  addInviteUsers = createEffect(() =>
    this.actions.pipe(
      ofType(addWhitelistEntries),
      switchMap( (action) =>
        this.loginApi.loginAddWhitelistEntries({emails: action.whitelistEntries})
          .pipe(
            mergeMap( (invitedEmails: LoginAddWhitelistEntriesResponse) => {
              const notAddedByServer = action.whitelistEntries.filter( email => !invitedEmails.added.includes(email));
              const actions: ActionType<any>[] = [new DeactiveLoader(action.type), setAddWhitelistEntries({whitelistEntries: invitedEmails.added})];
              if (notAddedByServer.length) {
                actions.push(new AddMessage(MESSAGES_SEVERITY.ERROR, `User addition failed: ${notAddedByServer.join(', ')} `));
              }
              return actions;
            }),
            catchError(err =>
              [new DeactiveLoader(action.type), new AddMessage(MESSAGES_SEVERITY.ERROR, err.error.meta.result_msg)]
            )
          )
      ),
    ));

  removeWhitelistEntryUser = createEffect(() =>
    this.actions.pipe(
      ofType(removeWhitelistEntry),
      switchMap( (action) => this.loginApi.loginRemoveWhitelistEntries({emails: action.remove}).pipe(
        mergeMap( (removedEmails: LoginRemoveWhitelistEntriesResponse) => [
          setRemoveWhitelistEntry({removed: removedEmails.removed}),
          new DeactiveLoader(action.type)
        ]
        )
      )),
    ));

  deleteWhitelistEntryUser = createEffect(() =>
    this.actions.pipe(
      ofType(deleteWhitelistEntry),
      switchMap( (action) =>
        this.authService.authDeleteUser({user: action.user.id}).pipe(
          mergeMap( (isRemovedUser: AuthDeleteUserResponse) => {
            if (isRemovedUser.deleted) {
              return [setRemoveWhitelistEntry({removed: [action.user.email]}),  new DeactiveLoader(action.type)];
            }
            return [new AddMessage(MESSAGES_SEVERITY.ERROR, `User ${action.user.name} did not delete`),  new DeactiveLoader(action.type)];
          }),
          catchError(err =>
            [new DeactiveLoader(action.type), new AddMessage(MESSAGES_SEVERITY.ERROR, err.error.meta.result_msg)]
          )
        )
      ),
    ));
}
