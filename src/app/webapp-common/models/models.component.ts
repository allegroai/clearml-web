import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {get, isEqual} from 'lodash/fp';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {interval} from 'rxjs/internal/observable/interval';
import {filter, map, skip, tap, withLatestFrom} from 'rxjs/operators';
import {AUTO_REFRESH_INTERVAL} from '../../app.constants';
import {getTags, ResetProjectSelection} from '../../webapp-common/core/actions/projects.actions';
import {InitSearch, ResetSearch} from '../common-search/common-search.actions';
import {selectSearchQuery} from '../common-search/common-search.reducer';
import {SetAutoRefresh} from '../core/actions/layout.actions';
import {selectIsArchivedMode, selectProjectSystemTags, selectProjectTags} from '../core/reducers/projects.reducer';
import {selectRouterParams} from '../core/reducers/router-reducer';
import {selectAutoRefresh} from '../core/reducers/view-reducer';
import {BaseEntityPage} from '../shared/entity-page/base-entity-page';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {ISmCol, TableSortOrderEnum} from '../shared/ui-components/data/table/table.consts';
import {ConfirmDialogComponent} from '../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {decodeFilter, decodeOrder} from '../shared/utils/tableParamEncode';
import * as modelsActions from './actions/models-view.actions';
import {MODELS_TABLE_COLS, ModelsViewModesEnum} from './models.consts';
import * as modelsSelectors from './reducers';
import {selectModelsFrameworks, selectModelsHiddenTableCols, selectModelsTags, selectModelsUsers} from './reducers';
import {IModelsViewState} from './reducers/models-view.reducer';
import {ITableModel, ModelTableColFieldsEnum} from './shared/models.model';
import {User} from '../../business-logic/model/users/user';
import * as experimentsActions from '../experiments/actions/common-experiments-view.actions';


@Component({
  selector   : 'sm-models',
  templateUrl: './models.component.html',
  styleUrls  : ['./models.component.scss']
})
export class ModelsComponent extends BaseEntityPage implements OnInit, OnDestroy {

  public models$: Observable<Array<ITableModel>>;
  public tableSortField$: Observable<string>;
  public tableSortOrder$: Observable<TableSortOrderEnum>;
  public selectedModels$: Observable<Array<any>>;
  public selectedModel$: Observable<ITableModel>;
  public searchValue$: Observable<string>;
  public isArchived$: Observable<boolean>;
  public viewMode$: Observable<ModelsViewModesEnum>;
  public tableFilters$: Observable<Map<ModelTableColFieldsEnum, FilterMetadata>>;
  public noMoreModels$: Observable<boolean>;
  public showAllSelectedIsActive$: Observable<boolean>;
  public showInfo$: Observable<boolean>;


  private selectedModels: ITableModel[];
  private selectedModelSubs: Subscription;
  private searchSubs: Subscription;
  private selectedModelsSub: Subscription;
  private ModelFromUrlSub: Subscription;
  private searchQuery$: Observable<string>;
  public autoRefreshState$: Observable<boolean>;
  private refreshing: boolean;
  private autorRefreshSub: Subscription;
  public activeSectionEdit$: Observable<string>;
  public selectedProjectId$: Observable<string>;
  public tableColsOrder$: Observable<string[]>;
  public users$: Observable<Array<User>>;
  public tags$: Observable<string[]>;
  public systemTags$: Observable<string[]>;
  public hiddenTableCols$: Observable<{ [p: string]: boolean }>;
  public tableCols = MODELS_TABLE_COLS;
  public filteredTableCols= MODELS_TABLE_COLS;
  private hiddenTableColsSub: Subscription;
  public frameworks$: Observable<Array<string>>;


