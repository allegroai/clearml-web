import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {cloneDeep, flatten, get, isEqual} from 'lodash/fp';
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
import {ExperimentsViewState} from '~/features/experiments/reducers/experiments-view.reducer';
import {excludeTypes, EXPERIMENTS_TABLE_COL_FIELDS} from '~/features/experiments/shared/experiments.const';
import {requestFailed} from '../../core/actions/http.actions';
import {activeLoader, addMessage, deactivateLoader, setServerError} from '../../core/actions/layout.actions';
import {setURLParams} from '../../core/actions/router.actions';
import {
    selectIsArchivedMode,
    selectIsDeepMode,
    selectSelectedProject, selectShowHidden
} from '../../core/reducers/projects.reducer';
import {selectRouterConfig, selectRouterParams} from '../../core/reducers/router-reducer';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {ISmCol} from '../../shared/ui-components/data/table/table.consts';
import {addMultipleSortColumns, getRouteFullUrl} from '../../shared/utils/shared-utils';
import {
  addExcludeFilters,
  createFiltersFromStore,
  decodeHyperParam,
  encodeColumns,
  encodeOrder,
  TableFilter
} from '../../shared/utils/tableParamEncode';
import {autoRefreshExperimentInfo, getExperimentInfo} from '../actions/common-experiments-info.actions';
import * as exActions from '../actions/common-experiments-view.actions';
import {setActiveParentsFilter, setParents, updateManyExperiment} from '../actions/common-experiments-view.actions';
import * as exSelectors from '../reducers/index';
import {ITableExperiment} from '../shared/common-experiment-model.model';
import {EXPERIMENTS_PAGE_SIZE} from '../shared/common-experiments.const';
import {convertStopToComplete, encodeHyperParameter} from '../shared/common-experiments.utils';
import {sortByField} from '../../tasks/tasks.utils';
import {MODEL_TAGS} from '../../models/shared/models.const';
import {EmptyAction} from '~/app.constants';
import {selectExperimentsList, selectTableFilters, selectTableMode} from '../reducers';
import {ProjectsGetTaskParentsResponse} from '~/business-logic/model/projects/projectsGetTaskParentsResponse';
import {ProjectsGetTaskParentsRequest} from '~/business-logic/model/projects/projectsGetTaskParentsRequest';
import {SearchState} from '../../common-search/common-search.reducer';
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
import {TasksGetAllExRequest} from '~/business-logic/model/tasks/tasksGetAllExRequest';
import {TasksGetAllExResponse} from '~/business-logic/model/tasks/tasksGetAllExResponse';
import {selectIsCompare, selectIsDatasets, selectIsPipelines} from '../../experiments-compare/reducers';
import {
  compareAddDialogTableSortChanged,
  compareAddTableClearAllFilters,
  compareAddTableFilterChanged,
  compareAddTableFilterInit
} from '../../experiments-compare/actions/compare-header.actions';
import {TaskTypeEnum} from '~/business-logic/model/tasks/taskTypeEnum';
import {getFilteredUsers, setProjectUsers} from '@common/core/actions/projects.actions';
import {selectTableRefreshList} from '../reducers/index';
import {selectActiveWorkspaceReady} from '~/core/reducers/view.reducer';
import {escapeRegex} from '@common/shared/utils/escape-regex';
import {MESSAGES_SEVERITY} from '@common/constants';


@Injectable()
export class CommonExperimentsViewEffects {
  /* eslint-disable @typescript-eslint/naming-convention */
  constructor(
    private actions$: Actions, private store: Store<ExperimentsViewState>, private apiTasks: ApiTasksService,
    private projectsApi: ApiProjectsService, private taskBl: BlTasksService, private router: Router,
    private route: ActivatedRoute
  ) {
  }

