import {Injectable} from '@angular/core';
import {Actions, Effect, ofType, createEffect} from '@ngrx/effects';
import {filter, take, mergeMap, switchMap} from 'rxjs/operators';
import {CookiesService} from '../../shared/cookies.service';
import {ApiAuthService} from '../../business-logic/api-services/auth.service';
import {ApiServerService} from '../../business-logic/api-services/server.service';
import {ServerReportStatsOptionResponse} from '../../business-logic/model/server/serverReportStatsOptionResponse';
import {setUsageStats, updateUsageStats} from '../actions/usage-stats.actions';
import {fetchCurrentUser} from '@common/core/actions/users.actions';


@Injectable()
export class UserEffects {

  constructor(private actions: Actions, private cookiesService: CookiesService,
    private authService: ApiAuthService, private serverService: ApiServerService) { }

  setUser$ = createEffect(() => this.actions.pipe(
    ofType(fetchCurrentUser),
    filter(user => !!user),
    take(1),
    mergeMap(() => this.serverService.serverReportStatsOption({})
      .pipe(
        switchMap((options: ServerReportStatsOptionResponse) => [setUsageStats({
          allowed: options.enabled,
          currVersion: options.current_version,
          allowedVersion: options.enabled_version
        })])
      )
    )
  ));

  setStatsPref$ = createEffect(
    () => this.actions.pipe(
      ofType(updateUsageStats),
      mergeMap(
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
