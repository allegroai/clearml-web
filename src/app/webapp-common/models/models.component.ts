import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {get, isEqual} from 'lodash/fp';
import {combineLatest, interval, Observable, Subscription} from 'rxjs';
import {filter, map, skip, tap, withLatestFrom} from 'rxjs/operators';
import {AUTO_REFRESH_INTERVAL} from '../../app.constants';
import {getTags, ResetProjectSelection, setDeep} from '../core/actions/projects.actions';
import {InitSearch, ResetSearch} from '../common-search/common-search.actions';
import {ICommonSearchState, selectSearchQuery} from '../common-search/common-search.reducer';
import {SetAutoRefresh} from '../core/actions/layout.actions';
import {
  selectCompanyTags,
  selectIsArchivedMode,
  selectProjectSystemTags,
  selectProjectTags,
  selectTagsFilterByProject
} from '../core/reducers/projects.reducer';
import {selectRouterParams} from '../core/reducers/router-reducer';
import {selectAppVisible, selectAutoRefresh} from '../core/reducers/view-reducer';
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
import {SelectedModel, TableModel} from './shared/models.model';
import {User} from '../../business-logic/model/users/user';
import {SortMeta} from 'primeng/api';
import {selectIsSharedAndNotOwner} from '../../features/experiments/reducers';
import {EntityTypeEnum} from '../../shared/constants/non-common-consts';
import {ShowItemsFooterSelected} from '../shared/entity-page/footer-items/show-items-footer-selected';
import {DividerFooterItem} from '../shared/entity-page/footer-items/divider-footer-item';
import {ArchiveFooterItem} from '../shared/entity-page/footer-items/archive-footer-item';
import {DeleteFooterItem} from '../shared/entity-page/footer-items/delete-footer-item';
import {MoveToFooterItem} from '../shared/entity-page/footer-items/move-to-footer-item';
import {addTag} from './actions/models-menu.actions';
import {ModelsTableComponent} from './shared/models-table/models-table.component';
import {
  CountAvailableAndIsDisable,
  CountAvailableAndIsDisableSelectedFiltered,
  MENU_ITEM_ID
} from '../shared/entity-page/items.utils';
import {PublishFooterItem} from '../shared/entity-page/footer-items/publish-footer-item';
import { HasReadOnlyFooterItem } from '../shared/entity-page/footer-items/has-read-only-footer-item';
import { SelectedTagsFooterItem } from '../shared/entity-page/footer-items/selected-tags-footer-item';


@Component({
  selector   : 'sm-models',
  templateUrl: './models.component.html',
  styleUrls  : ['./models.component.scss']
})
export class ModelsComponent extends BaseEntityPage implements OnInit, OnDestroy {

  public EntityTypeEnum = EntityTypeEnum;
  public models$: Observable<Array<TableModel>>;
  public tableSortFields$: Observable<SortMeta[]>;
  public tableSortOrder$: Observable<TableSortOrderEnum>;
  public selectedModels$: Observable<Array<any>>;
  public selectedModel$: Observable<SelectedModel>;
  public searchValue$: Observable<ICommonSearchState['searchQuery']>;
  public isArchived$: Observable<boolean>;
  public viewMode$: Observable<ModelsViewModesEnum>;
  public tableFilters$: Observable<{[s: string]: FilterMetadata}>;
  public noMoreModels$: Observable<boolean>;
  public showAllSelectedIsActive$: Observable<boolean>;
  public showInfo$: Observable<boolean>;
  protected setSplitSizeAction = modelsActions.setSplitSize;
  private selectedModels: TableModel[];
  private selectedModelSubs: Subscription;
  private searchSubs: Subscription;
  private selectedModelsSub: Subscription;
  private ModelFromUrlSub: Subscription;
  private searchQuery$: Observable<ICommonSearchState['searchQuery']>;
  public autoRefreshState$: Observable<boolean>;
  private refreshing: boolean;
  private autoRefreshSub: Subscription;
  public activeSectionEdit$: Observable<string>;
  public selectedProjectId$: Observable<string>;
  public tableColsOrder$: Observable<string[]>;
  public users$: Observable<Array<User>>;
  public tags$: Observable<string[]>;
  private tagsFilterByProject$: Observable<boolean>;
  private projectTags$: Observable<string[]>;
  private companyTags$: Observable<string[]>;
  public systemTags$: Observable<string[]>;
  public hiddenTableCols$: Observable<{ [p: string]: boolean }>;
  public tableCols = MODELS_TABLE_COLS;
  public filteredTableCols= MODELS_TABLE_COLS;
  private hiddenTableColsSub: Subscription;
  public frameworks$: Observable<Array<string>>;
  public isSharedAndNotOwner$: Observable<boolean>;
  private isAppVisible$: Observable<boolean>;
  protected addTag = addTag;
  @ViewChild('modelsTable') private table: ModelsTableComponent;
  public selectedModelsDisableAvailable$: Observable<Record<string, CountAvailableAndIsDisableSelectedFiltered>>;


