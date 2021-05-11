import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Actions, createEffect, Effect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {get, isEqual, uniq} from 'lodash/fp';
import {of} from 'rxjs';
import {auditTime, catchError, filter, map, mergeMap, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {ApiModelsService} from '../../../business-logic/api-services/models.service';
import {BlModelsService} from '../../../business-logic/services/models.service';
import {RequestFailed} from '../../core/actions/http.actions';
import {ActiveLoader, DeactiveLoader, SetServerError} from '../../core/actions/layout.actions';
import {setArchive as setProjectArchive} from '../../core/actions/projects.actions';
import {setURLParams} from '../../core/actions/router.actions';
import {selectIsArchivedMode, selectIsDeepMode} from '../../core/reducers/projects.reducer';
import {selectRouterParams} from '../../core/reducers/router-reducer';
import {selectAppVisible} from '../../core/reducers/view-reducer';
import {addMultipleSortColumns, escapeRegex, getRouteFullUrl} from '../../shared/utils/shared-utils';
import {GetModelInfo, RefreshModelInfo} from '../actions/models-info.actions';
import * as actions from '../actions/models-view.actions';
import {setSelectedModelsDisableAvailable} from '../actions/models-view.actions';
import {MODELS_PAGE_SIZE, MODELS_TABLE_COLS} from '../models.consts';
import * as modelsSelectors from '../reducers';
import {selectSelectedModels, selectTableSortFields} from '../reducers';
import {IModelsViewState} from '../reducers/models-view.reducer';
import {MODEL_TAGS, MODELS_ONLY_FIELDS, MODELS_TABLE_COL_FIELDS} from '../shared/models.const';
import {SelectedModel} from '../shared/models.model';
import {ApiUsersService} from '../../../business-logic/api-services/users.service';
import {EXPERIMENTS_TABLE_COL_FIELDS} from '../../../features/experiments/shared/experiments.const';
import {ModelsGetAllExRequest} from '../../../business-logic/model/models/modelsGetAllExRequest';
import {encodeColumns, encodeOrder} from '../../shared/utils/tableParamEncode';
import {EmptyAction} from '../../../app.constants';
import {ApiProjectsService} from '../../../business-logic/api-services/projects.service';
import {ICommonSearchState} from '../../common-search/common-search.reducer';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {SortMeta} from 'primeng/api';
import {
  CountAvailableAndIsDisableSelectedFiltered,
  MENU_ITEM_ID,
  selectionDisabledArchive,
  selectionDisabledDelete,
  selectionDisabledMoveTo,
  selectionDisabledPublishModels,
  selectionDisabledTags
} from '../../shared/entity-page/items.utils';

@Injectable()
export class ModelsViewEffects {

  constructor(private actions$: Actions, private store: Store<IModelsViewState>,
              private apiModels: ApiModelsService, private projectsApi: ApiProjectsService, private modelBl: BlModelsService, private usersApi: ApiUsersService,
              private router: Router, private route: ActivatedRoute
  ) {
  }

  @Effect()
  activeLoader = this.actions$.pipe(
    ofType(actions.GET_NEXT_MODELS, actions.globalFilterChanged.type,
      actions.TABLE_SORT_CHANGED, actions.TABLE_FILTER_CHANGED, actions.REFRESH_MODELS,
      actions.afterSetArchive.type),
    filter((action) => !get('payload.hideLoader', action)),
    map(() => new ActiveLoader('Fetch Models'))
  );

  @Effect()
  tableSortChange = this.actions$.pipe(
    ofType(actions.tableSortChanged),
    withLatestFrom(this.store.select(selectTableSortFields)),
    switchMap(([action, oldOrders]) => {
      let orders = addMultipleSortColumns(oldOrders, action.colId, action.isShift);
      return [actions.setTableSort({orders})];
    })
  );

  @Effect()
  reFetchModels = this.actions$.pipe(
    ofType(actions.FETCH_MODELS_REQUESTED, actions.globalFilterChanged.type,
      actions.TABLE_SORT_CHANGED, actions.TABLE_FILTER_CHANGED, actions.afterSetArchive.type),
    auditTime(50),
    switchMap(() => this.fetchModels$(0)
      .pipe(
        mergeMap(res => [
          new actions.SetNoMoreModels((res.models.length < MODELS_PAGE_SIZE)),
          new actions.SetModels(res.models),
          new actions.SetCurrentPage(0),
          new DeactiveLoader('Fetch Models')
        ]),
        catchError(error => [new RequestFailed(error), new DeactiveLoader('Fetch Models'), new SetServerError(error, null, 'Fetch Models failed')])
      )
    )
  );
  @Effect()
  getFrameworksEffect = this.actions$.pipe(
    ofType(actions.getFrameworks),
    withLatestFrom(
      this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
    ),
    switchMap(([action, projectId]) => this.apiModels.modelsGetFrameworks({projects: projectId !== '*' ? [projectId] : []})
      .pipe(
        mergeMap(res => [
          actions.setFrameworks({frameworks: res.frameworks.concat(null)}),
        ]),
        catchError(error => [
          new RequestFailed(error),
          new SetServerError(error, null, 'Fetch frameworks failed')]
        )
      )
    )
  );


  @Effect()
  getFilteredUsersEffect = this.actions$.pipe(
    ofType(actions.getFilteredUsers),
    withLatestFrom(this.store.select(modelsSelectors.selectModelsUsers), this.store.select(modelsSelectors.selectTableFilters)),
    switchMap(([action, users, filters]) => this.usersApi.usersGetAllEx({
      order_by: ['name'],
      only_fields: ['name'],
      id: get(['user.name', 'value'], filters) || []
    }).pipe(
      mergeMap(res => [
        actions.setUsers({users: uniq(res.users.concat(users))}),
      ]),
      catchError(error => [
        new RequestFailed(error),
        new SetServerError(error, null, 'Fetch users failed')]
      )
    ))
  );

  @Effect()
  getUsersEffect = this.actions$.pipe(
    ofType(actions.getUsers),
    withLatestFrom(
      this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
      this.store.select(modelsSelectors.selectTableFilters)
    ),
    switchMap(([action, projectId, filters]) => this.usersApi.usersGetAllEx({order_by: ['name'], only_fields: ['name'], active_in_projects: projectId !== '*' ? [projectId] : []})
      .pipe(
        mergeMap(res => {
          const userFiltersValue = get([MODELS_TABLE_COL_FIELDS.USER, 'value'], filters) || [];
          const resIds = res.users.map(user => user.id);
          const shouldGetFilteredUsersNames = !(userFiltersValue.every(id => resIds.includes(id)));
          return [
            actions.setUsers(res),
            shouldGetFilteredUsersNames ? actions.getFilteredUsers() : new EmptyAction(),
            new DeactiveLoader(action.type)
          ];
        }),
        catchError(error => [
          new RequestFailed(error),
          new DeactiveLoader(action.type),
          new SetServerError(error, null, 'Fetch users failed')]
        )
      )
    )
  );

  @Effect()
  getTagsEffect = this.actions$.pipe(
    ofType(actions.getTags),
    withLatestFrom(this.store.select(selectRouterParams).pipe(map(params => get('projectId', params)))),
    switchMap(([action, projectId]) => this.projectsApi.projectsGetModelTags({
      projects: projectId === '*' ? [] : [projectId]
    }).pipe(
      mergeMap(res => [
        actions.setTags({tags: res.tags.concat(null)}),
        new DeactiveLoader(action.type)
      ]),
      catchError(error => [
        new RequestFailed(error),
        new DeactiveLoader(action.type),
        new SetServerError(error, null, 'Fetch tags failed')]
      )
    ))
  );


  @Effect()
  refreshModels = this.actions$.pipe(
    ofType<actions.RefreshModels>(actions.REFRESH_MODELS),
    withLatestFrom(
      this.store.select(modelsSelectors.selectCurrentPage),
      this.store.select(modelsSelectors.selectSelectedModel),
      this.store.select(modelsSelectors.selectModelsList),
      this.store.select(selectAppVisible)),
    filter((values) => values[4]),
    switchMap(([action, page, selectedModel, models]) => this.fetchModels$(page, true)
      .pipe(
        mergeMap(res => {
          const resActions: Action[] = [new DeactiveLoader('Fetch Models')];
          if (selectedModel) {
            if (get('payload.hideLoader', action)) {
              resActions.push(new RefreshModelInfo(selectedModel.id));
            } else {
              resActions.push(new GetModelInfo(selectedModel.id));
            }
          }
          if (selectedModel && action.payload.autoRefresh && isEqual(models.map(model => model.id).sort(), res.models.map(model => model.id).sort())) {
            resActions.push(actions.setModelsInPlace({models: res.models}));
          } else {
            resActions.push(new actions.SetModels(res.models));
          }
          return resActions;
        }),
        catchError(error => [
          new RequestFailed(error),
          new DeactiveLoader('Fetch Models'),
          new SetServerError(error, null, 'Fetch Models failed', action.payload.autoRefresh)
        ])
      )
    )
  );
  @Effect()
  getModels = this.actions$.pipe(
    ofType<actions.GetNextModels>(actions.GET_NEXT_MODELS),
    withLatestFrom(this.store.select(modelsSelectors.selectCurrentPage)),
    switchMap(([action, page]) =>
      this.fetchModels$(page + 1)
        .pipe(
          mergeMap(res => [
            new actions.SetNoMoreModels((res.models.length < MODELS_PAGE_SIZE)),
            new actions.AddModels(res.models),
            new actions.SetCurrentPage(page + 1),
            new DeactiveLoader('Fetch Models')
          ]),
          catchError(error => [new RequestFailed(error), new DeactiveLoader('Fetch Models'), new SetServerError(error, null, 'Fetch Models failed')])
        )
    )
  );

  @Effect()
  showAllSelected = this.actions$.pipe(
    ofType<actions.ShowAllSelected>(actions.SHOW_ALL_SELECTED),
    mergeMap(action => [new actions.SetShowAllSelectedIsActive(action.payload), new actions.FetchModelsRequested()]),
  );

  @Effect()
  changeColumnsOrder = this.actions$.pipe(
    ofType(actions.changeColsOrder),
    withLatestFrom(this.store.select(selectRouterParams).pipe(map(params => get('projectId', params)))),
    mergeMap(([action, projectId]) => [actions.setColsOrderForProject({cols: action.cols, project: projectId})])
  );


  @Effect()
  updateModelsUrlParams = this.actions$.pipe(
    ofType(actions.setColsOrderForProject, actions.toggleColHidden),
    withLatestFrom(
      this.store.select(modelsSelectors.selectTableFilters),
      this.store.select(modelsSelectors.selectTableSortFields),
      this.store.select(selectIsArchivedMode),
      this.store.select(modelsSelectors.selectModelsTableColsOrder),
      this.store.select(modelsSelectors.selectModelsHiddenTableCols),
      this.store.select(selectIsDeepMode)
    ),
    mergeMap(([action, filters, sortFields, isArchived, colsOrder, hiddenCols, isDeep]) =>
      [setURLParams({
        filters: filters as any,
        orders: sortFields,
        isArchived,
        isDeep,
        columns: encodeColumns(MODELS_TABLE_COLS, hiddenCols, [], colsOrder)
      })]
    )
  );

  @Effect()
  modelSelectionChanged = this.actions$.pipe(
    ofType<actions.ModelSelectionChanged>(actions.MODEL_SELECTION_CHANGED),
    tap(action => this.navigateAfterModelSelectionChanged(action.payload.model, action.payload.project)),
    map(action => new actions.SetSelectedModel(action.payload.model))
  );


  @Effect()
  setArchiveMode = this.actions$.pipe(
    ofType(actions.setArchive),
    switchMap(action => [setProjectArchive(action), actions.afterSetArchive()])
  );

  getGetAllQuery(
    page: number, pageSize: number, projectId: string, searchQuery: ICommonSearchState['searchQuery'],
    isArchivedMode: boolean, orderFields: SortMeta[], tableFilters: { [key: string]: FilterMetadata }, ids: string[] = [], isDeepMode: boolean
  ): ModelsGetAllExRequest {
    const userFilter = get([EXPERIMENTS_TABLE_COL_FIELDS.USER, 'value'], tableFilters);
    const tagsFilter = get([MODELS_TABLE_COL_FIELDS.TAGS, 'value'], tableFilters);
    const systemTags = get(['system_tags', 'value'], tableFilters);
    const systemTagsFilter = (isArchivedMode ? [MODEL_TAGS.HIDDEN] : ['-' + MODEL_TAGS.HIDDEN])
      .concat(systemTags ? systemTags : []);
    return {
      id: ids,
      ...(searchQuery?.query && {_any_: {
        pattern: searchQuery.regExp ? searchQuery.query : escapeRegex(searchQuery.query),
        fields: ['id', 'name', 'comment', 'system_tags']
      }}),
      project: (!projectId || projectId === '*') ? undefined : [projectId],
      page: page,
      page_size: pageSize,
      include_subprojects: isDeepMode,
      order_by: encodeOrder(orderFields),
      system_tags: (systemTagsFilter && systemTagsFilter.length > 0) ? systemTagsFilter : [],
      tags: (tagsFilter && tagsFilter.length > 0) ? tagsFilter : [],
      only_fields: MODELS_ONLY_FIELDS,
      ready: this.getReadyFilter(tableFilters),
      framework: get([MODELS_TABLE_COL_FIELDS.FRAMEWORK, 'value'], tableFilters) || [],
      user: (userFilter && userFilter.length > 0) ? userFilter : []
    };
  }


  fetchModels$(page: number, getAllPages: boolean = false) {
    return of(page)
      .pipe(
        withLatestFrom(
          this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
          this.store.select(selectIsArchivedMode),
          this.store.select(modelsSelectors.selectGlobalFilter),
          this.store.select(modelsSelectors.selectTableSortFields),
          this.store.select(modelsSelectors.selectTableFilters),
          this.store.select(modelsSelectors.selectSelectedModels),
          this.store.select(modelsSelectors.selectShowAllSelectedIsActive),
          this.store.select(modelsSelectors.selectModelsTableColsOrder),
          this.store.select(modelsSelectors.selectModelsHiddenTableCols),
          this.store.select(selectIsDeepMode),
        ),
        switchMap(([pageNumber, projectId, isArchived, gb, sortFields, filters, selectedModels, showAllSelectedIsActive, colsOrder, hiddenCols, isDeep]) => {
          const selectedModelsIds = showAllSelectedIsActive ? selectedModels.map(exp => exp.id) : [];
          const pageToGet = getAllPages ? 0 : page;
          const pageSize = getAllPages ? (page + 1) * MODELS_PAGE_SIZE : MODELS_PAGE_SIZE;
          const columns = encodeColumns(MODELS_TABLE_COLS, hiddenCols, [], colsOrder);
          this.setModelsUrlParams(filters, sortFields, isArchived, columns, isDeep);
          return this.apiModels.modelsGetAllEx(this.getGetAllQuery(pageToGet, pageSize, projectId, gb, isArchived, sortFields, filters, selectedModelsIds, isDeep));
        })
      );
  }

  setSelectedModels = createEffect(() => {
      return this.actions$.pipe(
        ofType<actions.SetSelectedModels>(actions.SET_SELECTED_MODELS, actions.UPDATE_ONE_MODELS),
        withLatestFrom(
          this.store.select(selectSelectedModels),
        ),
        switchMap(([action, selectedModels]) => {
          const payload = action.type === actions.SET_SELECTED_MODELS ? action.payload : selectedModels;
          const selectedModelsDisableAvailable: Record<string, CountAvailableAndIsDisableSelectedFiltered> = {
            [MENU_ITEM_ID.PUBLISH]: selectionDisabledPublishModels(payload),
            [MENU_ITEM_ID.ARCHIVE]: selectionDisabledArchive(payload),
            [MENU_ITEM_ID.MOVE_TO]: selectionDisabledMoveTo(payload),
            [MENU_ITEM_ID.DELETE]: selectionDisabledDelete(payload),
            [MENU_ITEM_ID.TAGS]: selectionDisabledTags(payload),
          };
          return [setSelectedModelsDisableAvailable({selectedModelsDisableAvailable})];
        })
      );
    }
  );

  setModelsUrlParams(filters, sortFields, isArchived, columns, isDeep) {
    this.store.dispatch(setURLParams({filters, orders: sortFields, isArchived, columns: columns, isDeep}));
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

  navigateAfterModelSelectionChanged(selectedModel: SelectedModel, modelProject: string) {
    // wow angular really suck...
    const activeChild = get('firstChild.firstChild.firstChild.firstChild.firstChild.firstChild', this.route);
    const activeChildUrl = activeChild ? getRouteFullUrl(activeChild) : 'general';
    const baseUrl = 'projects/' + modelProject + '/models';
    selectedModel ?
      this.router.navigate([baseUrl + '/' + selectedModel.id + '/' + activeChildUrl], {queryParamsHandling: 'preserve'}) : this.router.navigate([baseUrl], {queryParamsHandling: 'preserve'});
  }

  isSelectedModelInCheckedModels(checkedModels, selectedModel) {
    return selectedModel && checkedModels.map(model => model.id).includes(selectedModel.id);
  }
}
