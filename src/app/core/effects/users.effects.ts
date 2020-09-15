import {Injectable} from '@angular/core';
import {Actions, Effect, ofType, createEffect} from '@ngrx/effects';
import {USERS_ACTIONS} from '../../app.constants';
import {map, filter, take, flatMap, switchMap} from 'rxjs/operators';
import {CookiesService} from '../../shared/cookies.service';
import {ApiAuthService} from '../../business-logic/api-services/auth.service';
import {ApiServerService} from '../../business-logic/api-services/server.service';
import {ServerReportStatsOptionResponse} from '../../business-logic/model/server/serverReportStatsOptionResponse';
import {setUsageStats, updateUsageStats} from '../Actions/usage-stats.actions';
import {FetchCurrentUser} from '../../webapp-common/core/actions/users.actions';


@Injectable()
export class UserEffects {

  constructor(private actions: Actions, private cookiesService: CookiesService,
    private authService: ApiAuthService, private serverService: ApiServerService) { }

  @Effect()
  logoutFlow = this.actions.pipe(
    ofType(USERS_ACTIONS.LOGOUT),
    map(() => {
      this.authService.authLogout({}).subscribe();
      return {type: USERS_ACTIONS.LOGOUT_SUCCESS};
    })
  );

  @Effect()
  setUser$ = this.actions.pipe(
    ofType<FetchCurrentUser>(USERS_ACTIONS.SET_CURRENT_USER),
    filter(user => !!user),
    take(1),
    flatMap(() => this.serverService.serverReportStatsOption({})
            .pipe(
              switchMap((options: ServerReportStatsOptionResponse) => [setUsageStats({
                allowed: options.enabled,
                currVersion: options.current_version,
                allowedVersion: options.enabled_version
              })])
            )
    )
  );

  setStatsPref$ = createEffect(
    () => this.actions.pipe(
      ofType(updateUsageStats),
      flatMap(
        (action) => this.serverService.serverReportStatsOption({enabled: action.allowed})
        .pipe(
          switchMap((options: ServerReportStatsOptionResponse) => [setUsageStats({
            allowed: options.enabled,
            currVersion: options.current_version,
            allowedVersion: options.enabled_version
          })])
        )
      )
    )
  );

}
