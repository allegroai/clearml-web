import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {cloneDeep, flatten, get, getOr, isEqual, uniq} from 'lodash/fp';
import {EMPTY, Observable, of} from 'rxjs';
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
import {ApiProjectsService} from '~/business-logic/api-services/projects.service';
import {ApiTasksService} from '~/business-logic/api-services/tasks.service';
import {BlTasksService} from '~/business-logic/services/tasks.service';
import {GET_ALL_QUERY_ANY_FIELDS} from '~/features/experiments/experiments.consts';
import {selectSelectedExperiment} from '~/features/experiments/reducers';
import {IExperimentsViewState} from '~/features/experiments/reducers/experiments-view.reducer';
import {excludeTypes, EXPERIMENTS_TABLE_COL_FIELDS} from '~/features/experiments/shared/experiments.const';
import {requestFailed} from '../../core/actions/http.actions';
import {activeLoader, addMessage, deactivateLoader, setServerError} from '../../core/actions/layout.actions';
import {setURLParams} from '../../core/actions/router.actions';
import {selectIsArchivedMode, selectIsDeepMode, selectSelectedProject} from '../../core/reducers/projects.reducer';
import {selectRouterConfig, selectRouterParams} from '../../core/reducers/router-reducer';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {ISmCol} from '../../shared/ui-components/data/table/table.consts';
import {addMultipleSortColumns, escapeRegex, getRouteFullUrl} from '../../shared/utils/shared-utils';
import {
  addExcludeFilters,
  createFiltersFromStore,
  decodeHyperParam,
  encodeColumns,
  encodeOrder,
  TableFilter
} from '../../shared/utils/tableParamEncode';
import {AutoRefreshExperimentInfo, GetExperimentInfo} from '../actions/common-experiments-info.actions';
import * as exActions from '../actions/common-experiments-view.actions';
import {setActiveParentsFilter, setParents, updateManyExperiment} from '../actions/common-experiments-view.actions';
import * as exSelectors from '../reducers/index';
import {ITableExperiment} from '../shared/common-experiment-model.model';
import {EXPERIMENTS_PAGE_SIZE} from '../shared/common-experiments.const';
import {convertDurationFilter, convertStopToComplete} from '../shared/common-experiments.utils';
import {ApiUsersService} from '~/business-logic/api-services/users.service';
import {sortByField} from '../../tasks/tasks.utils';
import {MODEL_TAGS} from '../../models/shared/models.const';
import {EmptyAction, MESSAGES_SEVERITY} from '~/app.constants';
import {selectExperimentsList, selectExperimentsUsers, selectTableFilters} from '../reducers';
import {ProjectsGetTaskParentsResponse} from '~/business-logic/model/projects/projectsGetTaskParentsResponse';
import {ProjectsGetTaskParentsRequest} from '~/business-logic/model/projects/projectsGetTaskParentsRequest';
import {ICommonSearchState} from '../../common-search/common-search.reducer';
import {SortMeta} from 'primeng/api';
import {hasValue} from '../../shared/utils/helpers.util';
import {ProjectsGetHyperParametersResponse} from '~/business-logic/model/projects/projectsGetHyperParametersResponse';
import {
  CountAvailableAndIsDisableSelectedFiltered,
  MenuItems,
  selectionDisabledAbort,
  selectionDisabledAbortAllChildren,
  selectionDisabledArchive,
  selectionDisabledContinue,
  selectionDisabledDelete,
  selectionDisabledDequeue,
  selectionDisabledEnqueue,
  selectionDisabledMoveTo,
  selectionDisabledPublishExperiments,
  selectionDisabledQueue,
  selectionDisabledReset,
  selectionDisabledTags,
  selectionDisabledViewWorker
} from '../../shared/entity-page/items.utils';
import {MINIMUM_ONLY_FIELDS} from '../experiment.consts';
import {ProjectsGetHyperparamValuesResponse} from '~/business-logic/model/projects/projectsGetHyperparamValuesResponse';
import {selectShowHidden} from '~/features/projects/projects.reducer';
import {TasksGetAllExRequest} from '~/business-logic/model/tasks/tasksGetAllExRequest';
import {TasksGetAllExResponse} from '~/business-logic/model/tasks/tasksGetAllExResponse';
import {selectIsCompare, selectIsPipelines} from '../../experiments-compare/reducers';
import {
  compareAddDialogTableSortChanged,
  compareAddTableClearAllFilters,
  compareAddTableFilterChanged,
  compareAddTableFilterInit
} from '../../experiments-compare/actions/compare-header.actions';
import {TaskTypeEnum} from '~/business-logic/model/tasks/taskTypeEnum';


