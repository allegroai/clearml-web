import {Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {get, isEqual, uniq} from 'lodash/fp';
import {forkJoin, of} from 'rxjs';
import {auditTime, catchError, filter, flatMap, map, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {ApiModelsService} from '../../../business-logic/api-services/models.service';
import {BlModelsService} from '../../../business-logic/services/models.service';
import {RequestFailed} from '../../core/actions/http.actions';
import {ActiveLoader, AddMessage, DeactiveLoader, SetServerError} from '../../core/actions/layout.actions';
import {setArchive as setProjectArchive} from '../../core/actions/projects.actions';
import {setURLParams} from '../../core/actions/router.actions';
import {selectIsArchivedMode} from '../../core/reducers/projects.reducer';
import {selectRouterConfig, selectRouterParams} from '../../core/reducers/router-reducer';
import {selectAppVisible} from '../../core/reducers/view-reducer';
import {escapeRegex, getRouteFullUrl} from '../../shared/utils/shared-utils';
import {GetModelInfo, RefreshModelInfo} from '../actions/models-info.actions';
import * as actions from '../actions/models-view.actions';
import {MODELS_PAGE_SIZE, MODELS_TABLE_COLS} from '../models.consts';
import * as modelsSelectors from '../reducers';
import {IModelsViewState} from '../reducers/models-view.reducer';
import {MODEL_TAGS, MODELS_ONLY_FIELDS, MODELS_TABLE_COL_FIELDS} from '../shared/models.const';
import {SelectedModel} from '../shared/models.model';
import {ApiUsersService} from '../../../business-logic/api-services/users.service';
import {EXPERIMENTS_TABLE_COL_FIELDS} from '../../../features/experiments/shared/experiments.const';
import {ModelsGetAllExRequest} from '../../../business-logic/model/models/modelsGetAllExRequest';
import {encodeColumns} from '../../shared/utils/tableParamEncode';
import {EmptyAction} from '../../../app.constants';
import {ApiProjectsService} from '../../../business-logic/api-services/projects.service';
import {ModelsUpdateResponse} from '../../../business-logic/model/models/modelsUpdateResponse';

@Injectable()
export class ModelsViewEffects {

  constructor(private actions$: Actions, private store: Store<IModelsViewState>,
              private apiModels: ApiModelsService, private projectsApi: ApiProjectsService, private modelBl: BlModelsService, private usersApi: ApiUsersService,
              private router: Router, private route: ActivatedRoute
  ) {
  }

  @Effect()
  activeLoader = this.actions$.pipe(
    ofType(actions.GET_NEXT_MODELS, actions.ARCHIVE_SELECTED_MODELS, actions.GLOBAL_FILTER_CHANGED,
      actions.TABLE_SORT_CHANGED, actions.TABLE_FILTER_CHANGED, actions.REFRESH_MODELS,
      actions.afterSetArchive.type),
    filter((action) => !get('payload.hideLoader', action)),
    map(() => new ActiveLoader('Fetch Models'))
  );

  @Effect()
  reFetchModels = this.actions$.pipe(
    ofType(actions.FETCH_MODELS_REQUESTED, actions.GLOBAL_FILTER_CHANGED,
      actions.TABLE_SORT_CHANGED, actions.TABLE_FILTER_CHANGED, actions.afterSetArchive.type),
    auditTime(50),
    switchMap(() => this.fetchModels$(0)
      .pipe(
        flatMap(res => [
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
        flatMap(res => [
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
      flatMap(res => [
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
        flatMap(res => {
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
      flatMap(res => [
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
        flatMap(res => {
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
          flatMap(res => [
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
    flatMap(action => [new actions.SetShowAllSelectedIsActive(action.payload), new actions.FetchModelsRequested()]),
  );

  @Effect()
  changeColumnsOrder = this.actions$.pipe(
    ofType(actions.changeColsOrder),
    withLatestFrom(this.store.select(selectRouterParams).pipe(map(params => get('projectId', params)))),
    flatMap(([action, projectId]) => [actions.setColsOrderForProject({cols: action.cols, project: projectId})])
  );


  @Effect()
  updateModelsUrlParams = this.actions$.pipe(
    ofType(actions.setColsOrderForProject, actions.toggleColHidden),
    withLatestFrom(
      this.store.select(modelsSelectors.selectTableFilters),
      this.store.select(modelsSelectors.selectTableSortField),
      this.store.select(modelsSelectors.selectTableSortOrder),
      this.store.select(selectIsArchivedMode),
      this.store.select(modelsSelectors.selectModelsTableColsOrder),
      this.store.select(modelsSelectors.selectModelsHiddenTableCols)
    ),
    flatMap(([action, filters, sortField, sortOrder, isArchived, colsOrder, hiddenCols]) =>
      [setURLParams({
        filters: filters as any,
        orderField: sortField,
        orderDirection: sortOrder > 0 ? 'asc' : 'desc',
        isArchived,
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
  archiveModels = this.actions$.pipe(
    ofType<actions.ArchivedSelectedModels>(actions.ARCHIVE_SELECTED_MODELS),
    withLatestFrom(
      this.store.select(modelsSelectors.selectSelectedModels),
      this.store.select(modelsSelectors.selectSelectedTableModel),
      this.store.select(selectRouterParams)
    ),
    tap(([action, checkedModels, selectedModel, routerParams]) => {
      if (this.isSelectedModelInCheckedModels(checkedModels, selectedModel)) {
        this.router.navigate([`projects/${routerParams.projectId}/models/`]);
      }
    }),
    switchMap(([action, models]) => forkJoin(models.map(model => ({
        model: model.id,
        system_tags: this.modelBl.addHiddenTag(model.system_tags)
      })).map(req => this.apiModels.modelsUpdate(req)) as ModelsUpdateResponse[])
        .pipe(
          withLatestFrom(this.store.select(selectRouterConfig)),
          flatMap(([res, routerConfig]) => {
            let dispatchActions: Action[] = [
              new DeactiveLoader('Fetch Models'),
              new actions.SetSelectedModels([]),
              new AddMessage('success', `${models.length} model${models.length > 1 ? 's have' : ' has'} been archived`, action.payload.skipUndo ? [] : [
                {
                  name: 'Undo', actions: [
                    new actions.SetSelectedModels(models),
                    new actions.RestoreSelectedModels(true)
                  ]
                }
              ])
            ];
            if (routerConfig.includes('models')) {
              dispatchActions = dispatchActions.concat([
                new actions.RemoveModels(models.map(exp => exp.model)),
                new actions.FetchModelsRequested()
              ]);
            }
            return dispatchActions;
          }),
          catchError(error => [
            new RequestFailed(error),
            new DeactiveLoader('Fetch Models'),
            new SetServerError(error, null, 'Failed To Archive Models')
          ])
        )
    )
  );

  @Effect()
  restoreModels = this.actions$.pipe(
    ofType<actions.RestoreSelectedModels>(actions.RESTORE_SELECTED_MODELS),
    withLatestFrom(
      this.store.select(modelsSelectors.selectSelectedModels),
      this.store.select(modelsSelectors.selectSelectedTableModel),
      this.store.select(selectRouterParams)
    ),
    tap(([action, checkedModels, selectedModel, routerParams]) => {
      if (this.isSelectedModelInCheckedModels(checkedModels, selectedModel)) {
        this.router.navigate([`projects/${routerParams.projectId}/models/`]);
      }
    }),
    switchMap(([action, models]) => forkJoin(models.map(model => ({
        model: model.id,
        system_tags: this.modelBl.removeHiddenTag(model.system_tags)
      })).map(req => this.apiModels.modelsUpdate(req)) as ModelsUpdateResponse[])
        .pipe(
          withLatestFrom(this.store.select(selectRouterConfig)),
          flatMap(([res, routerConfig]) => {
            let dispachActions: Action[] = [
              new DeactiveLoader('Fetch Models'),
              new actions.SetSelectedModels([]),
              new AddMessage('success', `${models.length} model${models.length > 1 ? 's have' : ' has'} been restored`, action.payload.skipUndo ? [] : [
                {
                  name: 'Undo', actions: [
                    new actions.SetSelectedModels(models),
                    new actions.ArchivedSelectedModels(true)
                  ]
                }
              ])
            ];
            if (routerConfig.includes('models')) {
              dispachActions = dispachActions.concat([
                new actions.RemoveModels(models.map(exp => exp.model)),
                new actions.FetchModelsRequested(),
              ]);
            }
            return dispachActions;
          }),
          catchError(error => [
            new RequestFailed(error),
            new DeactiveLoader('Fetch Models'),
            new SetServerError(error, null, 'Failed To Restore Models')
          ])
        )
    )
  );

  @Effect()
  setArchiveMode = this.actions$.pipe(
    ofType(actions.setArchive),
    switchMap(action => [setProjectArchive(action), actions.afterSetArchive()])
  );

  getGetAllQuery(page, pageSize, projectId, searchQuery, isArchivedMode, orderField, orderSort, tableFilters, ids = []): ModelsGetAllExRequest {
    const userFilter = get([EXPERIMENTS_TABLE_COL_FIELDS.USER, 'value'], tableFilters);
    const tagsFilter = get([MODELS_TABLE_COL_FIELDS.TAGS, 'value'], tableFilters);
    const systemTags = get(['system_tags', 'value'], tableFilters);
    const systemTagsFilter = (isArchivedMode ? [MODEL_TAGS.HIDDEN] : ['-' + MODEL_TAGS.HIDDEN])
      .concat(systemTags ? systemTags : []);
    return {
      id: ids,
      _any_: {
        pattern: searchQuery ? escapeRegex(searchQuery) : '',
        fields: ['id', 'name', 'comment', 'system_tags']
      },
      project: (!projectId || projectId === '*') ? undefined : [projectId],
      page: page,
      page_size: pageSize,
      order_by: [(orderSort === 1 ? '-' : '') + orderField],
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
          this.store.select(modelsSelectors.selectTableSortField),
          this.store.select(modelsSelectors.selectTableSortOrder),
          this.store.select(modelsSelectors.selectTableFilters),
          this.store.select(modelsSelectors.selectSelectedModels),
          this.store.select(modelsSelectors.selectShowAllSelectedIsActive),
          this.store.select(modelsSelectors.selectModelsTableColsOrder),
          this.store.select(modelsSelectors.selectModelsHiddenTableCols)
        ),
        switchMap(([pageNumber, projectId, isArchived, gb, sortField, sortOrder, filters, selectedModels, showAllSelectedIsActive, colsOrder, hiddenCols]) => {
          const selectedModelsIds = showAllSelectedIsActive ? selectedModels.map(exp => exp.id) : [];
          const pageToGet = getAllPages ? 0 : page;
          const pageSize = getAllPages ? (page + 1) * MODELS_PAGE_SIZE : MODELS_PAGE_SIZE;
          const columns = encodeColumns(MODELS_TABLE_COLS, hiddenCols, [], colsOrder);
          this.setModelsUrlParams(filters, sortField, sortOrder, isArchived, columns);
          return this.apiModels.modelsGetAllEx(this.getGetAllQuery(pageToGet, pageSize, projectId, gb, isArchived, sortField, sortOrder, filters, selectedModelsIds));
        })
      );
  }

  setModelsUrlParams(filters, sortField, sortOrder, isArchived, columns) {
    this.store.dispatch(setURLParams({filters, orderField: sortField, orderDirection: sortOrder > 0 ? 'asc' : 'desc', isArchived, columns: columns}));
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