  activeLoader = createEffect(() => this.actions$.pipe(
    ofType(
      exActions.getNextExperiments, exActions.getExperiments, exActions.globalFilterChanged, compareAddDialogTableSortChanged, compareAddTableFilterChanged,
      compareAddTableClearAllFilters, exActions.selectAllExperiments
    ),
    filter((action) => !(action as ReturnType<typeof exActions.refreshExperiments>).hideLoader),
    map(action => activeLoader(action.type))
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
      [setURLParams({
        filters: {
          ...oldFilters,
          ...action.filters.reduce((acc, updatedFilter) => {
            acc[updatedFilter.col] = {value: updatedFilter.value, matchMode: updatedFilter.filterMatchMode};
            return acc;
          }, {} as { [col: string]: FilterMetadata })
        }, update: true
      })]
    )
  ));

  private refreshActions = [];

  reFetchExperiment = createEffect(() => this.actions$.pipe(
    ofType(
      exActions.getExperiments, exActions.getExperimentsWithPageSize, exActions.globalFilterChanged, exActions.setTableSort,
      compareAddDialogTableSortChanged, compareAddTableFilterChanged, compareAddTableFilterInit, compareAddTableClearAllFilters,
      exActions.tableFilterChanged, exActions.setTableFilters,
      exActions.showOnlySelected
    ),
    switchMap((action) => this.store.select(selectActiveWorkspaceReady).pipe(
      filter(ready => ready),
      map(() => action))),
    tap(action => this.refreshActions.push(action.type)),
    auditTime(50),
    switchMap((action) => this.fetchExperiments$(null, false, (action as any).pageSize as number)
      .pipe(
        mergeMap(res => {
          res.tasks = convertStopToComplete(res.tasks);
          const deactivate = this.refreshActions.map(a => deactivateLoader(a));
          this.refreshActions = [];
          return [
            exActions.setNoMoreExperiments({hasMore: (res.tasks.length < EXPERIMENTS_PAGE_SIZE)}),
            exActions.setExperiments({experiments: res.tasks as ITableExperiment[]}),
            exActions.setCurrentScrollId({scrollId: res.scroll_id}),
            ...deactivate
          ];
        }),
        catchError(error => [
          requestFailed(error),
          deactivateLoader(action.type),
          addMessage('warn', 'Fetch Experiments failed', error?.meta && [{name: 'More info', actions: [setServerError(error, null, 'Fetch Experiments failed')]}])
        ])
      )
    )
  ));

  lockRefresh = false;
  refreshExperiments = createEffect(() => this.actions$.pipe(
    ofType(exActions.refreshExperiments),
    filter(() => !this.lockRefresh),
    withLatestFrom(
      this.store.select(exSelectors.selectCurrentScrollId),
      this.store.select(selectSelectedExperiment),
      this.store.select(selectExperimentsList),
      this.store.select(selectTableRefreshList)
    ),
    switchMap(([action, currentScrollId, selectedExperiment, experiments, refreshPending]) => {
        this.lockRefresh = !action.autoRefresh;
        return this.fetchExperiments$(currentScrollId, true)
          .pipe(
            mergeMap(res => {
              res.tasks = convertStopToComplete(res.tasks);
              this.lockRefresh = false;
              const actions: Action[] = [deactivateLoader(action.type)];
              if (refreshPending) {
                return [
                  exActions.getExperimentsWithPageSize({pageSize: experiments.length}),
                  exActions.setTableRefreshPending({refresh: false}),
                  deactivateLoader(action.type)
                ];
              }
              if (res.scroll_id !== currentScrollId) {
                actions.push(
                  exActions.setCurrentScrollId({scrollId: res.scroll_id}),
                  exActions.setNoMoreExperiments({hasMore: (res.tasks.length < EXPERIMENTS_PAGE_SIZE)}));
                if (!action.autoRefresh) {
                  actions.push(
                    addMessage(MESSAGES_SEVERITY.WARN, 'Session expired'),
                    exActions.setTableRefreshPending({refresh: true}));
                }
              }
              if (action.autoRefresh || res.scroll_id === currentScrollId) {
                if (selectedExperiment && isEqual(experiments.map(exp => exp.id).sort(), res.tasks.map(exp => exp.id).sort())) {
                  actions.push(exActions.setExperimentInPlace({experiments: res.tasks as ITableExperiment[]}));
                } else {
                  // SetExperiments must be before GetExperimentInfo!
                  actions.push(exActions.setExperiments({experiments: res.tasks as ITableExperiment[], noPreferences: true}));
                }
              }
              if (selectedExperiment) {
                if (action.autoRefresh) {
                  actions.push(autoRefreshExperimentInfo({id: selectedExperiment.id}));
                } else {
                  // SetExperiments must be before GetExperimentInfo!
                  actions.push(getExperimentInfo({id: selectedExperiment.id}));
                }
              }
              return actions;
            }),
            catchError(error => {
              this.lockRefresh = false;
              return [
                requestFailed(error),
                deactivateLoader(action.type),
                ...(action.autoRefresh ? [] : [addMessage('warn', 'Fetch Experiments failed', error?.meta && [{name: 'More info', actions: [setServerError(error, null, 'Fetch Experiments failed')]}])])
              ];
            })
          );
      }
    )
  ));

  getNextExperiments = createEffect(() => this.actions$.pipe(
    ofType(exActions.getNextExperiments),
    withLatestFrom(
      this.store.select(exSelectors.selectCurrentScrollId),
      this.store.select(selectExperimentsList),
      this.store.select(selectTableRefreshList)
    ),
    switchMap(([action, scrollId, tasks, refreshPending]) => this.fetchExperiments$(scrollId)
      .pipe(
        mergeMap(res => {
          if (refreshPending) {
            return [
              exActions.getExperimentsWithPageSize({pageSize: tasks.length}),
              exActions.setTableRefreshPending({refresh: false}),
              deactivateLoader(action.type)
            ];
          }
          res.tasks = convertStopToComplete(res.tasks);
          const addTasksAction = scrollId === res.scroll_id
            ? [exActions.addExperiments({experiments: res.tasks as ITableExperiment[]})]
            : [exActions.setTableRefreshPending({refresh: true}), addMessage(MESSAGES_SEVERITY.WARN, 'Session expired')];

          return [
            exActions.setNoMoreExperiments({hasMore: (res.tasks.length < EXPERIMENTS_PAGE_SIZE)}),
            ...addTasksAction,
            exActions.setCurrentScrollId({scrollId: res.scroll_id}),
            deactivateLoader(action.type),
          ];
        }),
        catchError(error => [
          requestFailed(error),
          deactivateLoader(action.type),
          addMessage('warn', 'Fetch Experiments failed', error?.meta && [{name: 'More info', actions: [setServerError(error, null, 'Fetch Experiments failed')]}])
        ])
      )
    )
  ));

  experimentSelectionChanged = createEffect(() => this.actions$.pipe(
    ofType(exActions.experimentSelectionChanged),
    withLatestFrom(this.store.select(selectRouterConfig)),
    tap(([action, routeConfig]) =>
      this.navigateAfterExperimentSelectionChanged(action.experiment as ITableExperiment, action.project, routeConfig, action.replaceURL)),
    mergeMap(() => [exActions.setTableMode({mode: 'info'})])
  ));

  selectNextExperimentEffect = createEffect(() => this.actions$.pipe(
    ofType(exActions.selectNextExperiment),
    withLatestFrom(this.store.select(selectRouterConfig),
      this.store.select(selectExperimentsList),
      this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
      this.store.select(selectTableMode)
    ),
    filter(([, , , , tableMode]) => tableMode === 'info'),
    tap(([, routeConfig, tasks, projectId]) => this.navigateAfterExperimentSelectionChanged(tasks[0] as ITableExperiment, projectId, routeConfig)),
    mergeMap(() => [exActions.setTableMode({mode: 'info'})])
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
        addMessage('warn', 'Fetch types failed', error?.meta && [{name: 'More info', actions: [setServerError(error, null, 'Fetch types failed')]}])]
      )
    ))));

  getUsersEffect = createEffect(() => this.actions$.pipe(
    ofType(setProjectUsers),
    withLatestFrom(this.store.select(selectTableFilters)),
    map(([action, filters]) => {
      const userFiltersValue = get([EXPERIMENTS_TABLE_COL_FIELDS.USER, 'value'], filters) || [];
      const resIds = action.users.map(user => user.id);
      const shouldGetFilteredUsersNames = !(userFiltersValue.every(id => resIds.includes(id)));
      return shouldGetFilteredUsersNames ? getFilteredUsers({filteredUsers: userFiltersValue}) : new EmptyAction();
    }),
    catchError(error => [
      requestFailed(error),
      addMessage('warn', 'Fetch users failed', error?.meta && [{name: 'More info', actions: [setServerError(error, null, 'Fetch users failed')]}])]
    )
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
          addMessage('warn', 'Fetch parents failed', error?.meta && [{name: 'More info', actions: [setServerError(error, null, 'Fetch parents failed')]}])
        ]
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
            addMessage('warn', 'Fetch custom metrics failed', error?.meta && [{name: 'More info', actions: [setServerError(error, null, 'Fetch custom metrics failed')]}]),
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
            addMessage('warn', 'Fetch hyper parameters failed', error?.meta && [{name: 'More info', actions: [setServerError(error, null, 'Fetch hyper parameters failed')]}]),
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
      this.store.select(selectIsDatasets),
    ),
    switchMap(([action, projectId, archived, globalSearch, tableFilters, deep, showHidden, isPipeline, isDataset]) => {
      const pageSize = 5000;
      const query = this.getGetAllQuery({
        projectId,
        searchQuery: globalSearch,
        archived,
        tableFilters: action.filtered ? tableFilters : {},
        orderFields: [{order: -1, field: EXPERIMENTS_TABLE_COL_FIELDS.LAST_UPDATE}],
        deep,
        showHidden,
        pageSize,
        isPipeline,
        isDataset
      });
      query.only_fields = [EXPERIMENTS_TABLE_COL_FIELDS.NAME, EXPERIMENTS_TABLE_COL_FIELDS.PARENT,
        EXPERIMENTS_TABLE_COL_FIELDS.STATUS, EXPERIMENTS_TABLE_COL_FIELDS.TYPE, 'company.id', 'system_tags'];
      return this.apiTasks.tasksGetAllEx(query).pipe(
        expand((res: TasksGetAllExResponse) => res.tasks.length === pageSize ? this.apiTasks.tasksGetAllEx({
          ...query,
          scroll_id: res.scroll_id
        }) : EMPTY),
        reduce((acc, res) => acc.concat(res.tasks), [])
      );
    }),
    switchMap(experiments => [exActions.setSelectedExperiments({experiments}), deactivateLoader(exActions.selectAllExperiments.type)]),
    catchError(error => [
      requestFailed(error),
      deactivateLoader(exActions.selectAllExperiments.type),
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

  navigateAfterExperimentSelectionChanged(selectedExperiment: ITableExperiment, experimentProject: string, routeConfig: string[], replaceUrl=false) {
    const module = routeConfig.includes('datasets') ? 'datasets/simple' : routeConfig.includes('pipelines') ? 'pipelines' : 'projects';
    // wow angular really suck...
    const activeChild = get('firstChild.firstChild.firstChild.firstChild.firstChild.firstChild', this.route);
    const activeChildUrl = activeChild ? getRouteFullUrl(activeChild) : '';
    selectedExperiment ?
      this.router.navigate(
        [module, experimentProject, 'experiments', selectedExperiment.id].concat(activeChild ? activeChildUrl.split('/') : []),
        {queryParamsHandling: 'preserve'}
      ) :
      this.router.navigate([module, experimentProject, 'experiments'], {queryParamsHandling: 'preserve', replaceUrl});
  }

  getGetAllQuery({
                   refreshScroll = false,
                   scrollId = null,
                   projectId,
                   searchQuery,
                   archived,
                   orderFields = [],
                   tableFilters,
                   selectedIds = [],
                   cols = [],
                   metricCols = [],
                   deep = false,
                   showHidden = false,
                   isCompare,
                   isPipeline = false,
                   isDataset = false,
                   pageSize = EXPERIMENTS_PAGE_SIZE
                 }: {
    refreshScroll?: boolean;
    scrollId?: string;
    projectId: string;
    searchQuery?: SearchState['searchQuery'];
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
    isDataset?: boolean;
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

    const systemTagsFilter = (archived ? ['__$and', MODEL_TAGS.HIDDEN] : ['__$and', '__$not', MODEL_TAGS.HIDDEN])
      .concat(systemTags ? systemTags : []).concat((isPipeline || isDataset || showHidden) ? [] : ['__$not', 'pipeline'])
      .concat(isDataset? ['dataset']: []);

    let filters = createFiltersFromStore(tableFilters, true);
    filters = Object.keys(filters).reduce((acc, colId) => {
      const col = [...metricCols, ...cols].find(c => c.id === colId);
      let key = col?.getter || colId;
      if (col?.isParam && typeof col.getter === 'string') {
        key = encodeHyperParameter(col.getter);
      }
      if (Array.isArray(key)) {
        key = key[0];
      }
      acc[key] = filters[colId];
      return acc;
    }, {});

    orderFields = orderFields.map(field => {
      let getter;
      const col = metricCols.find(c => c.id === field.field);
      if (col?.isParam && typeof col.getter === 'string') {
        getter = encodeHyperParameter(col.getter);
      } else {
        getter = Array.isArray(col?.getter) ? col.getter[0] : col?.getter;
      }
      return getter ? {...field, field: getter} : field;
    });

    const colsFilters = flatten(cols.filter(col => col.id !== 'selected' && !col.hidden).map(col => col.getter || col.id));
    const metricColsFilters = metricCols ? flatten(metricCols.map(col =>
      (col?.isParam && typeof col.getter === 'string')  ? encodeHyperParameter(col.getter) : col.getter || col.id)) : [];
    const only_fields = [...new Set([...MINIMUM_ONLY_FIELDS, ...colsFilters, ...metricColsFilters]
      .concat(isPipeline || isDataset ? ['runtime._pipeline_hash', 'runtime.version', 'execution.queue', 'type', 'hyperparams.properties.version'] : []))];
    return {
      ...filters,
      id: selectedIds,
      ...(searchQuery?.query && {
        _any_: {
          pattern: searchQuery.regExp ? searchQuery.query : escapeRegex(searchQuery.query),
          fields: GET_ALL_QUERY_ANY_FIELDS
        }
      }),
      project: ((!filters['project.name'] && (!projectId || projectId === '*'))) ? undefined : isCompare ? ((filters['project.name'] || undefined)) : (filters['project.name'] || [projectId]),
      scroll_id: scrollId || null, // null to create new scroll (undefined doesn't generate scroll)
      refresh_scroll: refreshScroll,
      size: pageSize,
      order_by: encodeOrder(orderFields),
      status: (statusFilter && statusFilter.length > 0) ? statusFilter : undefined,
      type: isPipeline ? [TaskTypeEnum.Controller] : isDataset ? [TaskTypeEnum.DataProcessing] : (typeFilter?.length > 0) ? typeFilter : excludeTypes,
      user: (userFilter?.length > 0) ? userFilter : [],
      ...(parentFilter?.length > 0 && {parent: parentFilter}),
      ...(systemTagsFilter?.length > 0 && {system_tags: systemTagsFilter}),
      ...(tagsFilter?.length > 0 && {tags: [(tagsFilterAnd ? '__$and' : '__$or'), ...addExcludeFilters(tagsFilter)]}),
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
          this.store.select(selectIsDatasets),
        ),
        switchMap(([
                     scrollId, projectId, isArchived, gb, orderFields, filters, selectedExperiments,
                     showAllSelectedIsActive, cols, metricCols, deep, showHidden, isCompare, isPipeline, isDataset
                   ]) => {
          const tableFilters = cloneDeep(filters) || {} as { [key: string]: FilterMetadata };
          if (tableFilters && tableFilters.status && tableFilters.status.value.includes('completed')) {
            tableFilters.status.value.push('closed');
          }
          const selectedIds = showAllSelectedIsActive ? selectedExperiments.map(exp => exp.id) : [];
          return this.apiTasks.tasksGetAllEx(this.getGetAllQuery({
            refreshScroll, scrollId, projectId, searchQuery: gb, archived: isArchived, orderFields,
            tableFilters, selectedIds, cols, metricCols, deep, showHidden, isCompare, isPipeline, pageSize, isDataset
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
        addMessage('warn', 'Fetch tags failed', error?.meta && [{name: 'More info', actions: [setServerError(error, null, 'Fetch tags failed')]}])]
      )
    ))
  ));

  setSelectedExperiments = createEffect(() => this.actions$.pipe(
      ofType(exActions.setSelectedExperiments, exActions.updateExperiment, updateManyExperiment.type),
      withLatestFrom(
        this.store.select(exSelectors.selectSelectedExperiments),
      ),
      switchMap(([action, selectSelectedExperiments]) => {
        const experiments = action.type === exActions.setSelectedExperiments.type ?
          (action as ReturnType<typeof exActions.setSelectedExperiments>).experiments : selectSelectedExperiments;
        const selectedExperimentsDisableAvailable: Record<string, CountAvailableAndIsDisableSelectedFiltered> = {
          [MenuItems.abort]: selectionDisabledAbort(experiments),
          [MenuItems.abortAllChildren]: selectionDisabledAbortAllChildren(experiments),
          [MenuItems.publish]: selectionDisabledPublishExperiments(experiments),
          [MenuItems.reset]: selectionDisabledReset(experiments),
          [MenuItems.delete]: selectionDisabledDelete(experiments),
          [MenuItems.moveTo]: selectionDisabledMoveTo(experiments),
          [MenuItems.continue]: selectionDisabledContinue(experiments),
          [MenuItems.enqueue]: selectionDisabledEnqueue(experiments),
          [MenuItems.dequeue]: selectionDisabledDequeue(experiments),
          [MenuItems.queue]: selectionDisabledQueue(experiments),
          [MenuItems.viewWorker]: selectionDisabledViewWorker(experiments),
          [MenuItems.archive]: selectionDisabledArchive(experiments),
          [MenuItems.tags]: selectionDisabledTags(experiments),
        };
        //allHasExamples: selectionAllExamples(action.experiments),
        // allArchive: selectionAllIsArchive(action.experiments),
        return [exActions.setSelectedExperimentsDisableAvailable({selectedExperimentsDisableAvailable})];
      })
    )
  );
}