@Injectable()
export class CommonExperimentsViewEffects {
  /* eslint-disable @typescript-eslint/naming-convention */
  constructor(
    private actions$: Actions, private store: Store<IExperimentsViewState>,
    private apiTasks: ApiTasksService, private projectsApi: ApiProjectsService, private usersApi: ApiUsersService,
    private taskBl: BlTasksService, private router: Router, private route: ActivatedRoute
  ) {
  }

  activeLoader = createEffect(() => this.actions$.pipe(
    ofType(
      exActions.getNextExperiments, exActions.getExperiments, exActions.globalFilterChanged, compareAddDialogTableSortChanged, compareAddTableFilterChanged, compareAddTableFilterInit,
      compareAddTableClearAllFilters, exActions.selectAllExperiments
    ),
    filter((action) => !(action as ReturnType<typeof exActions.refreshExperiments>).hideLoader),
    map(() => activeLoader('EXPERIMENTS_LIST'))
  ));

  tableSortChange = createEffect(() => this.actions$.pipe(
    ofType(exActions.tableSortChanged),
    withLatestFrom(this.store.select(exSelectors.selectTableSortFields)),
    switchMap(([action, oldOrders]) => {
      const orders = addMultipleSortColumns(oldOrders, action.colId, action.isShift);
      return [setURLParams({orders, update: true})];
    })
  ));

  tableFilterChange = createEffect(() => this.actions$.pipe(
    ofType(exActions.tableFilterChanged),
    withLatestFrom(this.store.select(exSelectors.selectTableFilters)),
    switchMap(([action, oldFilters]) =>
      [setURLParams({filters: {
          ...oldFilters,
          ...action.filters.reduce((acc, updatedFilter) => {
            acc[updatedFilter.col] = {value: updatedFilter.value, matchMode: updatedFilter.filterMatchMode};
            return acc;
          }, {} as {[col: string]: FilterMetadata})
        }, update: true})]
    )
  ));

