import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {USERS_ACTIONS} from '../../../app.constants';
import {ApiUsersService} from '../../../business-logic/api-services/users.service';
import {FetchCurrentUser, setCurrentUser} from '../actions/users.actions';
import {catchError, flatMap, switchMap} from 'rxjs/operators';
import {RequestFailed} from '../actions/http.actions';
import {logoutFn} from '../../../shared/utils/logout-utils';
import {ApiAuthService} from '../../../business-logic/api-services/auth.service';


@Injectable()
export class CommonUserEffects {

  constructor(
    private actions: Actions, private userService: ApiUsersService,
    private router: Router, private authService: ApiAuthService
  ) {}

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
  logoutFlow = this.actions.pipe(
    ofType(USERS_ACTIONS.LOGOUT),
    flatMap(() => {
      logoutFn(this.router, this.authService);
      return [{type: USERS_ACTIONS.LOGOUT_SUCCESS}];
    })
  );
}
