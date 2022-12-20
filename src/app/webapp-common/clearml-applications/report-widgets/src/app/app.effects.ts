import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {getPlot, getSample, getScalar, setPlotData, setSampleData, setSignIsNeeded} from './app.actions';
import {EMPTY, mergeMap, of, switchMap} from 'rxjs';
import {Store} from '@ngrx/store';
import {filter} from 'rxjs/operators';
import {ReportsApiMultiplotsResponse, State} from './app.reducer';
import {ApiReportsService} from '~/business-logic/api-services/reports.service';
import {BaseAdminService} from '@common/settings/admin/base-admin.service';
import {ReportsGetTaskDataResponse} from '~/business-logic/model/reports/reportsGetTaskDataResponse';
import {setCurrentDebugImage} from '@common/shared/debug-sample/debug-sample.actions';
import {getSignedUrl, setSignedUrl} from '@common/core/actions/common-auth.actions';
import {SignResponse} from '@common/settings/admin/base-admin-utils';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {HTTP} from '~/app.constants';
import {DebugSample} from '@common/shared/debug-sample/debug-sample.reducer';


@Injectable()
export class AppEffects {

  protected basePath = HTTP.API_BASE_URL;

  constructor(
    private httpClient: HttpClient,
    private store: Store<State>,
    private actions$: Actions,
    private reportsApi: ApiReportsService,
    private adminService: BaseAdminService) {
  }

  getHeaders(company: string): HttpHeaders {
    let headers = new HttpHeaders();
    headers = headers.append('X-Allegro-Tenant', company);
    return headers;
  }

  getPlot = createEffect(() => this.actions$.pipe(
    ofType(getPlot),
    switchMap(action => this.httpClient.post<{ data: ReportsGetTaskDataResponse }>(`${this.basePath}/reports.get_task_data`,
      {
        id: action.tasks,
        plots: {
          iters: 1,
          metrics: action.metrics.map(metric => ({metric, variants: action.variants}))
        }
      },
      {headers: this.getHeaders(action.company)}
    )),
    mergeMap((res) => [setPlotData({data: res.data.plots as unknown as ReportsApiMultiplotsResponse})])
  ));

  getScalar = createEffect(() => this.actions$.pipe(
    ofType(getScalar),
    mergeMap(action => this.httpClient.post<{ data: ReportsGetTaskDataResponse }>(`${this.basePath}/reports.get_task_data`,
        {
          id: action.tasks,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          scalar_metrics_iter_histogram: {
            metrics: action.metrics.map(metric => ({metric, variants: action.variants}))
          }
        },
        {headers: this.getHeaders(action.company)}
      ).pipe(
        mergeMap(res => [
          setPlotData({data: res.data.scalar_metrics_iter_histogram as ReportsApiMultiplotsResponse})]
        )
      )
    )
  ));

  getSample = createEffect(() => this.actions$.pipe(
    ofType(getSample),
    switchMap(action => this.httpClient.post<{ data: ReportsGetTaskDataResponse }>(`${this.basePath}/reports.get_task_data`,
        {
          id: action.tasks,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          debug_images: {
            iters: 1,
            metrics: action.metrics.map(metric => ({metric, variants: action.variants}))
          }
        },
        {headers: this.getHeaders(action.company)}
      ).pipe(
        mergeMap(res => [
          setSampleData({data: res.data.debug_images?.[0]?.iterations?.[0]?.events[0] as DebugSample})
        ])
      )
    ))
  );

  signUrl = createEffect(() => this.actions$.pipe(
    ofType(getSignedUrl),
    filter(action => !!action.url),
    mergeMap(action =>
      of(action).pipe(
        switchMap(() => this.adminService.signUrlIfNeeded(action.url, action.config)),
        filter(res => !!res),
        switchMap((res: SignResponse) => {
            switch (res.type) {
              case 'popup':
                return [setSignIsNeeded()];
              case 'sign':
                return [setSignedUrl({url: action.url, signed: res.signed, expires: res.expires})];
              default:
                return EMPTY;
            }
          }
        ),
      ),
    )
  ));

}