  reFetchExperiment = createEffect(() => this.actions$.pipe(
    ofType(
      exActions.getExperiments, exActions.getExperimentsWithPageSize, exActions.globalFilterChanged, exActions.setTableSort,
      compareAddDialogTableSortChanged, compareAddTableFilterChanged, compareAddTableFilterInit, compareAddTableClearAllFilters,
      exActions.tableFilterChanged, exActions.setTableFilters,
      exActions.showOnlySelected
    ),
    auditTime(50),
    switchMap((action) => this.fetchExperiments$(null, false, (action as any).pageSize as number)
      .pipe(
        mergeMap(res => {
          res.tasks = convertStopToComplete(res.tasks);
          return [
            exActions.setNoMoreExperiments({payload: (res.tasks.length < EXPERIMENTS_PAGE_SIZE)}),
            exActions.setExperiments({experiments: res.tasks as ITableExperiment[]}),
            exActions.setCurrentScrollId({scrollId: res.scroll_id}),
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
    ofType<ReturnType<typeof exActions.refreshExperiments>>(exActions.refreshExperiments),
    withLatestFrom(
      this.store.select(exSelectors.selectCurrentScrollId),
      this.store.select(selectSelectedExperiment),
      this.store.select(selectExperimentsList)
    ),
    switchMap(([action, currentScrollId, selectedExperiment, experiments]) => this.fetchExperiments$(currentScrollId, true)
      .pipe(
        mergeMap(res => {
          res.tasks = convertStopToComplete(res.tasks);
          const actions: Action[] = [deactivateLoader('EXPERIMENTS_LIST')];
          if (selectedExperiment && action.autoRefresh && isEqual(experiments.map(exp => exp.id).sort(), res.tasks.map(exp => exp.id).sort())) {
            actions.push(exActions.setExperimentInPlace({experiments: res.tasks as ITableExperiment[]}));
          } else {
            // SetExperiments must be before GetExperimentInfo!
            actions.push(exActions.setExperiments({experiments: res.tasks as ITableExperiment[], noPreferences: true}));
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
    withLatestFrom(
      this.store.select(exSelectors.selectCurrentScrollId),
      this.store.select(selectExperimentsList)
    ),
    switchMap(([, scrollId, tasks]) => this.fetchExperiments$(scrollId)
      .pipe(
        mergeMap(res => {
          res.tasks = convertStopToComplete(res.tasks);
          const addTasksAction = scrollId === res.scroll_id
            ? [exActions.addExperiments({experiments: res.tasks as ITableExperiment[]})]
            : [exActions.getExperimentsWithPageSize({pageSize: tasks.length}), addMessage(MESSAGES_SEVERITY.WARN, 'Session expired')];

          return [
            exActions.setNoMoreExperiments({payload: (res.tasks.length < EXPERIMENTS_PAGE_SIZE)}),
            ...addTasksAction,
            exActions.setCurrentScrollId({scrollId: res.scroll_id}),
            deactivateLoader('EXPERIMENTS_LIST'),
          ];
        }),
        catchError(error => [
          requestFailed(error), deactivateLoader('EXPERIMENTS_LIST'), setServerError(error, null, 'Fetch Experiments failed')])
      )
    )
  ));

  experimentSelectionChanged = createEffect(() => this.actions$.pipe(
    ofType(exActions.experimentSelectionChanged),
    withLatestFrom(this.store.select(selectRouterConfig)),
    tap(([action, routeConfig]) => this.navigateAfterExperimentSelectionChanged(action.experiment as ITableExperiment, action.project, routeConfig)),
    mergeMap(() => [exActions.setTableMode({mode: 'info'})])
    // map(action => new exActions.SetSelectedExperiment(action.payload.experiment))
  ));


  getTypesEffect = createEffect(() => this.actions$.pipe(
    ofType(exActions.getProjectTypes),
    withLatestFrom(this.store.select(selectRouterParams).pipe(map(params => get('projectId', params)))),
    switchMap(([action, projectId]) => this.apiTasks.tasksGetTypes({projects: (projectId !== '*' ? [projectId] : [])}).pipe(
      withLatestFrom(this.store.select(exSelectors.selectTableFilters)),
      mergeMap(([res, tableFilters]) => {
        let shouldFilterFilters: boolean;
        let filteredTableFilter = {} as TableFilter;
        if (tableFilters?.type?.value) {
          filteredTableFilter = {
            col: 'type',
            value: tableFilters.type.value.filter(filterType => res.types.includes(filterType))
          };
          shouldFilterFilters = filteredTableFilter.value.length !== tableFilters.type.value.length;
        }
        return [
          shouldFilterFilters ? exActions.tableFilterChanged({
            filters: [filteredTableFilter],
            projectId
          }) : new EmptyAction(),
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
    }, null, 'body', true).pipe(
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
    switchMap(([, projectId, filters]) => this.usersApi.usersGetAllEx({
      order_by: ['name'],
      only_fields: ['name'],
      active_in_projects: projectId !== '*' ? [projectId] : []
    }, null, 'body', true).pipe(
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
    switchMap(([, projectId, isArchive]) => this.projectsApi.projectsGetTaskParents({
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
    switchMap(([action, projectId, isDeep]) => this.projectsApi.projectsGetUniqueMetricVariants({
        project: projectId === '*' ? null : projectId,
        include_subprojects: isDeep
      })
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
    withLatestFrom(this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))), this.store.select(selectIsDeepMode)),
    switchMap(([action, projectId, isDeep]) => this.projectsApi.projectsGetHyperParameters({
        project: projectId === '*' ? null : projectId,
        page_size: 5000,
        include_subprojects: isDeep
      })
        .pipe(
          mergeMap((res: ProjectsGetHyperParametersResponse) => [
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
    withLatestFrom(
      this.store.select(selectIsDeepMode),
      this.store.select(selectSelectedProject)
    ),
    switchMap(([action, isDeep, selectedProject]) => {
      const id = action.col.id;
      const getter = Array.isArray(action.col.getter) ? action.col.getter[0] : action.col.getter;
      const projectId = action.col.projectId || selectedProject.id;
      const {section, name} = decodeHyperParam(getter || id);
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

  selectAll = createEffect(() => this.actions$.pipe(
    ofType(exActions.selectAllExperiments),
    withLatestFrom(
      this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
      this.store.select(selectIsArchivedMode),
      this.store.select(exSelectors.selectGlobalFilter),
      this.store.select(exSelectors.selectTableFilters),
      this.store.select(selectIsDeepMode),
      this.store.select(selectShowHidden),
      this.store.select(selectIsPipelines),
    ),
    switchMap(([action, projectId, archived, globalSearch, tableFilters, deep, showHidden, isPipeline]) => {
      const pageSize = 1000;
      const query = this.getGetAllQuery({
        projectId, searchQuery: globalSearch, archived, tableFilters: action.filtered ? tableFilters : {},
        deep, showHidden, pageSize, isPipeline});
      query.only_fields = [EXPERIMENTS_TABLE_COL_FIELDS.NAME, EXPERIMENTS_TABLE_COL_FIELDS.PARENT,
        EXPERIMENTS_TABLE_COL_FIELDS.STATUS, EXPERIMENTS_TABLE_COL_FIELDS.TYPE, 'company.id', 'system_tags'];
      return this.apiTasks.tasksGetAllEx(query).pipe(
        expand((res: TasksGetAllExResponse)  => res.tasks.length === pageSize ? this.apiTasks.tasksGetAllEx({...query, scroll_id: res.scroll_id}): EMPTY),
        reduce((acc, res) => acc.concat(res.tasks), [])
      );
    }),
    switchMap(experiments => [exActions.setSelectedExperiments({experiments}), deactivateLoader('EXPERIMENTS_LIST')]),
    catchError(error => [
      requestFailed(error),
      deactivateLoader('EXPERIMENTS_LIST'),
      setServerError(error, null, 'Fetch experiments for selection failed'),
    ])
  ));

  setURLParams = createEffect(() => this.actions$.pipe(
    ofType(exActions.updateUrlParams, exActions.toggleColHidden),
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
    map(([, projectId, isArchived, , sortFields, filters,
           cols, hiddenCols, metricsCols, colsOrder, isDeep, queryParams
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

  navigateAfterExperimentSelectionChanged(selectedExperiment: ITableExperiment, experimentProject: string, routeConfig: string[]) {
    const module = routeConfig.includes('pipelines')? 'pipelines': 'projects'
    // wow angular really suck...
    const activeChild = get('firstChild.firstChild.firstChild.firstChild.firstChild.firstChild', this.route);
    const activeChildUrl = activeChild ? getRouteFullUrl(activeChild) : '';
    selectedExperiment ?
      this.router.navigate(
        [module, experimentProject, 'experiments', selectedExperiment.id].concat(activeChild ? activeChildUrl.split('/') : []),
        {queryParamsHandling: 'preserve'}
      ) :
      this.router.navigate([module, experimentProject, 'experiments'], {queryParamsHandling: 'preserve'});
  }

  getGetAllQuery({refreshScroll = false, scrollId = null, projectId, searchQuery, archived, orderFields = [],
                   tableFilters, selectedIds = [], cols = [], metricCols = [], deep = false, showHidden = false, isCompare,
                   isPipeline = false, pageSize = EXPERIMENTS_PAGE_SIZE}: {
    refreshScroll?: boolean;
    scrollId?: string;
    projectId: string;
    searchQuery?: ICommonSearchState['searchQuery'];
    archived: boolean;
    orderFields?: SortMeta[];
    tableFilters: { [columnId: string]: FilterMetadata };
    selectedIds?: string[];
    cols?: ISmCol[];
    metricCols?: ISmCol[];
    deep?: boolean;
    showHidden?: boolean;
    isCompare?: boolean;
    isPipeline?: boolean;
    pageSize?: number;
  }): TasksGetAllExRequest {
    const projectFilter = get([EXPERIMENTS_TABLE_COL_FIELDS.PROJECT, 'value'], tableFilters);
    const typeFilter = get([EXPERIMENTS_TABLE_COL_FIELDS.TYPE, 'value'], tableFilters);
    const statusFilter = get([EXPERIMENTS_TABLE_COL_FIELDS.STATUS, 'value'], tableFilters);
    const userFilter = get([EXPERIMENTS_TABLE_COL_FIELDS.USER, 'value'], tableFilters);
    const tagsFilter = tableFilters?.[EXPERIMENTS_TABLE_COL_FIELDS.TAGS]?.value;
    const tagsFilterAnd = tableFilters?.[EXPERIMENTS_TABLE_COL_FIELDS.TAGS]?.matchMode === 'AND';
    const parentFilter = get([EXPERIMENTS_TABLE_COL_FIELDS.PARENT, 'value'], tableFilters);
    const systemTags = get(['system_tags', 'value'], tableFilters);
    const systemTagsFilter = (archived ? [MODEL_TAGS.HIDDEN] : ['-' + MODEL_TAGS.HIDDEN])
      .concat(systemTags ? systemTags : []);

    let filters = createFiltersFromStore(tableFilters, true);
    filters = Object.keys(filters).reduce((acc, colId) => {
      const col = [...metricCols, ...cols].find(c => c.id === colId);
      let key = col?.getter || colId;
      if (Array.isArray(key)) {
        key = key[0];
      }
      acc[key] = filters[colId];
      return acc;
    }, {});

    if(filters[EXPERIMENTS_TABLE_COL_FIELDS.LAST_UPDATE]) {
      filters[EXPERIMENTS_TABLE_COL_FIELDS.LAST_UPDATE] = convertDurationFilter(filters[EXPERIMENTS_TABLE_COL_FIELDS.LAST_UPDATE]);
    }

    orderFields = orderFields.map(field => {
      const col = metricCols.find(c => c.id === field.field);
      const getter = Array.isArray(col?.getter) ? col.getter[0] : col?.getter;
      return getter ? {...field, field: getter} : field;
    });

    const colsFilters = flatten(cols.filter(col => col.id !== 'selected' && !col.hidden).map(col => col.getter || col.id));
    const metricColsFilters = metricCols ? flatten(metricCols.map(col => col.getter || col.id)) : [];
    const only_fields = [...new Set([...MINIMUM_ONLY_FIELDS, ...colsFilters, ...metricColsFilters].concat(isPipeline ? ['runtime._pipeline_hash', 'execution.queue', 'type', 'hyperparams.properties.version'] : []))];
    return {
      ...filters,
      id: selectedIds,
      ...(searchQuery?.query && {
        _any_: {
          pattern: searchQuery.regExp ? searchQuery.query : escapeRegex(searchQuery.query),
          fields: GET_ALL_QUERY_ANY_FIELDS
        }
      }),
      project: ((!filters['project.name'] && (!projectId || projectId === '*'))) ? undefined : isCompare ? ((filters['project.name'] || undefined)): (filters['project.name'] || [projectId]),
      scroll_id: scrollId || null, // null to create new scroll (undefined doesn't generate scroll)
      refresh_scroll: refreshScroll,
      size: pageSize,
      order_by: encodeOrder(orderFields),
      status: (statusFilter && statusFilter.length > 0) ? statusFilter : undefined,
      type: isPipeline ? [TaskTypeEnum.Controller] : (typeFilter?.length > 0) ? typeFilter : excludeTypes,
      user: (userFilter?.length > 0) ? userFilter : [],
      ...(parentFilter?.length > 0 && {parent: parentFilter}),
      system_tags: (systemTagsFilter && systemTagsFilter.length > 0) ? systemTagsFilter : [],
      ...(tagsFilter?.length > 0 && {tags: [(tagsFilterAnd ? '__$and' : '__$or'), ...addExcludeFilters(tagsFilter)] }),
      include_subprojects: deep && !projectFilter,
      search_hidden: showHidden,
      only_fields
    };
  }

  fetchExperiments$(scrollId1: string, refreshScroll: boolean = false, pageSize = EXPERIMENTS_PAGE_SIZE): Observable<TasksGetAllExResponse> {
    return of(scrollId1)
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
          this.store.select(exSelectors.selectExperimentsMetricsColsForProject),
          this.store.select(selectIsDeepMode),
          this.store.select(selectShowHidden),
          this.store.select(selectIsCompare),
          this.store.select(selectIsPipelines),
        ),
        switchMap(([
                     scrollId, projectId, isArchived, gb, orderFields, filters, selectedExperiments,
                     showAllSelectedIsActive, cols, metricCols, deep, showHidden, isCompare, isPipeline
                   ]) => {
          const tableFilters = cloneDeep(filters) || {} as { [key: string]: FilterMetadata };
          if (tableFilters && tableFilters.status && tableFilters.status.value.includes('completed')) {
            tableFilters.status.value.push('closed');
          }
          const selectedIds = showAllSelectedIsActive ? selectedExperiments.map(exp => exp.id) : [];
          return this.apiTasks.tasksGetAllEx(this.getGetAllQuery({
            refreshScroll, scrollId, projectId, searchQuery: gb, archived: isArchived, orderFields,
            tableFilters, selectedIds, cols, metricCols, deep, showHidden, isCompare, isPipeline, pageSize
          }));
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

  setSelectedExperiments = createEffect(() => this.actions$.pipe(
    ofType(exActions.setSelectedExperiments, exActions.updateExperiment, updateManyExperiment.type),
    withLatestFrom(
      this.store.select(exSelectors.selectSelectedExperiments),
    ),
    switchMap(([action, selectSelectedExperiments]) => {
      const payload = action.type === exActions.setSelectedExperiments.type ?
        (action as ReturnType<typeof exActions.setSelectedExperiments>).experiments : selectSelectedExperiments;
      const selectedExperimentsDisableAvailable: Record<string, CountAvailableAndIsDisableSelectedFiltered> = {
        [MenuItems.abort]: selectionDisabledAbort(payload),
        [MenuItems.abortAllChildren]: selectionDisabledAbortAllChildren(payload),
        [MenuItems.publish]: selectionDisabledPublishExperiments(payload),
        [MenuItems.reset]: selectionDisabledReset(payload),
        [MenuItems.delete]: selectionDisabledDelete(payload),
        [MenuItems.moveTo]: selectionDisabledMoveTo(payload),
        [MenuItems.continue]: selectionDisabledContinue(payload),
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
    )
  );
}
