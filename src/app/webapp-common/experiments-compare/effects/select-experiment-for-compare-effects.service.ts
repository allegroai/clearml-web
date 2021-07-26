import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {catchError, debounceTime, filter, mergeMap, map, switchMap, withLatestFrom} from 'rxjs/operators';
import {activeLoader, deactivateLoader} from '../../core/actions/layout.actions';
import {requestFailed} from '../../core/actions/http.actions';
import {ApiTasksService} from '../../../business-logic/api-services/tasks.service';
import {
  SEARCH_EXPERIMENTS_FOR_COMPARE, searchExperimentsForCompare,
  setSearchExperimentsForCompareResults, refreshIfNeeded, setRefreshing, setExperimentsUpdateTime
} from '../actions/compare-header.actions';
import {select, Store} from '@ngrx/store';
import {get, isEmpty} from 'lodash/fp';
import {escapeRegex} from '../../shared/utils/shared-utils';
import {NONE_USER_TASK_TYPES} from '../../experiments/shared/common-experiments.const';
import {selectExperimentsUpdateTime} from '../reducers';
import {EmptyAction} from '../../../app.constants';
import {selectRouterParams} from '../../core/reducers/router-reducer';
import {selectAppVisible} from '../../core/reducers/view-reducer';

@Injectable()
export class SelectCompareHeaderEffects {

  constructor(private actions: Actions, public experimentsApi: ApiTasksService, private store: Store<any>) {
  }

  @Effect()
  activeLoader = this.actions.pipe(
    ofType(SEARCH_EXPERIMENTS_FOR_COMPARE),
    map(action => activeLoader(action.type))
  );

  @Effect()
  refreshIfNeeded = this.actions.pipe(
    ofType(refreshIfNeeded),
    withLatestFrom(
      this.store.select(selectAppVisible),
      this.store.select(selectRouterParams).pipe(map(params => get('ids', params)?.split(','))),
      this.store.pipe(select(selectExperimentsUpdateTime)),
    ),
    filter(([action, isAppVisible, experimentsIds, experimentsUpdateTime]) => isAppVisible),
    switchMap(([action, isAppVisible, experimentsIds, experimentsUpdateTime]) =>
      this.experimentsApi.tasksGetAllEx({id: experimentsIds, only_fields: ['last_update']}).pipe(
        mergeMap((res) => {
          const updatedExperimentsUpdateTime: { [key: string]: Date } = {};
          res.tasks.forEach(task => {
            updatedExperimentsUpdateTime[task.id] = task.last_update;
          });
          const experimentsWhereUpdated = !!(experimentsIds.find((id) =>
            (new Date(experimentsUpdateTime[id]).getTime()) < new Date(updatedExperimentsUpdateTime[id]).getTime()
          ));
          const shouldUpdate = ((!action.payload) || (!action.autoRefresh) || experimentsWhereUpdated) && !(isEmpty(experimentsUpdateTime));
          return [
            setExperimentsUpdateTime({payload: updatedExperimentsUpdateTime}),
            (shouldUpdate) ? setRefreshing({payload: action.payload, autoRefresh: action.autoRefresh}) : new EmptyAction()];
        }))
    )
  );

  @Effect()
  searchExperimentsForCompare = this.actions.pipe(
    ofType(searchExperimentsForCompare),
    debounceTime(500),
    switchMap((action) => this.experimentsApi.tasksGetAllEx({
      _any_      : {
        pattern: action.payload ? escapeRegex(action.payload) : '',
        fields : ['id', 'name']
      },
      page       : 0,
      page_size  : 300,
      only_fields: ['type', 'id', 'name', 'user.name', 'status', 'tags', 'system_tags', 'project.name'],
      type: NONE_USER_TASK_TYPES,
      system_tags: ['-archived'],
    })
      .pipe(
        mergeMap(res => [action.payload ? setSearchExperimentsForCompareResults({payload: res.tasks}) : setSearchExperimentsForCompareResults({payload: []}), deactivateLoader(action.type)]),
        catchError(error => [deactivateLoader(action.type), requestFailed(error)])
      )
    )
  );
}
