import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {debounceTime, filter, map, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {activeLoader, deactivateLoader} from '../../core/actions/layout.actions';
import {ApiTasksService} from '~/business-logic/api-services/tasks.service';
import {
  compareAddDialogSetTableSort,
  compareAddDialogTableSortChanged,
  GET_SELECTED_EXPERIMENTS_FOR_COMPARE,
  getSelectedExperimentsForCompareAddDialog,
  refreshIfNeeded,
  setExperimentsUpdateTime,
  setSearchExperimentsForCompareResults,
} from '../actions/compare-header.actions';
import {select, Store} from '@ngrx/store';
import {flatten, get, isEmpty} from 'lodash/fp';
import {selectExperimentsUpdateTime} from '../reducers';
import {selectRouterParams} from '../../core/reducers/router-reducer';
import {selectAppVisible} from '../../core/reducers/view.reducer';
import {MINIMUM_ONLY_FIELDS} from '../../experiments/experiment.consts';
import * as exSelectors from '../../experiments/reducers';
import {
  selectExperimentsMetricsCols,
  selectExperimentsTableCols,
  selectTableSortFields
} from '../../experiments/reducers';
import {selectSelectedProjectId} from '../../core/reducers/projects.reducer';
import {addMultipleSortColumns} from '../../shared/utils/shared-utils';
import {RefreshService} from '@common/core/services/refresh.service';
import {LIMITED_VIEW_LIMIT} from '@common/experiments-compare/experiments-compare.constants';
import {ActivatedRoute} from '@angular/router';

@Injectable()
export class SelectCompareHeaderEffects {

  constructor(
    private actions: Actions,
    public experimentsApi: ApiTasksService,
    private store: Store,
    private refresh: RefreshService,
    private route: ActivatedRoute
  ) {
  }

  activeLoader = createEffect(() => this.actions.pipe(
    ofType(GET_SELECTED_EXPERIMENTS_FOR_COMPARE),
    map(action => activeLoader(action.type))
  ));

  refreshIfNeeded = createEffect(() => this.actions.pipe(
    ofType(refreshIfNeeded),
    withLatestFrom(
      this.store.select(selectAppVisible),
      this.store.select(selectRouterParams).pipe(map(params => get('ids', params)?.split(','))),
      this.store.pipe(select(selectExperimentsUpdateTime)),
    ),
    filter(([, isAppVisible, ,]) => isAppVisible),
    map(([...args]) => {
      let route = this.route.snapshot;
      let limit = false;
      while (route.firstChild) {
        route = route.firstChild;
        if (route.data.limit !== undefined) {
          limit = route.data.limit;
        }
      }
      return [...args, limit];
    }),
    switchMap(([action, , experimentsIds, experimentsUpdateTime, isLimitedView]) =>
      // eslint-disable-next-line @typescript-eslint/naming-convention
      this.experimentsApi.tasksGetAllEx({
        id: isLimitedView ? experimentsIds.slice(0, LIMITED_VIEW_LIMIT) : experimentsIds,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        only_fields: ['last_change']
      }).pipe(
        mergeMap((res) => {
          const updatedExperimentsUpdateTime: { [key: string]: Date } = {};
          res.tasks.forEach(task => {
            updatedExperimentsUpdateTime[task.id] = task.last_change;
          });
          const experimentsWhereUpdated = experimentsIds.some(id =>
            new Date(experimentsUpdateTime[id]) < new Date(updatedExperimentsUpdateTime[id])
          );
          if (((!action.payload) || (!action.autoRefresh) || experimentsWhereUpdated) && !(isEmpty(experimentsUpdateTime))) {
            this.refresh.trigger(true);
          }
          return [
            setExperimentsUpdateTime({payload: updatedExperimentsUpdateTime})];
        }))
    )
  ));

  tableSortChange = createEffect(() => this.actions.pipe(
    ofType(compareAddDialogTableSortChanged),
    withLatestFrom(
      this.store.select(selectTableSortFields),
      this.store.select(selectSelectedProjectId),
      this.store.select(selectExperimentsTableCols),
      this.store.select(selectExperimentsMetricsCols),
    ),
    switchMap(([action, oldOrders, projectId, tableCols, metricsCols]) => {
      const orders = addMultipleSortColumns(oldOrders, action.colId, action.isShift);
      const colIds = tableCols.map(col => col.id).concat(metricsCols.map(col => col.id));
      return [compareAddDialogSetTableSort({orders, projectId, colIds})];
    })
  ));

  searchExperimentsForCompare = createEffect(() => this.actions.pipe(
    ofType(getSelectedExperimentsForCompareAddDialog),
    withLatestFrom(this.store.select(selectRouterParams).pipe(map(params => get('ids', params)?.split(','))),
      this.store.select(exSelectors.selectExperimentsTableCols),
      this.store.select(exSelectors.selectExperimentsMetricsColsForProject)),
    debounceTime(500),
    switchMap(([action, tasksIds, cols, metricCols]) => this.experimentsApi.tasksGetAllEx({
        id: action.tasksIds ? action.tasksIds : tasksIds,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        only_fields: [...new Set([...MINIMUM_ONLY_FIELDS,
          ...flatten(cols.filter(col => col.id !== 'selected' && !col.hidden).map(col => col.getter || col.id)),
          ...(metricCols ? flatten(metricCols.map(col => col.getter || col.id)) : [])])] as string[]
      }).pipe(
        mergeMap((res) => [setSearchExperimentsForCompareResults({payload: [...res?.tasks]}), deactivateLoader(action.type)]),
      )
    )));
}
