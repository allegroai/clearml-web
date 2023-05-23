import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {
  getParcoords,
  getPlot,
  getSample,
  getScalar, getSingleValues,
  setNoPermissions, setParallelCoordinateExperiments,
  setPlotData,
  setSampleData,
  setSignIsNeeded, setSingleValues, setTaskData
} from './app.actions';
import {EMPTY, mergeMap, of, switchMap} from 'rxjs';
import {Store} from '@ngrx/store';
import {catchError, filter} from 'rxjs/operators';
import {ReportsApiMultiplotsResponse, State} from './app.reducer';
import {ApiReportsService} from '~/business-logic/api-services/reports.service';
import {BaseAdminService} from '@common/settings/admin/base-admin.service';
import {ReportsGetTaskDataResponse} from '~/business-logic/model/reports/reportsGetTaskDataResponse';
import {getSignedUrl, setSignedUrl} from '@common/core/actions/common-auth.actions';
import {SignResponse} from '@common/settings/admin/base-admin-utils';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {HTTP} from '~/app.constants';
import {DebugSample} from '@common/shared/debug-sample/debug-sample.reducer';
import {requestFailed} from '@common/core/actions/http.actions';
import {Task} from '~/business-logic/model/tasks/task';


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
    switchMap(action => this.httpClient.post<{ data: ReportsGetTaskDataResponse }>(`${this.basePath}/reports.get_task_data?${action.otherSearchParams.toString()}`,
      {
        id: action.tasks,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        model_events: action.models,
        plots: {
          iters: 1,
          metrics: action.metrics.map(metric => ({metric, variants: action.variants}))
        }
      },
      {headers: this.getHeaders(action.company)}
    )),
    mergeMap((res) => [
      setPlotData({data: res.data.plots as unknown as ReportsApiMultiplotsResponse}),
      setTaskData({
        sourceProject: (res.data.tasks[0]?.project as any).id,
        sourceTasks: res.data.tasks.map(t => t.id),
        appId: (res.data.tasks[0] as any)?.application?.app_id?.id
      })]),
    catchError(error => [requestFailed(error), ...(error.status === 403 ? [setNoPermissions()] : [])])
  ));

  getScalar = createEffect(() => this.actions$.pipe(
    ofType(getScalar),
    mergeMap(action => this.httpClient.post<{ data: ReportsGetTaskDataResponse }>(`${this.basePath}/reports.get_task_data?${action.otherSearchParams.toString()}`,
        {
          id: action.tasks,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          model_events: action.models,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          scalar_metrics_iter_histogram: {
            metrics: action.metrics.map(metric => ({metric, variants: action.variants}))
          }
        },
        {headers: this.getHeaders(action.company)}
      ).pipe(
        mergeMap(res => [
          setPlotData({data: res.data.scalar_metrics_iter_histogram as ReportsApiMultiplotsResponse}),
          setTaskData({
            sourceProject: (res.data.tasks[0]?.project as any).id,
            sourceTasks: res.data.tasks.map(t => t.id),
            appId: (res.data.tasks[0] as any)?.application?.app_id?.id
          })]
        ), catchError(error => [requestFailed(error), ...(error.status === 403 ? [setNoPermissions()] : [])])
      )
    )
  ));

  getSample = createEffect(() => this.actions$.pipe(
    ofType(getSample),
    switchMap(action => this.httpClient.post<{ data: ReportsGetTaskDataResponse }>(`${this.basePath}/reports.get_task_data?${action.otherSearchParams.toString()}`,
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
          setSampleData({data: res.data.debug_images?.[0]?.iterations?.[0]?.events[0] as DebugSample}),
          setTaskData({sourceProject: (res.data.tasks[0]?.project as any).id, sourceTasks: res.data.tasks.map(t => t.id)})]),
        catchError(error => [requestFailed(error), ...(error.status === 403 ? [setNoPermissions()] : [])])
      )
    ))
  );

  getParcoords$ = createEffect(() => this.actions$.pipe(
    ofType(getParcoords),
    mergeMap((action) => this.httpClient.post<{ data: ReportsGetTaskDataResponse }>(`${this.basePath}/reports.get_task_data?${action.otherSearchParams.toString()}`, {
        id: action.tasks,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        only_fields: ['last_metrics', 'name', 'last_iteration', ...action.variants.map(variant => `hyperparams.${variant}`)]
      })
        .pipe(
          mergeMap(res => [
            setParallelCoordinateExperiments({data: res.data.tasks as unknown as Task[]}),
            setTaskData({sourceProject: (res.data.tasks[0]?.project as any).id, sourceTasks: res.data.tasks.map(t => t.id)})
          ])
        )
    ))
  );

  getScalarSingleValue$ = createEffect(() => this.actions$.pipe(
    ofType(getSingleValues),
    switchMap((action) => this.httpClient.post<{ data: ReportsGetTaskDataResponse }>(`${this.basePath}/reports.get_task_data?${action.otherSearchParams.toString()}`, {
        id: action.tasks,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        model_events: action.models,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        single_value_metrics: {}
      })
    ),
    mergeMap((res: { data: ReportsGetTaskDataResponse }) => [
        setSingleValues({data: res.data.single_value_metrics[0]}),
        setTaskData({sourceProject: (res.data.tasks[0]?.project as any).id, sourceTasks: res.data.tasks.map(t => t.id)})
      ]
    )
  ));

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
