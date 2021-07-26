import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {get, isEqual, uniq} from 'lodash/fp';
import {of} from 'rxjs';
import {auditTime, catchError, filter, map, mergeMap, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {ApiModelsService} from '../../../business-logic/api-services/models.service';
import {BlModelsService} from '../../../business-logic/services/models.service';
import {requestFailed} from '../../core/actions/http.actions';
import {activeLoader, deactivateLoader, setServerError} from '../../core/actions/layout.actions';
import {setArchive as setProjectArchive} from '../../core/actions/projects.actions';
import {setURLParams} from '../../core/actions/router.actions';
import {selectIsArchivedMode, selectIsDeepMode, selectSelectedProjectId} from '../../core/reducers/projects.reducer';
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
import {ModelsGetAllExRequest} from '../../../business-logic/model/models/modelsGetAllExRequest';
import {encodeColumns, encodeOrder} from '../../shared/utils/tableParamEncode';
import {EmptyAction} from '../../../app.constants';
import {ApiProjectsService} from '../../../business-logic/api-services/projects.service';
import {ICommonSearchState} from '../../common-search/common-search.reducer';
import {SortMeta} from 'primeng/api';
import {
  CountAvailableAndIsDisableSelectedFiltered,
  MenuItems,
  selectionDisabledArchive,
  selectionDisabledDelete,
  selectionDisabledMoveTo,
  selectionDisabledPublishModels,
  selectionDisabledTags
} from '../../shared/entity-page/items.utils';
import {FilterMetadata} from 'primeng/api/filtermetadata';

@Injectable()
export class ModelsViewEffects {

  constructor(private actions$: Actions, private store: Store<IModelsViewState>,
              private apiModels: ApiModelsService, private projectsApi: ApiProjectsService, private modelBl: BlModelsService, private usersApi: ApiUsersService,
              private router: Router, private route: ActivatedRoute
  ) {
  }

  activeLoader = createEffect( () => this.actions$.pipe(
    ofType(actions.getNextModels, actions.globalFilterChanged, actions.fetchModelsRequested,
      actions.tableSortChanged, actions.tableFilterChanged, actions.refreshModels,
      actions.afterSetArchive, actions.getUsers, actions.setTableFilters),
    filter((action) => !(action as ReturnType<typeof actions.refreshModels>).hideLoader),
    map(() => activeLoader('Fetch Models'))
  ));

  tableSortChange = createEffect( () => this.actions$.pipe(
    ofType(actions.tableSortChanged),
    withLatestFrom(
      this.store.select(selectTableSortFields),
      this.store.select(selectSelectedProjectId),
    ),
    switchMap(([action, oldOrders, projectId]) => {
      const orders = addMultipleSortColumns(oldOrders, action.colId, action.isShift);
      return [actions.setTableSort({orders, projectId})];
    })
  ));

  reFetchModels = createEffect( () => this.actions$.pipe(
    ofType(
      actions.fetchModelsRequested, actions.globalFilterChanged, actions.showSelectedOnly,
      actions.tableSortChanged, actions.tableFilterChanged, actions.afterSetArchive.type,
      actions.setTableFilters
    ),
    auditTime(50),
    switchMap(() => this.fetchModels$(0)
      .pipe(
        mergeMap(res => [
          actions.setNoMoreModels({payload: (res.models.length < MODELS_PAGE_SIZE)}),
          actions.setModels({models: res.models}),
          actions.setCurrentPage({page: 0}),
          deactivateLoader('Fetch Models')
        ]),
        catchError(error => [requestFailed(error), deactivateLoader('Fetch Models'), setServerError(error, null, 'Fetch Models failed')])
      )
    )
  ));

  getFrameworksEffect = createEffect( () => this.actions$.pipe(
    ofType(actions.getFrameworks),
    withLatestFrom(
      this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
    ),
    switchMap(([, projectId]) => this.apiModels.modelsGetFrameworks({projects: projectId !== '*' ? [projectId] : []})
      .pipe(
        mergeMap(res => [
          actions.setFrameworks({frameworks: res.frameworks.concat(null)}),
        ]),
        catchError(error => [
          requestFailed(error),
          setServerError(error, null, 'Fetch frameworks failed')]
        )
      )
    )
  ));

  getFilteredUsersEffect = createEffect( () => this.actions$.pipe(
    ofType(actions.getFilteredUsers),
    withLatestFrom(this.store.select(modelsSelectors.selectModelsUsers), this.store.select(modelsSelectors.selectTableFilters)),
    switchMap(([, users, filters]) => this.usersApi.usersGetAllEx({
      order_by: ['name'],
      only_fields: ['name'],
      id: get(['user.name', 'value'], filters) || []
    }).pipe(
      mergeMap(res => [
        actions.setUsers({users: uniq(res.users.concat(users))}),
      ]),
      catchError(error => [
        requestFailed(error),
        setServerError(error, null, 'Fetch users failed')]
      )
    ))
  ));

  getUsersEffect = createEffect( () => this.actions$.pipe(
    ofType(actions.getUsers),
    withLatestFrom(
      this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
      this.store.select(modelsSelectors.selectTableFilters)
    ),
    switchMap(([action, projectId, filters]) => this.usersApi.usersGetAllEx({
      order_by: ['name'],
      only_fields: ['name'],
      active_in_projects: projectId !== '*' ? [projectId] : []
    }).pipe(
      mergeMap(res => {
        const userFiltersValue = get([MODELS_TABLE_COL_FIELDS.USER, 'value'], filters) || [];
        const resIds = res.users.map(user => user.id);
        const shouldGetFilteredUsersNames = !(userFiltersValue.every(id => resIds.includes(id)));
        return [
          actions.setUsers(res),
          shouldGetFilteredUsersNames ? actions.getFilteredUsers() : new EmptyAction(),
          deactivateLoader('Fetch Models')
        ];
      }),
      catchError(error => [
        requestFailed(error),
        deactivateLoader('Fetch Models'),
        setServerError(error, null, 'Fetch users failed')
      ])
    ))
  ));

  getTagsEffect = createEffect( () => this.actions$.pipe(
    ofType(actions.getTags),
    withLatestFrom(this.store.select(selectRouterParams).pipe(map(params => get('projectId', params)))),
    switchMap(([action, projectId]) => this.projectsApi.projectsGetModelTags({
      projects: projectId === '*' ? [] : [projectId]
    }).pipe(
      mergeMap(res => [
        actions.setTags({tags: res.tags.concat(null)}),
        deactivateLoader('Fetch Models')
      ]),
      catchError(error => [
        requestFailed(error),
        deactivateLoader('Fetch Models'),
        setServerError(error, null, 'Fetch tags failed')]
      )
    ))
  ));

  refreshModels = createEffect( () => this.actions$.pipe(
    ofType(actions.refreshModels),
    withLatestFrom(
      this.store.select(modelsSelectors.selectCurrentPage),
      this.store.select(modelsSelectors.selectSelectedModel),
      this.store.select(modelsSelectors.selectModelsList),
      this.store.select(selectAppVisible)),
    filter((values) => values[4]),
    switchMap(([action, page, selectedModel, models]) => this.fetchModels$(page, true)
      .pipe(
        mergeMap(res => {
          const resActions: Action[] = [deactivateLoader('Fetch Models')];
          if (selectedModel) {
            if (get('payload.hideLoader', action)) {
              resActions.push(new RefreshModelInfo(selectedModel.id));
            } else {
              resActions.push(new GetModelInfo(selectedModel.id));
            }
          }
          if (selectedModel && action.autoRefresh && isEqual(models.map(model => model.id).sort(), res.models.map(model => model.id).sort())) {
            resActions.push(actions.setModelsInPlace({models: res.models}));
          } else {
            resActions.push(actions.setModels({models: res.models}));
          }
          return resActions;
        }),
        catchError(error => [
          requestFailed(error),
          deactivateLoader('Fetch Models'),
          setServerError(error, null, 'Fetch Models failed', action.autoRefresh)
        ])
      )
    )
  ));

  getModels = createEffect( () => this.actions$.pipe(
    ofType(actions.getNextModels),
    withLatestFrom(this.store.select(modelsSelectors.selectCurrentPage)),
    switchMap(([, page]) =>
      this.fetchModels$(page + 1)
        .pipe(
          mergeMap(res => [
            actions.setNoMoreModels({payload: (res.models.length < MODELS_PAGE_SIZE)}),
            actions.addModels({models: res.models}),
            actions.setCurrentPage({page: page + 1}),
            deactivateLoader('Fetch Models')
          ]),
          catchError(error => [requestFailed(error), deactivateLoader('Fetch Models'), setServerError(error, null, 'Fetch Models failed')])
        )
    )
  ));

  updateModelsUrlParams = createEffect( () => this.actions$.pipe(
    ofType(actions.setColsOrderForProject, actions.toggleColHidden),
    filter(action => !(action as ReturnType<typeof actions.setColsOrderForProject>)?.fromUrl),
    withLatestFrom(
      this.store.select(modelsSelectors.selectTableFilters),
      this.store.select(modelsSelectors.selectTableSortFields),
      this.store.select(selectIsArchivedMode),
      this.store.select(modelsSelectors.selectModelsTableColsOrder),
      this.store.select(modelsSelectors.selectModelsHiddenTableCols),
      this.store.select(selectIsDeepMode)
    ),
    mergeMap(([, filters, sortFields, isArchived, colsOrder, hiddenCols, isDeep]) =>
      [setURLParams({
        filters: filters as any,
        orders: sortFields,
        isArchived,
        isDeep,
        columns: encodeColumns(MODELS_TABLE_COLS, hiddenCols, [], colsOrder)
      })]
    )
  ));

  modelSelectionChanged = createEffect( () => this.actions$.pipe(
    ofType(actions.modelSelectionChanged),
    tap(action => this.navigateAfterModelSelectionChanged(action.model, action.project)),
    mergeMap(() => [])
    // map(action => actions.setSelectedModel({model: action.model}))
  ));

  setArchiveMode = createEffect( () => this.actions$.pipe(
    ofType(actions.setArchive),
    switchMap(action => [setProjectArchive(action), actions.afterSetArchive()])
  ));

  getGetAllQuery(
    page: number, pageSize: number, projectId: string, searchQuery: ICommonSearchState['searchQuery'],
    isArchivedMode: boolean, orderFields: SortMeta[], tableFilters: { [key: string]: FilterMetadata }, ids: string[] = [], isDeepMode: boolean
  ): ModelsGetAllExRequest {
    const userFilter = get([MODELS_TABLE_COL_FIELDS.USER, 'value'], tableFilters);
    const tagsFilter = tableFilters?.[MODELS_TABLE_COL_FIELDS.TAGS]?.value;
    const tagsFilterAnd = tableFilters?.[MODELS_TABLE_COL_FIELDS.TAGS]?.matchMode === 'AND';
    const systemTags = get(['system_tags', 'value'], tableFilters);
    const frameworkFilter = get([MODELS_TABLE_COL_FIELDS.FRAMEWORK, 'value'], tableFilters);
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
      only_fields: MODELS_ONLY_FIELDS,
      ...(tagsFilter?.length > 0 && {tags: tagsFilterAnd ? ['__$and', ...tagsFilter] : tagsFilter}),
      ...(frameworkFilter?.length > 0 && {framework: frameworkFilter}),
      ...(userFilter?.length > 0 && {user: userFilter}),
      ready: this.getReadyFilter(tableFilters),
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
        switchMap(([, projectId, isArchived, gb, sortFields, filters, selectedModels, showAllSelectedIsActive, colsOrder, hiddenCols, isDeep]) => {
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
        ofType(actions.setSelectedModels, actions.updateModel),
        withLatestFrom(
          this.store.select(selectSelectedModels),
        ),
        switchMap(([action, selectedModels]) => {
          const payload = action.type === actions.setSelectedModels.type ?
            (action as ReturnType<typeof actions.setSelectedModels>).models : selectedModels;
          const selectedModelsDisableAvailable: Record<string, CountAvailableAndIsDisableSelectedFiltered> = {
            [MenuItems.publish]: selectionDisabledPublishModels(payload),
            [MenuItems.archive]: selectionDisabledArchive(payload),
            [MenuItems.moveTo]: selectionDisabledMoveTo(payload),
            [MenuItems.delete]: selectionDisabledDelete(payload),
            [MenuItems.tags]: selectionDisabledTags(payload),
          };
          return [setSelectedModelsDisableAvailable({selectedModelsDisableAvailable})];
        })
      );
    }
  );

  setModelsUrlParams(filters, sortFields, isArchived, columns, isDeep) {
    this.store.dispatch(setURLParams({filters, orders: sortFields, isArchived, columns, isDeep}));
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
