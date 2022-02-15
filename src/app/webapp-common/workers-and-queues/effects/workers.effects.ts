import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {castArray, cloneDeep} from 'lodash/fp';
import {catchError, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {MESSAGES_SEVERITY} from '../../../app.constants';
import {ApiWorkersService} from '../../../business-logic/api-services/workers.service';
import {Worker} from '../../../business-logic/model/workers/worker';
import {WORKER_STATS_PARAM_INFO} from '../workers-and-queues.consts';
import {WorkersGetActivityReportRequest} from '../../../business-logic/model/workers/workersGetActivityReportRequest';
import {WorkersGetActivityReportResponse} from '../../../business-logic/model/workers/workersGetActivityReportResponse';
import {WorkersGetStatsRequest} from '../../../business-logic/model/workers/workersGetStatsRequest';
import {requestFailed} from '../../core/actions/http.actions';
import {addMessage, deactivateLoader} from '../../core/actions/layout.actions';
import * as workersActions from '../actions/workers.actions';
import {selectSelectedWorker, selectStats, selectStatsParams, selectStatsTimeFrame, selectWorkers, selectWorkersTableSortFields} from '../reducers/index.reducer';
import {orderBy} from 'lodash/fp';
import {addFullRangeMarkers, addStats, getLastTimestamp, removeFullRangeMarkers} from '../../shared/utils/statistics';
import {showStatsErrorNotice, hideNoStatsNotice} from '../actions/stats.actions';
import {addMultipleSortColumns} from '../../shared/utils/shared-utils';
import {WorkerExt} from '../actions/workers.actions';

const prepareStatsQuery = (entitie: string, keys: { key: string }[], range: number, granularity: number): WorkersGetStatsRequest => {
  const now = Math.floor((new Date()).getTime() / 1000);
  return {
    /* eslint-disable @typescript-eslint/naming-convention */
    from_date: now - range,
    to_date: now,
    worker_ids: entitie ? [entitie] : null,
    items: castArray(keys),
    interval: granularity
    /* eslint-enable @typescript-eslint/naming-convention */
  };
};

@Injectable()
export class WorkersEffects {

  constructor(
    private actions: Actions,
    private workersApi: ApiWorkersService, private store: Store<any>) {
  }

  getWorkers$ = createEffect(() => this.actions.pipe(
    ofType(workersActions.getWorkers),
    withLatestFrom(
      this.store.select(selectSelectedWorker),
      this.store.select(selectWorkersTableSortFields),
    ),
    switchMap(([action, selectedWorker, sortFields]) => this.workersApi.workersGetAll({}).pipe(
      mergeMap(res => {
        const workers = this.transformAndSortWorkers(sortFields, res.workers);
        const actionsToFire = [
          workersActions.setWorkers({workers}),
          deactivateLoader(action.type)] as Action[];
        if (selectedWorker) {
          actionsToFire.push(
            workersActions.setSelectedWorker({
              worker: workers.find(worker => worker.id === selectedWorker.id)
            }));
        }
        return actionsToFire;
      }),
      catchError(err => [requestFailed(err), deactivateLoader(action.type)])
      )
    )
  ));

  sortWorkers$ = createEffect(() => this.actions.pipe(
    ofType(workersActions.workersTableSetSort),
    withLatestFrom(
      this.store.select(selectWorkersTableSortFields),
      this.store.select(selectWorkers)
    ),
    mergeMap(([, sortFields, workers]) => [workersActions.setWorkers({workers: this.transformAndSortWorkers(sortFields, workers)})]),
  ));

  getStats$ = createEffect(() => this.actions.pipe(
    ofType(workersActions.getWorkers),
    withLatestFrom(
      this.store.select(selectStats),
      this.store.select(selectStatsTimeFrame),
      this.store.select(selectStatsParams),
      this.store.select(selectSelectedWorker)
    ),
    switchMap(([action, currentStats, selectedRange, params, worker]) => {
      const now = Math.floor((new Date()).getTime() / 1000);
      const keys = params.split(';').map(val => ({key: val}));
      const range = parseInt(selectedRange, 10);
      const granularity = Math.max(Math.floor(range / action.maxPoints), worker ? 10 : 40);
      let timeFrame: number;

      currentStats = cloneDeep(currentStats);
      if (Array.isArray(currentStats) && currentStats.some(topic => topic.dates.length > 1)) {
        removeFullRangeMarkers(currentStats);
        timeFrame = now - getLastTimestamp(currentStats) + granularity;
      } else {
        timeFrame = range;
      }
      if (worker) {
        const req = prepareStatsQuery(worker.name, keys, timeFrame, granularity);
        return this.workersApi.workersGetStats(req).pipe(
          mergeMap(res => {
            if (res) {
              res = addStats(currentStats, res.workers, action.maxPoints, keys, 'worker', WORKER_STATS_PARAM_INFO);
              if (Array.isArray(res) && res.some(topic => topic.dates.length > 0)) {
                addFullRangeMarkers(res, now - range, now);
              }
            }
            return [workersActions.setStats({data: res})];
          }),
          catchError(err => [requestFailed(err),
            workersActions.setStats({data: []}),
            addMessage(MESSAGES_SEVERITY.WARN, 'Failed to fetching activity worker statistics')])
        );
      } else {
        const req: WorkersGetActivityReportRequest = {
          /* eslint-disable @typescript-eslint/naming-convention */
          from_date: now - timeFrame,
          to_date: now,
          interval: granularity
          /* eslint-enable @typescript-eslint/naming-convention */
        };

        return this.workersApi.workersGetActivityReport(req).pipe(
          mergeMap((res: WorkersGetActivityReportResponse) => {
            let result = null;
            if (res) {
              const statsData = [{
                activity: '',
                metrics: [{
                  metric: 'total',
                  dates: res.total.dates,
                  stats: [{
                    aggregation: 'count',
                    values: res.total.counts
                  }]
                }, {
                  metric: 'active',
                  dates: res.active.dates,
                  stats: [{
                    aggregation: 'count',
                    values: res.active.counts
                  }]
                }]
              }];
              result = addStats(currentStats, statsData, action.maxPoints,
                [{key: 'active'}, {key: 'total'}], 'activity',
                {
                  total: {title: 'Total Workers', multiply: 1},
                  active: {title: 'Active Workers', multiply: 1}
                });
            }
            if (Array.isArray(result) && result.some(topic => topic.dates.length > 0)) {
              addFullRangeMarkers(result, now - range, now);
            }
            return [workersActions.setStats({data: result}), hideNoStatsNotice()];
          }),
          catchError(err => [requestFailed(err),
            workersActions.setStats({data: []}),
            showStatsErrorNotice()])
        );
      }
    })
  ));

  tableSortChange = createEffect(() => this.actions.pipe(
    ofType(workersActions.workersTableSortChanged),
    withLatestFrom(this.store.select(selectWorkersTableSortFields)),
    switchMap(([action, oldOrders]) => {
      const orders = addMultipleSortColumns(oldOrders, action.colId, action.isShift);
      return [workersActions.workersTableSetSort({orders})];
    })
  ));

  private transformAndSortWorkers(sortFields, workers: Worker[]): WorkerExt[] {
    workers = workers.map(worker => ({...worker, id: worker.key || worker.id, name: worker.id}));
    const srtByFields = sortFields.map(f => f.field);
    const srtByOrders = sortFields.map(f => f.order > 0 ? 'asc' : 'desc');
    return orderBy<Worker>(srtByFields, srtByOrders, workers) as any;
  }
}