  constructor(
    protected store: Store<IModelsViewState>, private route: ActivatedRoute, private router: Router,
    private dialog: MatDialog
  ) {
    super(store);
    this.tableSortField$ = this.store.select(modelsSelectors.selectTableSortField);
    this.selectedModel$ = this.store.select(modelsSelectors.selectSelectedTableModel);
    this.selectedModels$ = this.store.select(modelsSelectors.selectSelectedModels);
    this.tableSortOrder$ = this.store.select(modelsSelectors.selectTableSortOrder);
    this.tableFilters$ = this.store.select(modelsSelectors.selectTableFilters);
    this.searchValue$ = this.store.select(modelsSelectors.selectGlobalFilter);
    this.isArchived$ = this.store.select(selectIsArchivedMode);
    this.noMoreModels$ = this.store.select(modelsSelectors.selectNoMoreModels);
    this.viewMode$ = this.store.select(modelsSelectors.selectViewMode);
    this.showAllSelectedIsActive$ = this.store.select(modelsSelectors.selectShowAllSelectedIsActive);
    this.searchQuery$ = this.store.select(selectSearchQuery);
    this.autoRefreshState$ = this.store.select(selectAutoRefresh);
    this.activeSectionEdit$ = this.store.select(modelsSelectors.selectActiveSectionEdit);
    this.tableColsOrder$ = this.store.select(modelsSelectors.selectModelsTableColsOrder);
    this.selectedProjectId$ = this.store.select(selectRouterParams).pipe(map(params => get('projectId', params)));
    this.tags$ = this.store.select(selectModelsTags);
    this.systemTags$ = this.store.select(selectProjectSystemTags);
    this.users$ = this.store.select(selectModelsUsers);
    this.frameworks$ = this.store.select(selectModelsFrameworks);
    this.hiddenTableCols$ = this.store.select(selectModelsHiddenTableCols);

    this.models$ = this.store.select(modelsSelectors.selectModelsList).pipe(
      withLatestFrom(this.isArchived$),
      // lil hack for hiding archived models after they been archived from models info or footer...
      map(([models, showArchived]) => this.filterArchivedModels(models, showArchived)),
      tap(() => this.refreshing = false)
    );
    this.showInfo$ = this.store.pipe(
      select(selectRouterParams),
      map(params => !!get('modelId', params))
    );
  }

  ngOnInit() {
    let prevQueryParams: Params;

    this.hiddenTableColsSub = this.hiddenTableCols$.subscribe(hiddenCols => {
      this.tableCols.map(tableCol => {
        tableCol.hidden = hiddenCols[tableCol.id];
        return tableCol;
      });
      this.filteredTableCols = MODELS_TABLE_COLS.filter(tableCol=> !hiddenCols[tableCol.id]);
    });

    this.selectedModelSubs = combineLatest([
      this.store.select(selectRouterParams),
      this.route.queryParams,
    ]).pipe(
      map(([params, queryParams]) => [get('projectId', params), queryParams]),
      filter(([projectId, queryParams]) => {
        const equal = projectId === this.projectId && isEqual(queryParams, prevQueryParams);
        if (!equal && !this.preventUrlUpdate) {
          prevQueryParams = queryParams;
          this.projectId = projectId;
          return true;
        }
        prevQueryParams = queryParams;
        this.preventUrlUpdate = false;
        return false;
      })
    ).subscribe(([projectId, params]: [string, Params]) => {
      if (params.order) {
        const [colId, sortOrder] = decodeOrder(params.order);
        this.store.dispatch(new modelsActions.TableSortChanged({colId, sortOrder}));
      }
      if (params.filter) {
        const filters = decodeFilter(params.filter);
        this.store.dispatch(modelsActions.setTableFilters({filters}));
      } else {
        if (params.order) {
          this.store.dispatch(modelsActions.setTableFilters({filters: []}));
        }
      }
      if (params.archive) {
        this.store.dispatch(modelsActions.setArchive({archive: true}));
      }
      if (params.columns) {
        this.columnsReordered(params.columns);
        const hiddenCols = {};
        this.tableCols.forEach((tableCol)=>{
          if(tableCol.id!=='selected'){
            hiddenCols[tableCol.id] = !params.columns.includes(tableCol.id)
          }
        })
        this.store.dispatch(modelsActions.setHiddenCols({hiddenCols}));
      }
      this.dispatchAndLock(new modelsActions.FetchModelsRequested());
    });

    this.selectedModelsSub = this.selectedModels$.subscribe(selectedModels => {
      this.selectedModels = selectedModels;
    });
    this.autorRefreshSub = interval(AUTO_REFRESH_INTERVAL).pipe(
      withLatestFrom(this.autoRefreshState$, this.activeSectionEdit$),
      filter(([iteration, autoRefreshState, activeSectionEdit]) => autoRefreshState && activeSectionEdit === null)
    ).subscribe(() => {
      this.refreshList(true);
    });

    this.selectModelFromUrl();
    this.syncAppSearch();
    this.store.dispatch(modelsActions.getUsers());
    this.store.dispatch(modelsActions.getFrameworks());
    this.store.dispatch(modelsActions.getTags());
    this.store.dispatch(getTags());
  }

