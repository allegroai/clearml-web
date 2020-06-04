import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {Actions, Effect, ofType} from '@ngrx/effects';
import * as actions from './select-model.actions';
import * as exSelectors from './select-model.reducer';
import {MODELS_PAGE_SIZE} from '../../webapp-common/models/models.consts';
import {catchError, flatMap, map, switchMap, withLatestFrom} from 'rxjs/operators';
import {get} from 'lodash/fp';
import {MODEL_TAGS, MODELS_TABLE_COL_FIELDS} from '../../webapp-common/models/shared/models.const';
import {IModelsViewState} from '../../webapp-common/models/reducers/models-view.reducer';
import {ApiModelsService} from '../../business-logic/api-services/models.service';
import {RequestFailed} from '../../webapp-common/core/actions/http.actions';
import {ActiveLoader, DeactiveLoader, SetServerError} from '../../webapp-common/core/actions/layout.actions';
import {selectRouterParams} from '../../webapp-common/core/reducers/router-reducer';
import {ModelsGetAllRequest} from '../../business-logic/model/models/modelsGetAllRequest';
import {escapeRegex} from '../../webapp-common/shared/utils/shared-utils';
import {of} from 'rxjs';
import {TableSortOrderEnum} from '../shared/ui-components/data/table/table.consts';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {EXPERIMENTS_TABLE_COL_FIELDS} from '../../features/experiments/shared/experiments.const';
import {ModelsGetAllExRequest} from '../../business-logic/model/models/modelsGetAllExRequest';

@Injectable()
export class SelectModelEffects {

  constructor(private actions$: Actions, private store: Store<IModelsViewState>, private apiModels: ApiModelsService) {
  }

  @Effect()
  activeLoader = this.actions$.pipe(
    ofType(actions.GET_NEXT_MODELS, actions.GLOBAL_FILTER_CHANGED,
      actions.ALL_PROJECTS_MODE_CHANGED, actions.TABLE_SORT_CHANGED, actions.TABLE_FILTER_CHANGED),
    map(action => new ActiveLoader(action.type))
  );

  @Effect()
  modelsFilterChanged = this.actions$.pipe(
    ofType(actions.GLOBAL_FILTER_CHANGED, actions.ALL_PROJECTS_MODE_CHANGED, actions.TABLE_SORT_CHANGED, actions.TABLE_FILTER_CHANGED),
    switchMap((action) => this.fetchModels$(0)
      .pipe(
        flatMap(res => [
          new actions.SetNoMoreModels((res.models.length < MODELS_PAGE_SIZE)),
          new actions.SetModels(res.models),
          new actions.SetCurrentPage(0),
          new DeactiveLoader(action.type)
        ]),
        catchError(error => [new RequestFailed(error), new DeactiveLoader(action.type), new SetServerError(error, null, 'Fetch Models failed')])
      )
    )
  );

  @Effect()
  getModels = this.actions$.pipe(
    ofType<actions.GetNextModels>(actions.GET_NEXT_MODELS),
    withLatestFrom(this.store.select(exSelectors.selectCurrentPage)),
    switchMap(([action, page]) =>
      this.fetchModels$(page + 1)
        .pipe(
          flatMap(res => [
            new actions.SetNoMoreModels((res.models.length < MODELS_PAGE_SIZE)),
            new actions.AddModels(res.models),
            new actions.SetCurrentPage(page + 1),
            new DeactiveLoader(action.type)
          ]),
          catchError(error => [new RequestFailed(error), new DeactiveLoader(action.type), new SetServerError(error, null, 'Fetch Models failed')])
        )
    )
  );

  getGetAllQuery(
    page: number, projectId: string, searchQuery: string, isAllProjects: boolean,
    orderField: string, orderSort: TableSortOrderEnum, tableFilters: Map<string, FilterMetadata>
  ): ModelsGetAllExRequest {
    const userFilter = get([MODELS_TABLE_COL_FIELDS.USER, 'value'], tableFilters);
    const tagsFilter = get([MODELS_TABLE_COL_FIELDS.TAGS, 'value'], tableFilters);
    const systemTags = get(['system_tags', 'value'], tableFilters);
    const systemTagsFilter = ['-' + MODEL_TAGS.HIDDEN].concat(systemTags ? systemTags : []);
    return {
      _any_: searchQuery ? {
        pattern: escapeRegex(searchQuery),
        fields: ['id', 'name', 'framework', 'system_tags', 'uri']
      } : undefined,
      project: (isAllProjects || !projectId || projectId === '*') ? undefined : [projectId],
      page: page,
      page_size: MODELS_PAGE_SIZE,
      order_by: [(orderSort === 1 ? '-' : '') + orderField],
      tags: (tagsFilter && tagsFilter.length > 0) ? tagsFilter : [],
      system_tags: (systemTagsFilter && systemTagsFilter.length > 0) ? systemTagsFilter : [],
      only_fields: ['created', 'framework', 'id', 'labels', 'name', 'ready', 'tags', 'system_tags', 'task.name', 'uri', 'user.name', 'parent', 'design', 'company'],
      ready: true,
      framework: get([MODELS_TABLE_COL_FIELDS.FRAMEWORK, 'value'], tableFilters) || undefined,
      user: (userFilter && userFilter.length > 0) ? userFilter : undefined
    };
  }

  fetchModels$(page: number) {
    return of(page)
      .pipe(
        withLatestFrom(
          // TODO: refactor with ngrx router.
          this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
          this.store.select(exSelectors.selectIsAllProjectsMode),
          this.store.select(exSelectors.selectGlobalFilter),
          this.store.select(exSelectors.selectTableSortField),
          this.store.select(exSelectors.selectTableSortOrder),
          this.store.select(exSelectors.selectTableFilters),
        ),
        switchMap(([pageNumber, projectId, isAllProjects, gb, sortField, sortOrder, filters]) =>
          this.apiModels.modelsGetAllEx(this.getGetAllQuery(pageNumber, projectId, gb, isAllProjects, sortField, sortOrder, filters))
        )
      );
  }

  getReadyFilter(tableFilters) {
    switch (get('ready.value.length', tableFilters)) {
      case 0:
        return null;
      case 1:
        return tableFilters.ready.value[0] === 'true';
      case 2:
        return null;
      default:
        return null;
    }
  }
}
