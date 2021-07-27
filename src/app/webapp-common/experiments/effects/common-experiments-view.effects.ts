import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {cloneDeep, flatten, get, getOr, isEqual, uniq} from 'lodash/fp';
import {Observable, of} from 'rxjs';
import {auditTime, catchError, filter, map, mergeMap, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {ApiProjectsService} from '../../../business-logic/api-services/projects.service';
import {ApiTasksService} from '../../../business-logic/api-services/tasks.service';
import {TasksGetAllExResponse} from '../../../business-logic/model/tasks/tasksGetAllExResponse';
import {BlTasksService} from '../../../business-logic/services/tasks.service';
import {GET_ALL_QUERY_ANY_FIELDS} from '../../../features/experiments/experiments.consts';
import {selectSelectedExperiment} from '../../../features/experiments/reducers';
import {IExperimentsViewState} from '../../../features/experiments/reducers/experiments-view.reducer';
import {EXPERIMENTS_TABLE_COL_FIELDS} from '../../../features/experiments/shared/experiments.const';
import {requestFailed} from '../../core/actions/http.actions';
import {activeLoader, deactivateLoader, setServerError} from '../../core/actions/layout.actions';
import {setArchive as setProjectArchive} from '../../core/actions/projects.actions';
import {setURLParams} from '../../core/actions/router.actions';
import {selectIsArchivedMode, selectIsDeepMode, selectSelectedProjectId} from '../../core/reducers/projects.reducer';
import {selectRouterParams} from '../../core/reducers/router-reducer';
import {selectAppVisible} from '../../core/reducers/view-reducer';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {ISmCol} from '../../shared/ui-components/data/table/table.consts';
import {addMultipleSortColumns, escapeRegex, getRouteFullUrl} from '../../shared/utils/shared-utils';
import {decodeHyperParam, encodeColumns, encodeOrder} from '../../shared/utils/tableParamEncode';
import {AutoRefreshExperimentInfo, GetExperimentInfo} from '../actions/common-experiments-info.actions';
import * as exActions from '../actions/common-experiments-view.actions';
import {
  setActiveParentsFilter,
  setParents,
  updateManyExperiment
} from '../actions/common-experiments-view.actions';
import * as exSelectors from '../reducers/index';
import {ITableExperiment} from '../shared/common-experiment-model.model';
import {EXPERIMENTS_PAGE_SIZE} from '../shared/common-experiments.const';
import {convertStopToComplete} from '../shared/common-experiments.utils';
import {ApiUsersService} from '../../../business-logic/api-services/users.service';
import {sortByField} from '../../tasks/tasks.utils';
import {MODEL_TAGS} from '../../models/shared/models.const';
import {EmptyAction} from '../../../app.constants';
import {selectExperimentsList, selectExperimentsUsers, selectTableFilters, selectTableSortFields} from '../reducers';
import {ProjectsGetTaskParentsResponse} from '../../../business-logic/model/projects/projectsGetTaskParentsResponse';
import {ProjectsGetTaskParentsRequest} from '../../../business-logic/model/projects/projectsGetTaskParentsRequest';
import {ICommonSearchState} from '../../common-search/common-search.reducer';
import {SortMeta} from 'primeng/api';
import {hasValue} from '../../shared/utils/helpers.util';
import {TasksGetAllExRequest} from '../../../business-logic/model/tasks/tasksGetAllExRequest';
import {ProjectsGetHyperParametersResponse} from '../../../business-logic/model/projects/projectsGetHyperParametersResponse';
import {
  CountAvailableAndIsDisableSelectedFiltered, MenuItems,
  selectionDisabledAbort, selectionDisabledArchive,
  selectionDisabledDelete, selectionDisabledDequeue,
  selectionDisabledEnqueue,
  selectionDisabledMoveTo,
  selectionDisabledPublishExperiments, selectionDisabledQueue,
  selectionDisabledReset, selectionDisabledTags, selectionDisabledViewWorker
} from '../../shared/entity-page/items.utils';
import { MINIMUM_ONLY_FIELDS } from '../experiment.consts';
import {ProjectsGetHyperparamValuesResponse} from '../../../business-logic/model/projects/projectsGetHyperparamValuesResponse';
import {selectShowHidden} from "../../projects/common-projects.reducer";


export const createFiltersFromStore = (_tableFilters: { [key: string]: FilterMetadata }, removeEmptyValues = true) => {
  if (!_tableFilters) {
    return [];
  }
  return  Object.keys(_tableFilters).reduce( (returnTableFilters, currentFilterName) => {
    const value = get([currentFilterName, 'value'], _tableFilters);
    if (removeEmptyValues && (!hasValue(value) || value?.length === 0)) {
      return returnTableFilters;
    }
    returnTableFilters[currentFilterName] = value;
    return returnTableFilters;
  }, {});
};

@Injectable()
export class CommonExperimentsViewEffects {

  constructor(
    private actions$: Actions, private store: Store<IExperimentsViewState>,
    private apiTasks: ApiTasksService, private projectsApi: ApiProjectsService, private usersApi: ApiUsersService,
    private taskBl: BlTasksService, private router: Router, private route: ActivatedRoute
  ) {
  }

  activeLoader = createEffect(() => this.actions$.pipe(
    ofType(exActions.getNextExperiments, exActions.getExperiments,
      exActions.globalFilterChanged, exActions.tableSortChanged, exActions.tableFilterChanged,
      exActions.refreshExperiments, exActions.afterSetArchive),
    filter((action) => !(action as ReturnType<typeof exActions.refreshExperiments>).hideLoader),
    map(() => activeLoader('EXPERIMENTS_LIST'))
  ));

  tableSortChange = createEffect(() => this.actions$.pipe(
    ofType(exActions.tableSortChanged),
    withLatestFrom(
      this.store.select(selectTableSortFields),
      this.store.select(selectSelectedProjectId)
    ),
    switchMap(([action, oldOrders, projectId]) => {
      const orders = addMultipleSortColumns(oldOrders, action.colId, action.isShift);
      return [exActions.setTableSort({orders, projectId})];
    })
  ));

  reFetchParents = createEffect(() => this.actions$.pipe(
    ofType(exActions.afterSetArchive.type),
    map(() => exActions.getParents())
  ));

  reFetchExperiment = createEffect(() => this.actions$.pipe(
    ofType(
      exActions.getExperiments, exActions.globalFilterChanged, exActions.setTableSort,
      exActions.tableFilterChanged, exActions.setTableFilters, exActions.afterSetArchive,
      exActions.showOnlySelected
    ),
    auditTime(50),
    switchMap((action) => this.fetchExperiments$(0)
      .pipe(
        mergeMap(res => {
          res.tasks = convertStopToComplete(res.tasks);
          return [
            exActions.setNoMoreExperiments({payload: (res.tasks.length < EXPERIMENTS_PAGE_SIZE)}),
            exActions.setExperiments({experiments: res.tasks as ITableExperiment[]}),
            exActions.setCurrentPage({page: 0}),
            deactivateLoader('EXPERIMENTS_LIST')
          ];
        }),
        catchError(error => [
          requestFailed(error),
          deactivateLoader('EXPERIMENTS_LIST'),
          setServerError(error, null, 'Fetch Experiments failed', getOr(false, 'payload.autoRefresh', action))
        ])
      )
    )
  ));

  refreshExperiments = createEffect(() => this.actions$.pipe(
    ofType<ReturnType<typeof exActions.refreshExperiments>>(exActions.refreshExperiments, exActions.addColumn, exActions.toggleColHidden),
    withLatestFrom(
      this.store.select(exSelectors.selectCurrentPage),
      this.store.select(selectSelectedExperiment),
      this.store.select(selectExperimentsList),
      this.store.select(selectAppVisible),
      this.store.select(exSelectors.selectExperimentsHiddenTableCols)),
    filter(([action, currentPage, selectedExperiment, experiments, visible, hiddenCols]) => {
      const isToggleToHiddenCol = action.type !== exActions.toggleColHidden.type || !hiddenCols[(action as any).payload];
      return visible && isToggleToHiddenCol;
    }),
    switchMap(([action, currentPage, selectedExperiment, experiments]) => this.fetchExperiments$(currentPage, true)
      .pipe(
        mergeMap(res => {
          res.tasks = convertStopToComplete(res.tasks);
          const actions: Action[] = [deactivateLoader('EXPERIMENTS_LIST')];
          if (selectedExperiment && action.autoRefresh && isEqual(experiments.map(exp => exp.id).sort(), res.tasks.map(exp => exp.id).sort())) {
            actions.push(exActions.setExperimentInPlace({experiments: res.tasks as ITableExperiment[]}));
          } else {
            // SetExperiments must be before GetExperimentInfo!
            actions.push(exActions.setExperiments({experiments: res.tasks as ITableExperiment[]}));
          }
          if (selectedExperiment) {
            if (action.autoRefresh) {
              actions.push(new AutoRefreshExperimentInfo(selectedExperiment.id));
            } else {
              // SetExperiments must be before GetExperimentInfo!
              actions.push(new GetExperimentInfo(selectedExperiment.id));
            }
          }
          return actions;
        }),
        catchError(error => [
          requestFailed(error),
          deactivateLoader('EXPERIMENTS_LIST'),
          setServerError(error, null, 'Fetch Experiments failed', action.autoRefresh)
        ])
      )
    )
  ));

  getNextExperiments = createEffect(() => this.actions$.pipe(
    ofType(exActions.getNextExperiments),
    withLatestFrom(this.store.select(exSelectors.selectCurrentPage)),
    switchMap(([action, page]) => this.fetchExperiments$(page + 1)
      .pipe(
        mergeMap(res => {
          res.tasks = convertStopToComplete(res.tasks);
          return [
            exActions.setNoMoreExperiments({payload: (res.tasks.length < EXPERIMENTS_PAGE_SIZE)}),
            exActions.addExperiments({experiments: res.tasks as ITableExperiment[]}),
            exActions.setCurrentPage({page: page + 1}),
            deactivateLoader('EXPERIMENTS_LIST')
          ];
        }),
        catchError(error => [
          requestFailed(error), deactivateLoader('EXPERIMENTS_LIST'), setServerError(error, null, 'Fetch Experiments failed')])
      )
    )
  ));

  experimentSelectionChanged = createEffect(() => this.actions$.pipe(
    ofType(exActions.experimentSelectionChanged),
    tap(action => this.navigateAfterExperimentSelectionChanged(action.experiment as ITableExperiment, action.project)),
    mergeMap(() => [])
    // map(action => new exActions.SetSelectedExperiment(action.payload.experiment))
  ));


  getTypesEffect = createEffect(() => this.actions$.pipe(
    ofType(exActions.getProjectTypes),
    withLatestFrom(this.store.select(selectRouterParams).pipe(map(params => get('projectId', params)))),
    switchMap(([action, projectId]) => this.apiTasks.tasksGetTypes({projects: (projectId !== '*' ? [projectId] : [])}).pipe(
      withLatestFrom(this.store.select(exSelectors.selectTableFilters)),
      mergeMap(([res, tableFilters]) => {
        let shouldFilterFilters: boolean;
        let filteredTableFilters: any = {};
        if (tableFilters?.type?.value) {
          filteredTableFilters = {
            col: 'type',
            value: tableFilters.type.value.filter(filterType => res.types.includes(filterType))
          };
          shouldFilterFilters = filteredTableFilters.value.length !== tableFilters.type.value.length;
        }
        return [
          shouldFilterFilters ? exActions.tableFilterChanged({filter: filteredTableFilters, projectId}) : new EmptyAction(),
          exActions.setProjectsTypes(res),
          deactivateLoader(action.type)
        ];
      }),
      catchError(error => [
        requestFailed(error),
        deactivateLoader(action.type),
        setServerError(error, null, 'Fetch types failed')]
      )
    ))));

  getFilteredUsersEffect = createEffect(() => this.actions$.pipe(
    ofType(exActions.getFilteredUsers),
    withLatestFrom(this.store.select(selectExperimentsUsers), this.store.select(selectTableFilters)),
    switchMap(([action, users, filters]) => this.usersApi.usersGetAllEx({
      order_by: ['name'],
      only_fields: ['name'],
      id: getOr([], ['user.name', 'value'], filters)
    }).pipe(
      mergeMap(res => [
        exActions.setUsers({users: uniq(res.users.concat(users))}),
        deactivateLoader(action.type)
      ]),
      catchError(error => [
        requestFailed(error),
        deactivateLoader(action.type),
        setServerError(error, null, 'Fetch users failed')]
      )
    ))
  ));

  getUsersEffect = createEffect(() => this.actions$.pipe(
    ofType(exActions.getUsers),
    withLatestFrom(
      this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
      this.store.select(selectTableFilters)),
    switchMap(([action, projectId, filters]) => this.usersApi.usersGetAllEx({
      order_by: ['name'],
      only_fields: ['name'],
      active_in_projects: projectId !== '*' ? [projectId] : []
    }).pipe(
      mergeMap(res => {
        const userFiltersValue = get([EXPERIMENTS_TABLE_COL_FIELDS.USER, 'value'], filters) || [];
        const resIds = res.users.map(user => user.id);
        const shouldGetFilteredUsersNames = !(userFiltersValue.every(id => resIds.includes(id)));
        return [
          exActions.setUsers(res),
          shouldGetFilteredUsersNames ? exActions.getFilteredUsers() : new EmptyAction(),
        ];
      }),
      catchError(error => [
        requestFailed(error),
        setServerError(error, null, 'Fetch users failed')]
      )
    ))
  ));

  getParentsEffect = createEffect(() => this.actions$.pipe(
    ofType(exActions.getParents),
    withLatestFrom(
      this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
      this.store.select(selectIsArchivedMode)
    ),
    switchMap(([action, projectId, isArchive]) => this.projectsApi.projectsGetTaskParents({
      projects: projectId !== '*' ? [projectId] : [],
      tasks_state: isArchive ?
        ProjectsGetTaskParentsRequest.TasksStateEnum.Archived :
        ProjectsGetTaskParentsRequest.TasksStateEnum.Active
    }).pipe(
      withLatestFrom(this.store.select(selectTableFilters).pipe(map(filters => filters?.['parent.name']?.value || []))),
      mergeMap(([res, filteredParentIds]: [ProjectsGetTaskParentsResponse, string[]]) => {
        const missingParentsIds = filteredParentIds.filter(parentId => !res.parents.find(parent => (parent as any).id === parentId));
        return (missingParentsIds.length ? this.apiTasks.tasksGetAllEx({
          id: missingParentsIds,
          only_fields: ['name', 'project.name']
        }) : of({tasks: []})).pipe(
          mergeMap((parentsTasks) => [
            setActiveParentsFilter({parents: parentsTasks.tasks || []}),
            setParents({parents: res.parents})])
        );
      }),
      catchError(error => [
        requestFailed(error),
        setServerError(error, null, 'Fetch parents failed')]
      )
    ))
  ));

  getCustomMetrics = createEffect(() => this.actions$.pipe(
    ofType(exActions.getCustomMetrics),
    withLatestFrom(
      this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
      this.store.select(selectIsDeepMode)
    ),
    switchMap(([action, projectId, isDeep]) => this.projectsApi.projectsGetUniqueMetricVariants({project: projectId === '*' ? null : projectId, include_subprojects: isDeep})
      .pipe(
        mergeMap(res => [
          exActions.setCustomMetrics({metrics: sortByField(res.metrics, 'metric')}),
          deactivateLoader(action.type)
        ]),
        catchError(error => [
          requestFailed(error),
          deactivateLoader(action.type),
          setServerError(error, null, 'Fetch custom metrics failed'),
          exActions.setCustomHyperParams({params: []})])
      )
    )
  ));

  getCustomHyperParams = createEffect(() => this.actions$.pipe(
    ofType(exActions.getCustomHyperParams),
    withLatestFrom(this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),this.store.select(selectIsDeepMode)),
    switchMap(([action, projectId, isDeep]) => this.projectsApi.projectsGetHyperParameters({
        project: projectId === '*' ? null : projectId,
        page_size: 1000,
        include_subprojects: isDeep
      })
      .pipe(
        mergeMap((res: ProjectsGetHyperParametersResponse)  => [
          exActions.setCustomHyperParams({params: res.parameters}),
          deactivateLoader(action.type)
        ]),
        catchError(error => [
          requestFailed(error),
          deactivateLoader(action.type),
          setServerError(error, null, 'Fetch hyper parameters failed'),
          exActions.setCustomHyperParams({params: []})])
      )
    )
  ));

  hyperParameterMenuClicked = createEffect(() => this.actions$.pipe(
    ofType(exActions.hyperParamSelectedExperiments),
    withLatestFrom(this.store.select(selectIsDeepMode)),
    switchMap(([action, isDeep]) => {
      const {projectId, id} = action.col;
      const {section, name} = decodeHyperParam(id);
      return this.projectsApi.projectsGetHyperparamValues({
        include_subprojects: isDeep, section, name,
        ...(projectId !== '*' && {projects: [projectId]})
      }).pipe(
        map((data: ProjectsGetHyperparamValuesResponse) => {
          const values = data.values.filter(x => hasValue(x) && x !== '');
          return exActions.hyperParamSelectedInfoExperiments({col: action.col, values});
        }),
      );
    })
  ));

  setArchiveMode = createEffect(() => this.actions$.pipe(
    ofType(exActions.setArchive),
    switchMap(action => [setProjectArchive(action), exActions.afterSetArchive()])
  ));

  setURLParams = createEffect(() => this.actions$.pipe(
    ofType(exActions.removeCol, exActions.toggleColHidden, exActions.setColsOrderForProject),
    filter(action => !(action as ReturnType<typeof exActions.setColsOrderForProject>)?.fromUrl),
    withLatestFrom(
      this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
      this.store.select(selectIsArchivedMode),
      this.store.select(exSelectors.selectGlobalFilter),
      this.store.select(exSelectors.selectTableSortFields),
      this.store.select(exSelectors.selectTableFilters),
      this.store.select(exSelectors.selectExperimentsTableCols),
      this.store.select(exSelectors.selectExperimentsHiddenTableCols),
      this.store.select(exSelectors.selectExperimentsMetricsCols),
      this.store.select(exSelectors.selectExperimentsTableColsOrder),
      this.store.select(selectIsDeepMode),
      this.route.queryParams
    ),
    map(([, projectId, isArchived, gb, sortFields, filters,
           cols, hiddenCols, metricsCols, colsOrder,isDeep, queryParams
         ]) => {
      const columns = encodeColumns(cols, hiddenCols, this.filterColumns(projectId, metricsCols), colsOrder ? colsOrder : queryParams.columns);
      return setURLParams({
        columns,
        filters,
        orders: sortFields,
        isArchived,
        isDeep
      });
    })
  ));

  navigateAfterExperimentSelectionChanged(selectedExperiment: ITableExperiment, experimentProject: string) {
    // wow angular really suck...
    const activeChild = get('firstChild.firstChild.firstChild.firstChild.firstChild.firstChild', this.route);
    const activeChildUrl = activeChild ? getRouteFullUrl(activeChild) : '';
    const baseUrl = 'projects/' + experimentProject + '/experiments';
    selectedExperiment ?
      this.router.navigate([baseUrl + '/' + selectedExperiment.id + '/' + activeChildUrl], {queryParamsHandling: 'preserve'}) : this.router.navigate([baseUrl], {queryParamsHandling: 'preserve'});
  }

  getGetAllQuery(
    getAllPages: boolean, page: number, projectId: string, searchQuery: ICommonSearchState['searchQuery'],
    isArchivedMode: boolean, orderFields: SortMeta[],
    tableFilters: { [key: string]: FilterMetadata }, ids: string[] = [], cols?: ISmCol[],
    metricCols?: ISmCol[], isDeepMode: boolean = false, showHidden: boolean = false
  ): TasksGetAllExRequest {
    const typeFilter = get([EXPERIMENTS_TABLE_COL_FIELDS.TYPE, 'value'], tableFilters);
    const statusFilter = get([EXPERIMENTS_TABLE_COL_FIELDS.STATUS, 'value'], tableFilters);
    const userFilter = get([EXPERIMENTS_TABLE_COL_FIELDS.USER, 'value'], tableFilters);
    const tagsFilter = tableFilters?.[EXPERIMENTS_TABLE_COL_FIELDS.TAGS]?.value;
    const tagsFilterAnd = tableFilters?.[EXPERIMENTS_TABLE_COL_FIELDS.TAGS]?.matchMode === 'AND' ;
    const parentFilter = get([EXPERIMENTS_TABLE_COL_FIELDS.PARENT, 'value'], tableFilters);
    const systemTags = get(['system_tags', 'value'], tableFilters);
    const systemTagsFilter = (isArchivedMode ? [MODEL_TAGS.HIDDEN] : ['-' + MODEL_TAGS.HIDDEN])
      .concat(systemTags ? systemTags : []);
    const pageToGet = getAllPages ? 0 : page;
    const pageSizeToGet = getAllPages ? (page + 1) * EXPERIMENTS_PAGE_SIZE : EXPERIMENTS_PAGE_SIZE;

    let filters = createFiltersFromStore(tableFilters, true);
    filters = Object.keys(filters).reduce((reduce, colId) => {
      const col = metricCols.find(col => col.id === colId);
      let key = col?.getter || colId;
      if (Array.isArray(key)) {
        key = key[0];
      }
      reduce[key] = filters[colId];
      return reduce;
    }, {});

    orderFields = orderFields.map(field => {
      const col = metricCols.find(col => col.id === field.field);
      const getter = Array.isArray(col?.getter) ? col.getter[0] : col?.getter;
      return getter ? {...field, field: getter} : field;
    });

    const colsFilters = flatten(cols.filter(col => col.id !== 'selected' && !col.hidden).map(col => col.getter || col.id));
    const metricColsFilters = metricCols ? flatten(metricCols.map(col => col.getter || col.id)) : [];
    const only_fields = [...new Set([...MINIMUM_ONLY_FIELDS, ...colsFilters, ...metricColsFilters])];

    return {
      ...filters,
      id: ids,
      ...(searchQuery?.query && {
        _any_: {
          pattern: searchQuery.regExp ? searchQuery.query : escapeRegex(searchQuery.query),
          fields: GET_ALL_QUERY_ANY_FIELDS
        }
      }),
      project: (!projectId || projectId === '*') ? undefined : [projectId],
      page: pageToGet,
      page_size: pageSizeToGet,
      order_by: encodeOrder(orderFields),
      status: (statusFilter && statusFilter.length > 0) ? statusFilter : undefined,
      type: (typeFilter && typeFilter.length > 0) ? typeFilter : ['__$not', 'annotation_manual', '__$not', 'annotation', '__$not', 'dataset_import'],
      user: (userFilter && userFilter.length > 0) ? userFilter : [],
      ...(parentFilter?.length > 0 && {parent: parentFilter}),
      system_tags: (systemTagsFilter && systemTagsFilter.length > 0) ? systemTagsFilter : [],
      ...(tagsFilter?.length > 0 && {tags: tagsFilterAnd ? ['__$and', ...tagsFilter] : tagsFilter}),
      include_subprojects: isDeepMode,
      search_hidden: showHidden,
      only_fields
    };
  }

  fetchExperiments$(page: number, getAllPages: boolean = false): Observable<TasksGetAllExResponse> {
    return of(page)
      .pipe(
        withLatestFrom(
          this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
          this.store.select(selectIsArchivedMode),
          this.store.select(exSelectors.selectGlobalFilter),
          this.store.select(exSelectors.selectTableSortFields),
          this.store.select(exSelectors.selectTableFilters),
          this.store.select(exSelectors.selectSelectedExperiments),
          this.store.select(exSelectors.selectShowAllSelectedIsActive),
          this.store.select(exSelectors.selectExperimentsTableCols),
          this.store.select(exSelectors.selectExperimentsHiddenTableCols),
          this.store.select(exSelectors.selectExperimentsMetricsColsForProject),
          this.store.select(exSelectors.selectExperimentsTableColsOrder),
          this.store.select(selectIsDeepMode),
          this.store.select(selectShowHidden),
          this.route.queryParams
        ),
        switchMap(([
                     pageNumber, projectId, isArchived, gb, sortField, filters, selectedExperiments,
                     showAllSelectedIsActive, cols, hiddenCols, metricsCols, colsOrder, deep, showHidden, queryParams
                   ]) => {
          const myFilters = cloneDeep(filters) || {} as { [key: string]: FilterMetadata };
          if (myFilters && myFilters.status && myFilters.status.value.includes('completed')) {
            myFilters.status.value.push('closed');
          }
          const selectedExperimentsIds = showAllSelectedIsActive ? selectedExperiments.map(exp => exp.id) : [];
          const columns = encodeColumns(cols, hiddenCols, this.filterColumns(projectId, metricsCols), colsOrder ? colsOrder : queryParams.columns);
          this.store.dispatch(setURLParams({
            columns,
            filters,
            orders: sortField,
            isArchived,
            isDeep: deep
          }));
          return this.apiTasks.tasksGetAllEx(this.getGetAllQuery(getAllPages, pageNumber,
            projectId, gb, isArchived, sortField, myFilters, selectedExperimentsIds,
            cols, metricsCols, deep, showHidden));
        })
      );
  }

  private filterColumns(projectId: string, metricsCols: any) {
    return metricsCols.filter(col => col.projectId === projectId);
  }

  getTagsEffect = createEffect(() => this.actions$.pipe(
    ofType(exActions.getTags),
    withLatestFrom(this.store.select(selectRouterParams).pipe(map(params => get('projectId', params)))),
    switchMap(([action, projectId]) => this.projectsApi.projectsGetTaskTags({
      projects: projectId === '*' ? [] : [projectId]
    }).pipe(
      mergeMap(res => [
        exActions.setTags({tags: res.tags.concat(null)}),
        deactivateLoader(action.type)
      ]),
      catchError(error => [
        requestFailed(error),
        deactivateLoader(action.type),
        setServerError(error, null, 'Fetch tags failed')]
      )
    ))
  ));

  setSelectedExperiments = createEffect(() => {
      return this.actions$.pipe(
        ofType(exActions.setSelectedExperiments, exActions.updateExperiment, updateManyExperiment.type),
        withLatestFrom(
          this.store.select(exSelectors.selectSelectedExperiments),
        ),
        switchMap(([action, selectSelectedExperiments]) => {
          const payload = action.type === exActions.setSelectedExperiments.type ?
            (action as ReturnType<typeof exActions.setSelectedExperiments>).experiments : selectSelectedExperiments;
          const selectedExperimentsDisableAvailable: Record<string, CountAvailableAndIsDisableSelectedFiltered> = {
            [MenuItems.abort]: selectionDisabledAbort(payload),
            [MenuItems.publish]: selectionDisabledPublishExperiments(payload),
            [MenuItems.reset]: selectionDisabledReset(payload),
            [MenuItems.delete]: selectionDisabledDelete(payload),
            [MenuItems.moveTo]: selectionDisabledMoveTo(payload),
            [MenuItems.enqueue]: selectionDisabledEnqueue(payload),
            [MenuItems.dequeue]: selectionDisabledDequeue(payload),
            [MenuItems.queue]: selectionDisabledQueue(payload),
            [MenuItems.viewWorker]: selectionDisabledViewWorker(payload),
            [MenuItems.archive]: selectionDisabledArchive(payload),
            [MenuItems.tags]: selectionDisabledTags(payload),
          };
          //allHasExamples: selectionAllExamples(action.payload),
           // allArchive: selectionAllIsArchive(action.payload),
          return [exActions.setSelectedExperimentsDisableAvailable({selectedExperimentsDisableAvailable})];
        })
      );
    }
  );
}