  ngOnDestroy(): void {
    this.selectedModelSubs.unsubscribe();
    this.ModelFromUrlSub.unsubscribe();
    this.autorRefreshSub.unsubscribe();
    this.selectedModelsSub.unsubscribe();
    this.hiddenTableColsSub.unsubscribe();
    this.store.dispatch(new modelsActions.ResetState());
    this.stopSyncSearch();
  }

  stopSyncSearch() {
    this.searchSubs.unsubscribe();
    this.store.dispatch(new ResetSearch());
    this.store.dispatch(modelsActions.resetGlobalFilter());
  }

  syncAppSearch() {
    this.store.dispatch(new InitSearch('Search for models'));
    this.searchSubs = this.searchQuery$.pipe(skip(1)).subscribe(query => {
      this.onSearchValueChanged(query);
    });
  }

  getNextModels() {
    this.store.dispatch(new modelsActions.GetNextModels());
  }

  selectModelFromUrl() {
    this.ModelFromUrlSub = combineLatest([this.store.pipe(select(selectRouterParams), map(params => get('modelId', params))), this.models$])
      .pipe(
        map(([modelId, models]) => models.find(model => model.id === modelId))
      )
      .subscribe((selectedModel) => {
        this.store.dispatch(new modelsActions.SetSelectedModel(selectedModel));
      });
  }

  filterArchivedModels(models: ITableModel[], showArchived: boolean) {
    if (showArchived) {
      return models.filter(model => model.system_tags && model.system_tags.includes('archived'));
    } else {
      return models.filter(model => !model.system_tags || !(model.system_tags.includes('archived')));
    }
  }

  modelSelectionChanged(model: ITableModel) {
    this.store.dispatch(new modelsActions.ModelSelectionChanged({model: model, project: this.projectId}));
  }

  modelsSelectionChanged(models: Array<ITableModel>) {
    this.store.dispatch(new modelsActions.SetSelectedModels(models));
  }

  sortedChanged({colId, sortOrder}: { sortOrder: TableSortOrderEnum; colId: string }) {
    this.dispatchAndLock(new modelsActions.TableSortChanged({colId, sortOrder}));
  }

  filterChanged({col, value}: { col: ISmCol; value: any }) {
    this.dispatchAndLock(new modelsActions.TableFilterChanged({col: col.id, value, filterMatchMode: col.filterMatchMode}));
  }

  compareModels() {
    // TODO: temporary until the compare component will be under models module...
    this.router.navigate(
      [
        `${this.route.parent.snapshot.params.projectId}/models/compare-models`,
        {ids: this.selectedModels.map(model => model.id)}
      ]
    );
  }

  archiveModels() {
    this.store.dispatch(new modelsActions.ArchivedSelectedModels());
  }

  restoreModels() {
    this.store.dispatch(new modelsActions.RestoreSelectedModels());
  }

  onSearchValueChanged(value: string) {
    this.store.dispatch(new modelsActions.GlobalFilterChanged(value));
  }

  archivedChanged(isArchived: boolean) {
    const navigate = () => {
      this.dispatchAndLock(modelsActions.setArchive({archive: isArchived}));
      this.store.dispatch(new ResetProjectSelection());
    };

    if (this.selectedModels.length > 0) {
      const archiveDialog: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title    : 'Are you sure?',
          body     : 'Navigating between "Live" and "Archive" will deselect your selected models.',
          yes      : 'Proceed',
          no       : 'Back',
          iconClass: ''
        }
      });

      archiveDialog.afterClosed().subscribe((confirmed) => {
        if (confirmed) {
          navigate();
        }
      });
    } else {
      navigate();
    }
  }

  onViewModeChanged(viewMode: ModelsViewModesEnum) {
    this.store.dispatch(new modelsActions.SetViewMode(viewMode));
  }

  refreshList(isAutorefresh: boolean) {
    if (this.refreshing) {
      return;
    }
    if (!isAutorefresh) {
      this.refreshing = true;
    }

    this.store.dispatch(new modelsActions.RefreshModels({hideLoader: isAutorefresh, autoRefresh: isAutorefresh}));
  }


  showAllSelected(active: boolean) {
    this.store.dispatch(new modelsActions.ShowAllSelected(active));
  }

  setAutoRefresh($event: boolean) {
    this.store.dispatch(new SetAutoRefresh($event));
  }

  columnsReordered(cols: string[]) {
    this.store.dispatch(modelsActions.changeColsOrder({cols: cols}));
  }

  selectedTableColsChanged(col) {
    this.dispatchAndLock(modelsActions.toggleColHidden({colName: col.itemValue}));
  }

  refreshTagsList() {
    this.store.dispatch(modelsActions.getTags());
  }
}
