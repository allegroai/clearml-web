import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {flatten, get, isEqual} from 'lodash/fp';
import {EMPTY, of} from 'rxjs';
import {
  auditTime,
  catchError,
  expand,
  filter,
  map,
  mergeMap,
  reduce,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import {ApiModelsService} from '~/business-logic/api-services/models.service';
import {BlModelsService} from '~/business-logic/services/models.service';
import {requestFailed} from '../../core/actions/http.actions';
import {activeLoader, addMessage, deactivateLoader, setServerError} from '../../core/actions/layout.actions';
import {
  getFilteredUsers,
  setArchive as setProjectArchive,
  setProjectUsers
} from '../../core/actions/projects.actions';
import {setURLParams} from '../../core/actions/router.actions';
import {selectIsArchivedMode, selectIsDeepMode, selectSelectedProject} from '../../core/reducers/projects.reducer';
import {selectRouterParams} from '../../core/reducers/router-reducer';
import {selectAppVisible} from '../../core/reducers/view.reducer';
import {addMultipleSortColumns, getRouteFullUrl} from '../../shared/utils/shared-utils';
import {GetModelInfo, RefreshModelInfo} from '../actions/models-info.actions';
import * as actions from '../actions/models-view.actions';
import {setMetadataKeys, setSelectedModelsDisableAvailable} from '../actions/models-view.actions';
import {MODELS_PAGE_SIZE, MODELS_TABLE_COLS} from '../models.consts';
import * as modelsSelectors from '../reducers';
import {selectModelsList, selectSelectedModels, selectTableFilters, selectTableSortFields} from '../reducers';
import {IModelsViewState} from '../reducers/models-view.reducer';
import {MODEL_TAGS, MODELS_ONLY_FIELDS, MODELS_TABLE_COL_FIELDS} from '../shared/models.const';
import {SelectedModel} from '../shared/models.model';
import {ModelsGetAllExRequest} from '~/business-logic/model/models/modelsGetAllExRequest';
import {
  addExcludeFilters,
  createFiltersFromStore,
  encodeColumns,
  encodeOrder
} from '../../shared/utils/tableParamEncode';
import {EmptyAction} from '~/app.constants';
import {ApiProjectsService} from '~/business-logic/api-services/projects.service';
import {SearchState} from '../../common-search/common-search.reducer';
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
import {ModelsGetAllExResponse} from '~/business-logic/model/models/modelsGetAllExResponse';
import {ISmCol} from '../../shared/ui-components/data/table/table.consts';
import {hasValue} from '../../shared/utils/helpers.util';
import {ProjectsGetModelMetadataValuesResponse} from '~/business-logic/model/projects/projectsGetModelMetadataValuesResponse';
import {selectTableMode} from '../../experiments/reducers';
import {selectActiveWorkspaceReady} from '~/core/reducers/view.reducer';
import {escapeRegex} from '@common/shared/utils/escape-regex';
import {MESSAGES_SEVERITY} from '@common/constants';

@Injectable()
export class ModelsViewEffects {

  constructor(
    private actions$: Actions, private store: Store<IModelsViewState>, private apiModels: ApiModelsService,
    private projectsApi: ApiProjectsService, private modelBl: BlModelsService, private router: Router,
    private route: ActivatedRoute
  ) {}

  /* eslint-disable @typescript-eslint/naming-convention */

  activeLoader = createEffect(() => this.actions$.pipe(
    ofType(actions.getNextModels, actions.globalFilterChanged, actions.fetchModelsRequested),
    filter((action) => !(action as ReturnType<typeof actions.refreshModels>).hideLoader),
    map(() => activeLoader('Fetch Models'))
  ));

  tableSortChange = createEffect(() => this.actions$.pipe(
    ofType(actions.tableSortChanged),
    withLatestFrom(
      this.store.select(selectTableSortFields),
    ),
    switchMap(([action, oldOrders]) => {
      const orders = addMultipleSortColumns(oldOrders, action.colId, action.isShift);
      return [setURLParams({orders, update: true})];
    })
  ));

  tableFilterChange = createEffect(() => this.actions$.pipe(
    ofType(actions.tableFilterChanged),
    withLatestFrom(this.store.select(selectTableFilters)),
    switchMap(([action, oldFilters]) =>
      [setURLParams({
        filters: {
          ...oldFilters,
          ...action.filters.reduce((acc, updatedFilter) => {
            acc[updatedFilter.col] = {value: updatedFilter.value, matchMode: updatedFilter.filterMatchMode};
            return acc;
          }, {} as {[col: string]: FilterMetadata})
        }, update: true
      })]
    )
  ));

  getModelsMetadataValuesForKey = createEffect(() => this.actions$.pipe(
    ofType(actions.getModelsMetadataValuesForKey),
    withLatestFrom(
      this.store.select(selectIsDeepMode),
      this.store.select(selectSelectedProject)
    ),
    switchMap(([action, isDeep, selectedProject]) => {
      const projectId = action.col.projectId || selectedProject.id;
      return this.projectsApi.projectsGetModelMetadataValues ({
        include_subprojects: isDeep,
        key: action.col.key,
        ...(projectId !== '*' && {projects: [projectId]})
      }).pipe(
        map((data: ProjectsGetModelMetadataValuesResponse) => {
          const values = data.values.filter(x => hasValue(x) && x !== '');
          return actions.setMetadataColValuesOptions({col: action.col, values});
        }),
      );
    })
  ));

  reFetchModels = createEffect(() => this.actions$.pipe(
    ofType(
      actions.fetchModelsRequested, actions.getNextModelsWithPageSize, actions.globalFilterChanged, actions.showSelectedOnly,
    ),
    switchMap((action) => this.store.select(selectActiveWorkspaceReady).pipe(
      filter(ready => ready),
      map(() => action))),
    auditTime(100),
    switchMap((action) => this.fetchModels$(null, false, (action as any).pageSize as number)
      .pipe(
        mergeMap(res => [
          actions.setNoMoreModels({payload: (res.models.length < MODELS_PAGE_SIZE)}),
          actions.setModels({models: res.models}),
          actions.setCurrentScrollId({scrollId: res.scroll_id}),
          deactivateLoader('Fetch Models')
        ]),
        catchError(error => [
          requestFailed(error),
          deactivateLoader('Fetch Models'),
          addMessage('warn', 'Fetch Models for selection failed', [{name: 'More info', actions: [setServerError(error, null, 'Fetch Models for selection failed')]}])
        ])
      )
    )
  ));

  getFrameworksEffect = createEffect(() => this.actions$.pipe(
    ofType(actions.getFrameworks, actions.getAllProjectsFrameworks),
    withLatestFrom(
      this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
    ),
    switchMap(([action, projectId]) => this.apiModels.modelsGetFrameworks({projects: projectId !== '*' && action.type !==  actions.getAllProjectsFrameworks.type ? [projectId] : []})
      .pipe(
        mergeMap(res => [
          actions.setFrameworks({frameworks: res.frameworks.concat(null)}),
        ]),
        catchError(error => [
          requestFailed(error),
          addMessage('warn', 'Fetch frameworks failed', [{name: 'More info', actions: [setServerError(error, null, 'Fetch frameworks failed')]}])]
        )
      )
    )
  ));

  getUsersEffect = createEffect(() => this.actions$.pipe(
    ofType(setProjectUsers),
    withLatestFrom(this.store.select(modelsSelectors.selectTableFilters)),
    map(([action, filters]) => {
      const userFiltersValue = get([MODELS_TABLE_COL_FIELDS.USER, 'value'], filters) || [];
      const resIds = action.users.map(user => user.id);
      const shouldGetFilteredUsersNames = !(userFiltersValue.every(id => resIds.includes(id)));
      return shouldGetFilteredUsersNames ? getFilteredUsers({filteredUsers: userFiltersValue}) : new EmptyAction();
    })
  ));

  getTagsEffect = createEffect(() => this.actions$.pipe(
    ofType(actions.getTags, actions.getTagsForAllProjects),
    withLatestFrom(this.store.select(selectRouterParams).pipe(map(params => get('projectId', params)))),
    switchMap(([action, projectId]) => this.projectsApi.projectsGetModelTags({
      projects: (projectId === '*' ||  action.type=== actions.getTagsForAllProjects.type) ? [] : [projectId]
    }).pipe(
      mergeMap(res => [
        actions.setTags({tags: res.tags.concat(null)}),
        deactivateLoader('Fetch Models')
      ]),
      catchError(error => [
        requestFailed(error),
        deactivateLoader('Fetch Models'),
        addMessage('warn', 'Fetch tags failed', [{name: 'More info', actions: [setServerError(error, null, 'Fetch tags failed')]}])]
      )
    ))
  ));

  getMetadataKeysForProjectEffect = createEffect(() => this.actions$.pipe(
    ofType(actions.getMetadataKeysForProject),
    withLatestFrom(this.store.select(selectRouterParams).pipe(map(params => get('projectId', params)))),
    switchMap(([action, projectId]) => this.projectsApi.projectsGetModelMetadataKeys({
      project: projectId !== '*' ? projectId : null
    }).pipe(
      mergeMap(res => [
        setMetadataKeys({keys: res.keys}),
        deactivateLoader(action.type)
      ]),
      catchError(error => [
        requestFailed(error),
        deactivateLoader(action.type),
        addMessage('warn', '${action.type}failed', [{name: 'More info', actions: [setServerError(error, null, '${action.type} failed')]}])]
      )
    ))
  ));

  lockRefresh = false;
  refreshModels = createEffect(() => this.actions$.pipe(
    ofType(actions.refreshModels),
    filter(() => !this.lockRefresh),
    withLatestFrom(
      this.store.select(modelsSelectors.selectCurrentScrollId),
      this.store.select(modelsSelectors.selectSelectedModel),
      this.store.select(modelsSelectors.selectModelsList),
      this.store.select(selectAppVisible)),
    filter((values) => values[4]),
    switchMap(([action, scrollId, selectedModel, models]) => {
      this.lockRefresh = !action.autoRefresh;
      return this.fetchModels$(scrollId, true)
          .pipe(
            mergeMap(res => {
              this.lockRefresh = false;
              const resActions: Action[] = [deactivateLoader('Fetch Models')];
              if (selectedModel) {
                if (action.hideLoader || action.autoRefresh) {
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
            catchError(error => {
              this.lockRefresh = false;
              return [
                requestFailed(error),
                deactivateLoader('Fetch Models'),
                addMessage('warn', 'Fetch models failed', [{name: 'More info', actions: [setServerError(error, null, 'Fetch models failed')]}])
              ];
            })
          );
      }
    )
  ));

  getModels = createEffect(() => this.actions$.pipe(
    ofType(actions.getNextModels),
    withLatestFrom(
      this.store.select(modelsSelectors.selectCurrentScrollId),
      this.store.select(modelsSelectors.selectModelsList)
    ),
    switchMap(([, scrollId, modelsList]) => this.fetchModels$(scrollId)
      .pipe(
        mergeMap(res => {

          const addModelsAction = scrollId === res.scroll_id ?
            [actions.addModels({models: res.models})] :
            [actions.getNextModelsWithPageSize({pageSize: modelsList.length}), addMessage(MESSAGES_SEVERITY.WARN, 'Session expired')];

          return [
            actions.setNoMoreModels({payload: (res.models.length < MODELS_PAGE_SIZE)}),
            ...addModelsAction,
            actions.setCurrentScrollId({scrollId: res.scroll_id}),
            deactivateLoader('Fetch Models'),
          ];
        }),
        catchError(error => [
          requestFailed(error),
          deactivateLoader('Fetch Models'),
          addMessage('warn', 'Fetch models failed', [{name: 'More info', actions: [setServerError(error, null, 'Fetch models failed')]}])
        ])
      )
    )
  ));

  selectAll = createEffect(() => this.actions$.pipe(
    ofType(actions.selectAllModels),
    withLatestFrom(
      this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
      this.store.select(selectIsArchivedMode),
      this.store.select(modelsSelectors.selectGlobalFilter),
      this.store.select(modelsSelectors.selectTableFilters),
      this.store.select(selectIsDeepMode),
    ),
    switchMap(([action, projectId, archived, globalSearch, tableFilters, deep]) => {
      const pageSize = 1000;
      const query = this.getGetAllQuery({
        projectId, searchQuery: action.filtered && globalSearch, archived, orderFields: [{order: -1, field: MODELS_TABLE_COL_FIELDS.LAST_UPDATE}],
        filters: action.filtered ? tableFilters : {}, selectedIds: [], deep, pageSize
      });
      query.only_fields = [MODELS_TABLE_COL_FIELDS.NAME, MODELS_TABLE_COL_FIELDS.READY, 'company.id'];
      return this.apiModels.modelsGetAllEx(query).pipe(
        expand((res: ModelsGetAllExResponse) => res.models.length === pageSize ? this.apiModels.modelsGetAllEx({
          ...query,
          scroll_id: res.scroll_id
        }) : EMPTY),
        reduce((acc, res: ModelsGetAllExResponse) => acc.concat(res.models), [])
      );
    }),
    switchMap(models => [actions.setSelectedModels({models}), deactivateLoader('Fetch Models')]),
    catchError(error => [
      requestFailed(error),
      deactivateLoader('Fetch Models'),
      addMessage('warn', 'Fetch models failed', [{name: 'More info', actions: [setServerError(error, null, 'Fetch models failed')]}])
    ])
  ));

  updateModelsUrlParams = createEffect(() => this.actions$.pipe(
    ofType(actions.updateUrlParams, actions.toggleColHidden, actions.addColumn, actions.removeCol),
    filter(action => !(action as ReturnType<typeof actions.setColsOrderForProject>)?.fromUrl),
    withLatestFrom(
      this.store.select(modelsSelectors.selectTableFilters),
      this.store.select(modelsSelectors.selectTableSortFields),
      this.store.select(selectIsArchivedMode),
      this.store.select(modelsSelectors.selectMetadataColsForProject),
      this.store.select(modelsSelectors.selectModelsTableColsOrder),
      this.store.select(modelsSelectors.selectModelsHiddenTableCols),
      this.store.select(selectIsDeepMode)
    ),
    mergeMap(([, filters, sortFields, isArchived, metadataCols, colsOrder, hiddenCols, isDeep]) =>
      [setURLParams({
        filters: filters as any,
        orders: sortFields,
        isArchived,
        isDeep,
        columns: encodeColumns(MODELS_TABLE_COLS, hiddenCols, metadataCols, colsOrder)
      })]
    )
  ));

  modelSelectionChanged = createEffect(() => this.actions$.pipe(
    ofType(actions.modelSelectionChanged),
    tap(action => this.navigateAfterModelSelectionChanged(action.model, action.project)),
    mergeMap(() => [actions.setTableMode({mode: 'info'})])
    // map(action => actions.setSelectedModel({model: action.model}))
  ));
  selectNextModelEffect = createEffect(() => this.actions$.pipe(
    ofType(actions.selectNextModel),
    withLatestFrom(
      this.store.select(selectModelsList),
      this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
      this.store.select(selectTableMode)
    ),
    filter(([, , , tableMode])=>tableMode==='info'),
    tap(([, models, projectId]) => this.navigateAfterModelSelectionChanged(models[0] as SelectedModel, projectId)),
    mergeMap(() => [actions.setTableMode({mode: 'info'})])
  ));

  setArchiveMode = createEffect(() => this.actions$.pipe(
    ofType(actions.setArchive),
    switchMap(action => [setProjectArchive(action), setURLParams({isArchived: action.archive, update: true})])
  ));

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

  getGetAllQuery({
                   refreshScroll = false, scrollId = null, projectId, searchQuery, archived, orderFields,
                   filters, selectedIds = [], deep, pageSize = MODELS_PAGE_SIZE, cols = [], metaCols = []
                 }: {
    refreshScroll?: boolean;
    scrollId?: string;
    projectId: string;
    searchQuery: SearchState['searchQuery'];
    archived: boolean;
    orderFields: SortMeta[];
    filters: { [key: string]: FilterMetadata };
    selectedIds: string[];
    deep: boolean;
    pageSize: number;
    cols?: ISmCol[];
    metaCols?: ISmCol[];
  }): ModelsGetAllExRequest {
    const userFilter = filters?.[MODELS_TABLE_COL_FIELDS.USER]?.value;
    const projectFilter = filters?.[MODELS_TABLE_COL_FIELDS.PROJECT]?.value;
    const tagsFilter = filters?.[MODELS_TABLE_COL_FIELDS.TAGS]?.value;
    const tagsFilterAnd = filters?.[MODELS_TABLE_COL_FIELDS.TAGS]?.matchMode === 'AND';
    const systemTags = get(['system_tags', 'value'], filters);
    const frameworkFilter = filters?.[MODELS_TABLE_COL_FIELDS.FRAMEWORK]?.value;
    const ready = this.getReadyFilter(filters);
    const systemTagsFilter = (archived ? [MODEL_TAGS.HIDDEN] : ['-' + MODEL_TAGS.HIDDEN])
      .concat(systemTags ? systemTags : []);
    const colsFilters = flatten(cols.filter(col => col.id !== 'selected' && !col.hidden).map(col => col.getter || col.id));
    const metaColsFilters = metaCols ? flatten(metaCols.map(col => col.getter || col.id)) : [];
    const only_fields = [...new Set([...MODELS_ONLY_FIELDS, ...colsFilters, ...metaColsFilters])];
    const tableFilters = createFiltersFromStore(filters, true);

    return {
      id: selectedIds,
      ...tableFilters,
      ...(searchQuery?.query && {
        _any_: {
          pattern: searchQuery.regExp ? searchQuery.query : escapeRegex(searchQuery.query),
          fields: ['id', 'name', 'comment', 'system_tags']
        }
      }),
      project: (filters['project.name'] ? filters['project.name'].value : (!projectId || projectId === '*') ? undefined : [projectId]) as string[],
      scroll_id: scrollId || null, // null to create new scroll (undefined doesn't generate scroll)
      refresh_scroll: refreshScroll,
      size: pageSize,
      include_subprojects: deep && !projectFilter,
      order_by: encodeOrder(orderFields),
      system_tags: (systemTagsFilter && systemTagsFilter.length > 0) ? systemTagsFilter : [],
      only_fields,
      ...(tagsFilter?.length > 0 && {tags: addExcludeFilters(tagsFilterAnd ? ['__$and', ...tagsFilter] : tagsFilter)}),
      ...(frameworkFilter?.length > 0 && {framework: frameworkFilter}),
      ...(userFilter?.length > 0 && {user: userFilter}),
      ready: ready !== null ? ready : null
    };
  }


  fetchModels$(scrollId1: string, refreshScroll: boolean = false, pageSize = MODELS_PAGE_SIZE) {
    return of(scrollId1)
      .pipe(
        withLatestFrom(
          this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
          this.store.select(selectIsArchivedMode),
          this.store.select(modelsSelectors.selectMetadataColsForProject),
          this.store.select(modelsSelectors.selectGlobalFilter),
          this.store.select(modelsSelectors.selectTableSortFields),
          this.store.select(modelsSelectors.selectTableFilters),
          this.store.select(modelsSelectors.selectSelectedModels),
          this.store.select(modelsSelectors.selectShowAllSelectedIsActive),
          this.store.select(modelsSelectors.selectModelsTableColsOrder),
          this.store.select(modelsSelectors.selectModelsHiddenTableCols),
          this.store.select(modelsSelectors.selectModelTableColumns),
          this.store.select(selectIsDeepMode),
        ),
        switchMap(([scrollId, projectId, isArchived, metadataCols, gb, orderFields, filters, selectedModels, showAllSelectedIsActive, colsOrder, hiddenCols,cols ,deep]) => {
          const selectedIds = showAllSelectedIsActive ? selectedModels.map(exp => exp.id) : [];
          const columns = encodeColumns(MODELS_TABLE_COLS, hiddenCols, metadataCols, colsOrder);
          this.setModelsUrlParams(filters, orderFields, isArchived, columns, deep);
          return this.apiModels.modelsGetAllEx(this.getGetAllQuery({
            refreshScroll, scrollId, projectId, searchQuery: gb, archived: isArchived,
            orderFields, filters, selectedIds, deep, pageSize, cols, metaCols: metadataCols
          }));
        })
      );
  }

  setSelectedModels = createEffect(() => this.actions$.pipe(
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
    )
  );

  setModelsUrlParams(filters, sortFields, isArchived, columns, isDeep) {
    this.store.dispatch(setURLParams({filters, orders: sortFields, isArchived, columns, isDeep}));
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