  constructor(
    protected store: Store<IModelsViewState>, private route: ActivatedRoute, private router: Router,
    private dialog: MatDialog
  ) {
    super(store);
    this.selectSplitSize$ = this.store.select(modelsSelectors.selectSplitSize);
    this.tableSortFields$ = this.store.select(modelsSelectors.selectTableSortFields);
    this.selectedModel$ = this.store.select(modelsSelectors.selectSelectedTableModel);
    this.selectedModels$ = this.store.select(modelsSelectors.selectSelectedModels);
    this.selectedModelsDisableAvailable$ = this.store.select(modelsSelectors.selectedModelsDisableAvailable);
    this.tableFilters$ = this.store.select(modelsSelectors.selectTableFilters);
    this.searchValue$ = this.store.select(modelsSelectors.selectGlobalFilter);
    this.isArchived$ = this.store.select(selectIsArchivedMode);
    this.noMoreModels$ = this.store.select(modelsSelectors.selectNoMoreModels);
    this.viewMode$ = this.store.select(modelsSelectors.selectViewMode);
    this.isSharedAndNotOwner$ = this.store.select(selectIsSharedAndNotOwner);

    this.showAllSelectedIsActive$ = this.store.select(modelsSelectors.selectShowAllSelectedIsActive);
    this.searchQuery$ = this.store.select(selectSearchQuery);
    this.autoRefreshState$ = this.store.select(selectAutoRefresh);
    this.isAppVisible$ = this.store.select(selectAppVisible);
    this.activeSectionEdit$ = this.store.select(modelsSelectors.selectActiveSectionEdit);
    this.tableColsOrder$ = this.store.select(modelsSelectors.selectModelsTableColsOrder);
    this.selectedProjectId$ = this.store.select(selectRouterParams).pipe(map(params => get('projectId', params)));
    this.tags$ = this.store.select(selectModelsTags);
    this.tagsFilterByProject$ = this.store.select(selectTagsFilterByProject);
    this.projectTags$ = this.store.select(selectProjectTags);
    this.companyTags$ = this.store.select(selectCompanyTags);
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
    this.syncAppSearch();
  }

