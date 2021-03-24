import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Actions, createEffect, Effect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {cloneDeep, flatten, get, getOr, isEqual, uniq} from 'lodash/fp';
import {forkJoin, Observable, of} from 'rxjs';
import {auditTime, catchError, filter, map, mergeMap, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {ApiProjectsService} from '../../../business-logic/api-services/projects.service';
import {ApiTasksService} from '../../../business-logic/api-services/tasks.service';
import {TasksGetAllExResponse} from '../../../business-logic/model/tasks/tasksGetAllExResponse';
import {TasksGetAllRequest} from '../../../business-logic/model/tasks/tasksGetAllRequest';
import {BlTasksService} from '../../../business-logic/services/tasks.service';
import {GET_ALL_QUERY_ANY_FIELDS} from '../../../features/experiments/experiments.consts';
import {selectSelectedExperiment} from '../../../features/experiments/reducers';
import {IExperimentsViewState} from '../../../features/experiments/reducers/experiments-view.reducer';
import {EXPERIMENTS_TABLE_COL_FIELDS} from '../../../features/experiments/shared/experiments.const';
import {RequestFailed} from '../../core/actions/http.actions';
import {ActiveLoader, AddMessage, DeactiveLoader, SetServerError} from '../../core/actions/layout.actions';
import {setArchive as setProjectArchive} from '../../core/actions/projects.actions';
import {setURLParams} from '../../core/actions/router.actions';
import {selectIsArchivedMode} from '../../core/reducers/projects.reducer';
import {selectRouterConfig, selectRouterParams} from '../../core/reducers/router-reducer';
import {selectAppVisible} from '../../core/reducers/view-reducer';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {ISmCol} from '../../shared/ui-components/data/table/table.consts';
import {escapeRegex, getRouteFullUrl} from '../../shared/utils/shared-utils';
import {encodeColumns} from '../../shared/utils/tableParamEncode';
import {AutoRefreshExperimentInfo, ExperimentDetailsUpdated, GetExperimentInfo} from '../actions/common-experiments-info.actions';
import * as exActions from '../actions/common-experiments-view.actions';
import * as exSelectors from '../reducers/index';
import {ITableExperiment} from '../shared/common-experiment-model.model';
import {EXPERIMENTS_PAGE_SIZE} from '../shared/common-experiments.const';
import {convertStopToComplete} from '../shared/common-experiments.utils';
import {ApiUsersService} from '../../../business-logic/api-services/users.service';
import {sortByField} from '../../tasks/tasks.utils';
import {MODEL_TAGS, MODELS_TABLE_COL_FIELDS} from '../../models/shared/models.const';
import {EmptyAction} from '../../../app.constants';
import {selectExperimentsList, selectExperimentsUsers, selectTableFilters} from '../reducers';
import {TasksUpdateResponse} from '../../../business-logic/model/tasks/tasksUpdateResponse';
import {ProjectsGetTaskParentsResponse} from '../../../business-logic/model/projects/projectsGetTaskParentsResponse';
import {setActiveParentsFilter, setParents} from '../actions/common-experiments-view.actions';
import {ProjectsGetTaskParentsRequest} from '../../../business-logic/model/projects/projectsGetTaskParentsRequest';
import TasksStateEnum = ProjectsGetTaskParentsRequest.TasksStateEnum;

@Injectable()
export class CommonExperimentsViewEffects {

  constructor(
    private actions$: Actions, private store: Store<IExperimentsViewState>,
    private apiTasks: ApiTasksService, private projectsApi: ApiProjectsService, private usersApi: ApiUsersService,
    private taskBl: BlTasksService, private router: Router, private route: ActivatedRoute
  ) {
  }

  @Effect()
  activeLoader = this.actions$.pipe(
    ofType(exActions.GET_NEXT_EXPERIMENTS, exActions.GET_EXPERIMENTS, exActions.ARCHIVE_SELECTED_EXPERIMENTS,
      exActions.GLOBAL_FILTER_CHANGED, exActions.TABLE_SORT_CHANGED, exActions.TABLE_FILTER_CHANGED,
      exActions.REFRESH_EXPERIMENTS, exActions.afterSetArchive.type),
    filter((action) => !get('payload.hideLoader', action)),
    map(() => new ActiveLoader('EXPERIMENTS_LIST'))
  );

  @Effect()
  reFetchParents = this.actions$.pipe(
    ofType(exActions.afterSetArchive.type),
    map(() => exActions.getParents())
  );

  @Effect()
  reFetchExperiment = this.actions$.pipe(
    ofType(
      exActions.GET_EXPERIMENTS, exActions.GLOBAL_FILTER_CHANGED, exActions.TABLE_SORT_CHANGED,
      exActions.TABLE_FILTER_CHANGED, exActions.setTableFilters.type, exActions.afterSetArchive.type
    ),
    auditTime(50),
    switchMap((action) => this.fetchExperiments$(0)
      .pipe(
        mergeMap(res => {
          res.tasks = convertStopToComplete(res.tasks);
          return [
            new exActions.SetNoMoreExperiments((res.tasks.length < EXPERIMENTS_PAGE_SIZE)),
            new exActions.SetExperiments(res.tasks as ITableExperiment[]),
            new exActions.SetCurrentPage(0),
            new DeactiveLoader('EXPERIMENTS_LIST')
          ];
        }),
        catchError(error => [
          new RequestFailed(error),
          new DeactiveLoader('EXPERIMENTS_LIST'),
          new SetServerError(error, null, 'Fetch Experiments failed', getOr(false, 'payload.autoRefresh', action))
        ])
      )
    )
  );

  @Effect()
  refreshExperiments = this.actions$.pipe(
    ofType<exActions.RefreshExperiments>(exActions.REFRESH_EXPERIMENTS, exActions.ADD_COL),
    withLatestFrom(
      this.store.select(exSelectors.selectCurrentPage),
      this.store.select(selectSelectedExperiment),
      this.store.select(selectExperimentsList),
      this.store.select(selectAppVisible)),
    filter(([action, currentPage, selectedExperiment, experiments, visible]) => visible),
    switchMap(([action, currentPage, selectedExperiment, experiments]) => this.fetchExperiments$(currentPage, true)
      .pipe(
        mergeMap(res => {
          res.tasks = convertStopToComplete(res.tasks);
          const actions: Action[] = [new DeactiveLoader('EXPERIMENTS_LIST')];
          if (selectedExperiment && action.payload.autoRefresh && isEqual(experiments.map(exp => exp.id).sort(), res.tasks.map(exp => exp.id).sort())) {
            actions.push(exActions.setExperimentInPlace({experiments: res.tasks as ITableExperiment[]}));
          } else {
            // SetExperiments must be before GetExperimentInfo!
            actions.push(new exActions.SetExperiments(res.tasks as ITableExperiment[]));
          }
          if (selectedExperiment) {
            if (action.payload.autoRefresh) {
              actions.push(new AutoRefreshExperimentInfo(selectedExperiment.id));
            } else {
              // SetExperiments must be before GetExperimentInfo!
              actions.push(new GetExperimentInfo(selectedExperiment.id));
            }
          }
          return actions;
        }),
        catchError(error => [
          new RequestFailed(error),
          new DeactiveLoader('EXPERIMENTS_LIST'),
          new SetServerError(error, null, 'Fetch Experiments failed', action.payload.autoRefresh)
        ])
      )
    )
  );

  @Effect()
  getNextExperiments = this.actions$.pipe(
    ofType<exActions.GetNextExperiments>(exActions.GET_NEXT_EXPERIMENTS),
    withLatestFrom(this.store.select(exSelectors.selectCurrentPage)),
    switchMap(([action, page]) => this.fetchExperiments$(page + 1)
      .pipe(
        mergeMap(res => {
          res.tasks = convertStopToComplete(res.tasks);
          return [
            new exActions.SetNoMoreExperiments((res.tasks.length < EXPERIMENTS_PAGE_SIZE)),
            new exActions.AddExperiments(res.tasks as ITableExperiment[]),
            new exActions.SetCurrentPage(page + 1),
            new DeactiveLoader('EXPERIMENTS_LIST')
          ];
        }),
        catchError(error => [
          new RequestFailed(error), new DeactiveLoader('EXPERIMENTS_LIST'), new SetServerError(error, null, 'Fetch Experiments failed')])
      )
    )
  );

  @Effect()
  showAllSelected = this.actions$.pipe(
    ofType<exActions.ShowAllSelected>(exActions.SHOW_ALL_SELECTED),
    mergeMap(action => [new exActions.SetShowAllSelectedIsActive(action.payload), new exActions.GetExperiments()]),
  );


  @Effect()
  experimentSelectionChanged = this.actions$.pipe(
    ofType<exActions.ExperimentSelectionChanged>(exActions.EXPERIMENT_SELECTION_CHANGED),
    tap(action => this.navigateAfterExperimentSelectionChanged(action.payload.experiment as ITableExperiment, action.payload.project)),
    mergeMap(action => [])
    // map(action => new exActions.SetSelectedExperiment(action.payload.experiment))
  );

  @Effect()
  archiveExperiments = this.actions$.pipe(
    ofType<exActions.ArchiveSelectedExperiments>(exActions.ARCHIVE_SELECTED_EXPERIMENTS),
    withLatestFrom(
      this.store.select(exSelectors.selectSelectedExperiments),
      this.store.select(exSelectors.selectSelectedTableExperiment),
      this.store.select(selectRouterParams)
    ),
    tap(([action, checkedExperiments, selectedExperiment, routerParams]) => {
      if (this.isSelectedExpInCheckedExps(checkedExperiments, selectedExperiment)) {
        this.router.navigate([`projects/${routerParams.projectId}/experiments/`]);
      }
    }),
    switchMap(([action, experiments, selected, routerParams]) => this.apiTasks.tasksArchive({tasks: experiments.map((experiment) => experiment.id)})
      .pipe(
        withLatestFrom(this.store.select(selectRouterConfig)),
        mergeMap(([res, routerConfig]) => {
          let actions: Action[] = [
            new DeactiveLoader('EXPERIMENTS_LIST'),
            new exActions.SetSelectedExperiments([]),
            new AddMessage('success', `${experiments.length} experiment${experiments.length > 1 ? 's have' : ' has'} been archived.
            Any queued experiments had been reset`, action.payload.skipUndo ? [] : [
              {
                name: 'Undo', actions: [
                  new exActions.SetSelectedExperiments(experiments),
                  new exActions.RestoreSelectedExperiments({skipUndo: true})
                ]
              }
            ])
          ];
          if (routerConfig.includes('experiments')) {
            actions = actions.concat([
              new exActions.RemoveExperiments(experiments.map(exp => exp.task)),
              new exActions.GetExperiments()
            ]);
          }

          if (routerConfig.includes('output') && routerParams?.experimentId === experiments[0].id) {
            actions.push(new ExperimentDetailsUpdated({
              id: experiments[0].id,
              changes: {system_tags: [...experiments[0]?.system_tags.filter(t => t !== 'shared'), 'archived'].sort()}
            }));
          }
          return actions;
        }),
        catchError(error => [
          new RequestFailed(error),
          new DeactiveLoader('EXPERIMENTS_LIST'),
          new SetServerError(error, null, 'Failed To Archive Experiments')
        ])
      )
    )
  );

  @Effect()
  restoreExperiments = this.actions$.pipe(
    ofType<exActions.RestoreSelectedExperiments>(exActions.RESTORE_SELECTED_EXPERIMENTS),
    withLatestFrom(
      this.store.select(exSelectors.selectSelectedExperiments),
      this.store.select(exSelectors.selectSelectedTableExperiment),
      this.store.select(selectRouterParams)),
    tap(([action, checkedExperiments, selectedExperiment, routerParams]) => {
      if (this.isSelectedExpInCheckedExps(checkedExperiments, selectedExperiment)) {
        this.router.navigate([`projects/${routerParams.projectId}/experiments/`]);
      }
    }),
    switchMap(([action, experiments, selected, routerParams]) => forkJoin(experiments.map(experiment => (
      {
        task: experiment.id,
        system_tags: this.taskBl.removeHiddenTag(experiment.system_tags)
      })).map(req => this.apiTasks.tasksUpdate(req)) as TasksUpdateResponse[])
      .pipe(
        withLatestFrom(this.store.select(selectRouterConfig)),
        mergeMap(([res, routerConfig]) => {
            let actions: Action[] = [
              new DeactiveLoader('EXPERIMENTS_LIST'),
              new exActions.SetSelectedExperiments([]),
              new AddMessage('success', `${experiments.length} experiment${experiments.length > 1 ? 's have' : ' has'} been restored`, action.payload.skipUndo ? [] : [
                {
                  name: 'Undo', actions: [
                    new exActions.SetSelectedExperiments(experiments),
                    new exActions.ArchiveSelectedExperiments({skipUndo: true})
                  ]
                }
              ]),
            ];
            if (routerConfig.includes('experiments')) {
              actions = actions.concat([
                new exActions.RemoveExperiments(experiments.map(exp => exp.task)),
                new exActions.GetExperiments(),
              ]);
            }
            if (routerConfig.includes('output') && routerParams?.experimentId === experiments[0].id) {
              actions.push(new ExperimentDetailsUpdated({
                id: experiments[0].id,
                changes: {system_tags: experiments[0]?.system_tags.filter(tag => tag !== 'archived')}
              }));
            }
            return actions;
          }
        ),
        catchError(error => [
          new RequestFailed(error),
          new DeactiveLoader('EXPERIMENTS_LIST'),
          new SetServerError(error, null, 'Failed To Restore Experiments')
        ])
      )
    )
  );
  @Effect()
  getTypesEffect = this.actions$.pipe(
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
            shouldFilterFilters ? new exActions.TableFilterChanged(filteredTableFilters) : new EmptyAction(),
            exActions.setProjectsTypes(res),
            new DeactiveLoader(action.type)
          ];
        }
      ),
      catchError(error => [
        new RequestFailed(error),
        new DeactiveLoader(action.type),
        new SetServerError(error, null, 'Fetch types failed')]
      )
    )));

  @Effect()
  getFilteredUsersEffect = this.actions$.pipe(
    ofType(exActions.getFilteredUsers),
    withLatestFrom(this.store.select(selectExperimentsUsers), this.store.select(selectTableFilters)),
    switchMap(([action, users, filters]) => this.usersApi.usersGetAllEx({
      order_by: ['name'],
      only_fields: ['name'],
      id: getOr([], ['user.name', 'value'], filters)
    }).pipe(
      mergeMap(res => [
        exActions.setUsers({users: uniq(res.users.concat(users))}),
        new DeactiveLoader(action.type)
      ]),
      catchError(error => [
        new RequestFailed(error),
        new DeactiveLoader(action.type),
        new SetServerError(error, null, 'Fetch users failed')]
      )
    ))
  );

  @Effect()
  getUsersEffect = this.actions$.pipe(
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
        new RequestFailed(error),
        new SetServerError(error, null, 'Fetch users failed')]
      )
    ))
  );

  getParentsEffect = createEffect(() => this.actions$.pipe(
    ofType(exActions.getParents),
    withLatestFrom(
      this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
      this.store.select(selectIsArchivedMode)
    ),
    switchMap(([action, projectId, isArchive]) => this.projectsApi.projectsGetTaskParents({
      projects: projectId !== '*' ? [projectId] : [],
      tasks_state: isArchive? TasksStateEnum.Archived: TasksStateEnum.Active
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
        new RequestFailed(error),
        new SetServerError(error, null, 'Fetch parents failed')]
      )
    ))
  ));

  @Effect()
  getCustomMetrics = this.actions$.pipe(
    ofType<exActions.GetCustomMetrics>(exActions.GET_CUSTOM_METRICS),
    withLatestFrom(this.store.select(selectRouterParams).pipe(map(params => get('projectId', params)))),
    switchMap(([action, projectId]) => this.projectsApi.projectsGetUniqueMetricVariants({project: projectId === '*' ? null : projectId})
      .pipe(
        mergeMap(res => [
          new exActions.SetCustomMetrics(sortByField(res.metrics, 'metric')),
          new DeactiveLoader(action.type)
        ]),
        catchError(error => [
          new RequestFailed(error),
          new DeactiveLoader(action.type),
          new SetServerError(error, null, 'Fetch custom metrics failed'),
          new exActions.SetCustomHyperParams([])])
      )
    )
  );

  @Effect()
  GetCustomHyperParams = this.actions$.pipe(
    ofType<exActions.GetCustomHyperParams>(exActions.GET_CUSTOM_HYPER_PARAMS),
    withLatestFrom(this.store.select(selectRouterParams).pipe(map(params => get('projectId', params)))),
    switchMap(([action, projectId]) => this.projectsApi.projectsGetHyperParameters({
        project: projectId === '*' ? null : projectId,
        page_size: 1000
      })
        .pipe(
          mergeMap(res => [
            new exActions.SetCustomHyperParams(res.parameters),
            new DeactiveLoader(action.type)
          ]),
          catchError(error => [
            new RequestFailed(error),
            new DeactiveLoader(action.type),
            new SetServerError(error, null, 'Fetch hyper parameters failed'),
            new exActions.SetCustomHyperParams([])])
        )
    )
  );

  @Effect()
  setArchiveMode = this.actions$.pipe(
    ofType(exActions.setArchive),
    switchMap(action => [setProjectArchive(action), exActions.afterSetArchive()])
  );

  @Effect()
  changeColumnsOrder = this.actions$.pipe(
    ofType(exActions.changeColsOrder),
    withLatestFrom(this.store.select(selectRouterParams).pipe(map(params => get('projectId', params)))),
    mergeMap(([action, projectId]) => [exActions.setColsOrderForProject({cols: action.cols, project: projectId})])
  );

  @Effect()
  setURLParams = this.actions$.pipe(
    ofType<exActions.GetNextExperiments>(exActions.REMOVE_COL, exActions.TOGGLE_COL_HIDDEN, exActions.setColsOrderForProject),
    withLatestFrom(
      this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
      this.store.select(selectIsArchivedMode),
      this.store.select(exSelectors.selectGlobalFilter),
      this.store.select(exSelectors.selectTableSortField),
      this.store.select(exSelectors.selectTableSortOrder),
      this.store.select(exSelectors.selectTableFilters),
      this.store.select(exSelectors.selectExperimentsTableCols),
      this.store.select(exSelectors.selectExperimentsHiddenTableCols),
      this.store.select(exSelectors.selectExperimentsMetricsCols),
      this.store.select(exSelectors.selectExperimentsTableColsOrder),
    ),
    map(([
           action, projectId, isArchived, gb, sortField, sortOrder, filters,
           cols, hiddenCols, metricsCols, colsOrder
         ]) => {
      const columns = encodeColumns(cols, hiddenCols, this.filterColumns(projectId, metricsCols), colsOrder);
      return setURLParams({
        columns,
        filters,
        orderField: sortField,
        orderDirection: sortOrder > 0 ? 'asc' : 'desc',
        isArchived
      });
    })
  );

  navigateAfterExperimentSelectionChanged(selectedExperiment: ITableExperiment, experimentProject: string) {
    // wow angular really suck...
    const activeChild = get('firstChild.firstChild.firstChild.firstChild.firstChild.firstChild', this.route);
    const activeChildUrl = activeChild ? getRouteFullUrl(activeChild) : '';
    const baseUrl = 'projects/' + experimentProject + '/experiments';
    selectedExperiment ?
      this.router.navigate([baseUrl + '/' + selectedExperiment.id + '/' + activeChildUrl], {queryParamsHandling: 'preserve'}) : this.router.navigate([baseUrl], {queryParamsHandling: 'preserve'});
  }

  isSelectedExpInCheckedExps(checked, selected) {
    return selected && checked.map(model => model.id).includes(selected.id);
  }

  getGetAllQuery(
    getAllPages: boolean, page: number, projectId: string, searchQuery: string,
    isArchivedMode: boolean, orderField: string, orderSort: number,
    tableFilters: { [key: string]: FilterMetadata }, ids: string[] = [], cols?: ISmCol[],
    metricCols?: any[]
  ): TasksGetAllRequest {
    const typeFilter = get([EXPERIMENTS_TABLE_COL_FIELDS.TYPE, 'value'], tableFilters);
    const statusFilter = get([EXPERIMENTS_TABLE_COL_FIELDS.STATUS, 'value'], tableFilters);
    const userFilter = get([EXPERIMENTS_TABLE_COL_FIELDS.USER, 'value'], tableFilters);
    const tagsFilter = get([MODELS_TABLE_COL_FIELDS.TAGS, 'value'], tableFilters);
    const parentFilter = get([EXPERIMENTS_TABLE_COL_FIELDS.PARENT, 'value'], tableFilters);
    const systemTags = get(['system_tags', 'value'], tableFilters);
    const systemTagsFilter = (isArchivedMode ? [MODEL_TAGS.HIDDEN] : ['-' + MODEL_TAGS.HIDDEN])
      .concat(systemTags ? systemTags : []);
    const pageToGet = getAllPages ? 0 : page;
    const pageSizeToGet = getAllPages ? (page + 1) * EXPERIMENTS_PAGE_SIZE : EXPERIMENTS_PAGE_SIZE;
    return {
      id: ids,
      _any_: searchQuery ? {
        pattern: escapeRegex(searchQuery),
        fields: GET_ALL_QUERY_ANY_FIELDS
      } : undefined,
      project: (!projectId || projectId === '*') ? undefined : [projectId],
      page: pageToGet,
      page_size: pageSizeToGet,
      order_by: [(orderSort === 1 ? '-' : '') + orderField],
      status: (statusFilter && statusFilter.length > 0) ? statusFilter : undefined,
      type: (typeFilter && typeFilter.length > 0) ? typeFilter : ['__$not', 'annotation_manual', '__$not', 'annotation', '__$not', 'dataset_import'],
      user: (userFilter && userFilter.length > 0) ? userFilter : [],
      ...(parentFilter?.length > 0 && {parent: parentFilter}),
      system_tags: (systemTagsFilter && systemTagsFilter.length > 0) ? systemTagsFilter : [],
      tags: (tagsFilter && tagsFilter.length > 0) ? tagsFilter : [],
      only_fields: ['system_tags', 'company', 'last_change'].concat(
        flatten(cols.filter(col => col.id !== 'selected' && !col.hidden).map(col => col.getter || col.id))
      ).concat(metricCols ? metricCols.map(col => col.id) : [])
    };
  }

  fetchExperiments$(page: number, getAllPages: boolean = false): Observable<TasksGetAllExResponse> {
    return of(page)
      .pipe(
        withLatestFrom(
          this.store.select(selectRouterParams).pipe(map(params => get('projectId', params))),
          this.store.select(selectIsArchivedMode),
          this.store.select(exSelectors.selectGlobalFilter),
          this.store.select(exSelectors.selectTableSortField),
          this.store.select(exSelectors.selectTableSortOrder),
          this.store.select(exSelectors.selectTableFilters),
          this.store.select(exSelectors.selectSelectedExperiments),
          this.store.select(exSelectors.selectShowAllSelectedIsActive),
          this.store.select(exSelectors.selectExperimentsTableCols),
          this.store.select(exSelectors.selectExperimentsHiddenTableCols),
          this.store.select(exSelectors.selectExperimentsMetricsCols),
          this.store.select(exSelectors.selectExperimentsTableColsOrder),
        ),
        switchMap(([
                     pageNumber, projectId, isArchived, gb, sortField, sortOrder, filters,
                     selectedExperiments, showAllSelectedIsActive, cols, hiddenCols, metricsCols, colsOrder
                   ]) => {
          const myFilters = cloneDeep(filters) as { [key: string]: FilterMetadata };
          if (myFilters && myFilters.status && myFilters.status.value.includes('completed')) {
            myFilters.status.value.push('closed');
          }
          const selectedExperimentsIds = showAllSelectedIsActive ? selectedExperiments.map(exp => exp.id) : [];
          const columns = encodeColumns(cols, hiddenCols, this.filterColumns(projectId, metricsCols), colsOrder);
          this.store.dispatch(setURLParams({
            columns,
            filters,
            orderField: sortField,
            orderDirection: sortOrder > 0 ? 'asc' : 'desc',
            isArchived
          }));
          return this.apiTasks.tasksGetAllEx(this.getGetAllQuery(getAllPages, pageNumber,
            projectId, gb, isArchived, sortField, sortOrder, myFilters, selectedExperimentsIds,
            cols, metricsCols));
        })
      );
  }

  private filterColumns(projectId: string, metricsCols: any) {
    if (projectId !== '*') {
      return metricsCols.filter(col => col.projectId === projectId);
    }
    return metricsCols;
  }
}
