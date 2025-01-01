import {Injectable} from '@angular/core';
import {Actions, ofType, createEffect} from '@ngrx/effects';
import {mergeMap, switchMap, catchError, map} from 'rxjs/operators';
import {ApiServerService} from '~/business-logic/api-services/server.service';
import {ServerReportStatsOptionResponse} from '~/business-logic/model/server/serverReportStatsOptionResponse';
import {setUsageStats, updateUsageStats} from '../actions/usage-stats.actions';
import {fetchCurrentUser} from '@common/core/actions/users.actions';
import {UsersGetCurrentUserResponse} from '~/business-logic/model/users/usersGetCurrentUserResponse';
import {GettingStarted, setCurrentUser} from '~/core/actions/users.action';
import {requestFailed} from '@common/core/actions/http.actions';
import {ApiUsersService} from '~/business-logic/api-services/users.service';


@Injectable()
export class UserEffects {

  constructor(private actions: Actions, private userService: ApiUsersService, private serverService: ApiServerService) {}

  setUser$ = createEffect(() => {
    return this.actions.pipe(
      ofType(fetchCurrentUser),
      mergeMap(() => this.serverService.serverReportStatsOption({})),
      switchMap((options: ServerReportStatsOptionResponse) => [setUsageStats({
        supported: options.supported,
        allowed: options.enabled,
        currVersion: options.current_version,
        allowedVersion: options.enabled_version
      })])
    );
  });

  setStatsPref$ = createEffect(
    () => this.actions.pipe(
      ofType(updateUsageStats),
      mergeMap(
        (action) => this.serverService.serverReportStatsOption({enabled: action.allowed})
          .pipe(
            switchMap((options: ServerReportStatsOptionResponse) => [setUsageStats({
              supported: options.supported,
              allowed: options.enabled,
              currVersion: options.current_version,
              allowedVersion: options.enabled_version
            })])
          )
      )
    )
  );

  fetchUser$ = createEffect(() => this.actions.pipe(
    ofType(fetchCurrentUser),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    mergeMap(() => this.userService.usersGetCurrentUser({get_supported_features: true})
      .pipe(
        map((res: UsersGetCurrentUserResponse) => setCurrentUser({
          user: res.user,
          gettingStarted: res.getting_started as unknown as GettingStarted, settings: res.settings
        })),
        catchError(error => [requestFailed(error)])
      )
    )
  ));
}