  ngOnInit() {
    super.ngOnInit();
    this.createFooterItems({
      entitiesType: EntityTypeEnum.model,
      selected$: this.selectedModels$,
      showAllSelectedIsActive$: this.showAllSelectedIsActive$,
      tags$: this.tags$,
      data$: this.selectedModelsDisableAvailable$,
      tagsFilterByProject$: this.tagsFilterByProject$,
      companyTags$: this.companyTags$,
      projectTags$: this.projectTags$
    });
    let prevQueryParams: Params;

    this.hiddenTableColsSub = this.hiddenTableCols$.subscribe(hiddenCols => {
      this.tableCols.map(tableCol => {
        tableCol.hidden = hiddenCols[tableCol.id];
        return tableCol;
      });
      this.filteredTableCols = MODELS_TABLE_COLS.filter(tableCol => !hiddenCols[tableCol.id]);
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
        const orders = decodeOrder(params.order);
        this.store.dispatch(modelsActions.setTableSort({orders}));
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
      if (params.deep) {
        this.store.dispatch(setDeep({deep: true}));
      }

      if (params.columns) {
        this.columnsReordered(params.columns);
        const hiddenCols = {};
        this.tableCols.forEach((tableCol)=>{
          if(tableCol.id!=='selected'){
            hiddenCols[tableCol.id] = !params.columns.includes(tableCol.id);
          }
        });
        this.store.dispatch(modelsActions.setHiddenCols({hiddenCols}));
      }
      this.dispatchAndLock(new modelsActions.FetchModelsRequested());
    });

    this.selectedModelsSub = this.selectedModels$.subscribe(selectedModels => {
      this.selectedModels = selectedModels;
    });
    this.autoRefreshSub = interval(AUTO_REFRESH_INTERVAL).pipe(
      withLatestFrom(this.autoRefreshState$, this.activeSectionEdit$, this.isAppVisible$),
      filter(([iteration, autoRefreshState, activeSectionEdit, isAppVisible]) => autoRefreshState && activeSectionEdit === null && isAppVisible)
    ).subscribe(() => {
      this.refreshList(true);
    });

    this.selectModelFromUrl();
    this.store.dispatch(modelsActions.getUsers());
    this.store.dispatch(modelsActions.getFrameworks());
    this.store.dispatch(modelsActions.getTags());
    this.store.dispatch(getTags());
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.selectedModelSubs.unsubscribe();
    this.ModelFromUrlSub.unsubscribe();
    this.autoRefreshSub.unsubscribe();
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
      this.store.dispatch(modelsActions.globalFilterChanged(query));
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

  filterArchivedModels(models: TableModel[], showArchived: boolean) {
    if (showArchived) {
      return models.filter(model => model.system_tags && model.system_tags.includes('archived'));
    } else {
      return models.filter(model => !model.system_tags || !(model.system_tags.includes('archived')));
    }
  }

  modelSelectionChanged(model: SelectedModel) {
    this.store.dispatch(new modelsActions.ModelSelectionChanged({model, project: this.projectId}));
  }

  modelsSelectionChanged(models: SelectedModel[]) {
    this.store.dispatch(new modelsActions.SetSelectedModels(models));
  }

  sortedChanged({colId, isShift}: { isShift: boolean; colId: string }) {
    this.dispatchAndLock(modelsActions.tableSortChanged({colId, isShift}));
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

  archivedChanged(isArchived: boolean) {
    const navigate = () => {
      this.dispatchAndLock(modelsActions.setArchive({archive: isArchived}));
      this.store.dispatch(new ResetProjectSelection());
      this.closeModelPanel();
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
    this.store.dispatch(modelsActions.changeColsOrder({cols}));
  }

  selectedTableColsChanged(col) {
    this.dispatchAndLock(modelsActions.toggleColHidden({colName: col.id}));
  }

  refreshTagsList() {
    this.store.dispatch(modelsActions.getTags());
  }

  closeModelPanel() {
    this.router.navigate([`projects/${this.projectId}/models`], {queryParamsHandling: 'merge'});
    window.setTimeout(() => this.infoDisabled = false);
  }

  protected getParamId(params) {
    return params?.modelId;
  }

  createFooterItems(config: {
    entitiesType: EntityTypeEnum;
    selected$: Observable<Array<any>>;
    showAllSelectedIsActive$: Observable<boolean>;
    tags$: Observable<string[]>;
    data$?: Observable<Record<string, CountAvailableAndIsDisableSelectedFiltered>>;
    companyTags$:   Observable<string[]>;
    projectTags$: Observable<string[]>;
    tagsFilterByProject$: Observable<boolean>;
  }) {
    const state$ = this.createFooterState(config.selected$, config.data$);

    this.footerItems = [
      new ShowItemsFooterSelected(config.entitiesType, config.showAllSelectedIsActive$, config.selected$),
      new DividerFooterItem(),

      new ArchiveFooterItem(config.entitiesType, state$),
      new DeleteFooterItem(state$),
      new SelectedTagsFooterItem(config.entitiesType, state$, config.companyTags$, config.projectTags$, config.tagsFilterByProject$),
      new DividerFooterItem(),

      new MoveToFooterItem(state$),
      new PublishFooterItem(state$, EntityTypeEnum.model),
      new HasReadOnlyFooterItem(state$)
    ];
  }
  onFooterHandler({emitValue, item}) {
    switch (item.id) {
      case MENU_ITEM_ID.SHOW_ALL_ITEMS:
        this.showAllSelected(!emitValue);
        break;
      case MENU_ITEM_ID.ARCHIVE:
        this.table.contextMenu.archiveClicked();
        break;
      case MENU_ITEM_ID.DELETE:
        this.table.contextMenu.deleteModelPopup();
        break;
      case MENU_ITEM_ID.MOVE_TO:
        this.table.contextMenu.moveToProjectPopup();
        break;
      case MENU_ITEM_ID.PUBLISH:
        this.table.contextMenu.publishPopup();
        break;
    }
  }
}
