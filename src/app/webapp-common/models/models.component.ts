import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {get, isEqual} from 'lodash/fp';
import {combineLatest, interval, Observable, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, skip, tap, withLatestFrom} from 'rxjs/operators';
import {AUTO_REFRESH_INTERVAL} from '~/app.constants';
import {getTags, resetProjectSelection, setDeep} from '../core/actions/projects.actions';
import {InitSearch, ResetSearch} from '../common-search/common-search.actions';
import {ICommonSearchState, selectSearchQuery} from '../common-search/common-search.reducer';
import {setAutoRefresh} from '../core/actions/layout.actions';
import {
  selectCompanyTags,
  selectIsArchivedMode,
  selectProjectSystemTags,
  selectProjectTags,
  selectTagsFilterByProject
} from '../core/reducers/projects.reducer';
import {selectRouterParams} from '../core/reducers/router-reducer';
import {selectAppVisible, selectAutoRefresh} from '../core/reducers/view.reducer';
import {BaseEntityPage} from '../shared/entity-page/base-entity-page';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {ISmCol, TableSortOrderEnum} from '../shared/ui-components/data/table/table.consts';
import {ConfirmDialogComponent} from '../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {decodeFilter, decodeOrder} from '../shared/utils/tableParamEncode';
import * as modelsActions from './actions/models-view.actions';
import {MODELS_TABLE_COLS} from './models.consts';
import * as modelsSelectors from './reducers';
import {selectModelsFrameworks, selectModelsTags, selectModelsUsers, selectModelTableColumns} from './reducers';
import {IModelsViewState} from './reducers/models-view.reducer';
import {SelectedModel, TableModel} from './shared/models.model';
import {User} from '~/business-logic/model/users/user';
import {SortMeta} from 'primeng/api';
import {selectIsSharedAndNotOwner} from '~/features/experiments/reducers';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {ShowItemsFooterSelected} from '../shared/entity-page/footer-items/show-items-footer-selected';
import {DividerFooterItem} from '../shared/entity-page/footer-items/divider-footer-item';
import {ArchiveFooterItem} from '../shared/entity-page/footer-items/archive-footer-item';
import {DeleteFooterItem} from '../shared/entity-page/footer-items/delete-footer-item';
import {MoveToFooterItem} from '../shared/entity-page/footer-items/move-to-footer-item';
import {addTag} from './actions/models-menu.actions';
import {ModelsTableComponent} from './shared/models-table/models-table.component';
import {
  CountAvailableAndIsDisableSelectedFiltered,
  MenuItems
} from '../shared/entity-page/items.utils';
import {PublishFooterItem} from '../shared/entity-page/footer-items/publish-footer-item';
import { HasReadOnlyFooterItem } from '../shared/entity-page/footer-items/has-read-only-footer-item';
import { SelectedTagsFooterItem } from '../shared/entity-page/footer-items/selected-tags-footer-item';
import {setTableFilters} from './actions/models-view.actions';


@Component({
  selector   : 'sm-models',
  templateUrl: './models.component.html',
  styleUrls  : ['./models.component.scss']
})
export class ModelsComponent extends BaseEntityPage implements OnInit, OnDestroy {
  public readonly originalTableColumns = MODELS_TABLE_COLS;
  public entityTypeEnum = EntityTypeEnum;
  public models$: Observable<TableModel[]>;
  public tableSortFields$: Observable<SortMeta[]>;
  public tableSortOrder$: Observable<TableSortOrderEnum>;
  public selectedModels$: Observable<TableModel[]>;
  public selectedModel$: Observable<SelectedModel>;
  public searchValue$: Observable<ICommonSearchState['searchQuery']>;
  public isArchived$: Observable<boolean>;
  public tableFilters$: Observable<{[s: string]: FilterMetadata}>;
  public noMoreModels$: Observable<boolean>;
  public showAllSelectedIsActive$: Observable<boolean>;
  public showInfo$: Observable<boolean>;
  protected setSplitSizeAction = modelsActions.setSplitSize;
  private selectedModels: TableModel[];
  private selectedModelSubs: Subscription;
  private searchSubs: Subscription;
  private selectedModelsSub: Subscription;
  private modelFromUrlSub: Subscription;
  private searchQuery$: Observable<ICommonSearchState['searchQuery']>;
  public autoRefreshState$: Observable<boolean>;
  private refreshing: boolean;
  private autoRefreshSub: Subscription;
  public activeSectionEdit$: Observable<string>;
  public selectedProjectId$: Observable<string>;
  public tableColsOrder$: Observable<string[]>;
  public users$: Observable<User[]>;
  public tags$: Observable<string[]>;
  private tagsFilterByProject$: Observable<boolean>;
  private projectTags$: Observable<string[]>;
  private companyTags$: Observable<string[]>;
  public systemTags$: Observable<string[]>;
  public tableCols$: Observable<ISmCol[]>;
  public frameworks$: Observable<string[]>;
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
    this.tableCols$ = this.store.select(selectModelTableColumns)
      .pipe(
        distinctUntilChanged((a, b) => isEqual(a, b)),
        tap(() => this.table?.table?.resize(100))
      );

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

    this.selectedModelSubs = combineLatest([
      this.store.select(selectRouterParams).pipe(map(params => params?.projectId)),
      this.route.queryParams,
    ]).pipe(
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
        this.store.dispatch(modelsActions.setTableSort({orders, projectId: this.projectId}));
      }
      if (params.filter) {
        const filters = decodeFilter(params.filter);
        this.store.dispatch(modelsActions.setTableFilters({filters, projectId}));
      } else {
        if (params.order) {
        this.store.dispatch(modelsActions.setTableFilters({filters: [], projectId}));
      }
      }
      if (params.archive) {
        this.store.dispatch(modelsActions.setArchive({archive: true}));
      }
      if (params.deep) {
        this.store.dispatch(setDeep({deep: true}));
      }

      if (params.columns) {
        this.columnsReordered(params.columns, true);
        const hiddenCols = {};
        this.originalTableColumns.forEach((tableCol)=>{
          if(tableCol.id!=='selected'){
            hiddenCols[tableCol.id] = !params.columns.includes(tableCol.id);
          }
        });
        this.store.dispatch(modelsActions.setHiddenCols({hiddenCols}));
      }
      this.dispatchAndLock(modelsActions.fetchModelsRequested());
    });

    this.selectedModelsSub = this.selectedModels$.subscribe(selectedModels => {
      this.selectedModels = selectedModels;
    });
    this.autoRefreshSub = interval(AUTO_REFRESH_INTERVAL).pipe(
      withLatestFrom(this.autoRefreshState$, this.activeSectionEdit$, this.isAppVisible$),
      filter(([, autoRefreshState, activeSectionEdit, isAppVisible]) => autoRefreshState && activeSectionEdit === null && isAppVisible)
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
    this.modelFromUrlSub.unsubscribe();
    this.autoRefreshSub.unsubscribe();
    this.selectedModelsSub.unsubscribe();
    this.store.dispatch(modelsActions.resetState());
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
    this.store.dispatch(modelsActions.getNextModels());
  }

  selectModelFromUrl() {
    this.modelFromUrlSub = combineLatest([
      this.store.select(selectRouterParams).pipe(
        map(params => get('modelId', params))
      ),
      this.models$
    ]).pipe(
      map(([modelId, models]) => models.find(model => model.id === modelId)),
      distinctUntilChanged()
    ).subscribe((selectedModel) => {
      this.store.dispatch(modelsActions.setSelectedModel({model: selectedModel}));
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
    this.store.dispatch(modelsActions.modelSelectionChanged({model, project: this.projectId}));
  }

  modelsSelectionChanged(models: SelectedModel[]) {
    this.store.dispatch(modelsActions.setSelectedModels({models}));
  }

  sortedChanged({colId, isShift}: { isShift: boolean; colId: string }) {
    this.dispatchAndLock(modelsActions.tableSortChanged({colId, isShift}));
  }

  filterChanged({col, value, andFilter}: { col: ISmCol; value: any; andFilter?: boolean }) {
    this.dispatchAndLock(modelsActions.tableFilterChanged({
      filter: {
        col: col.id,
        value,
        filterMatchMode: col.filterMatchMode || andFilter ? 'AND' : undefined
      },
      projectId: this.projectId
    }));
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
      this.store.dispatch(resetProjectSelection());
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

  refreshList(isAutorefresh: boolean) {
    if (this.refreshing) {
      return;
    }
    if (!isAutorefresh) {
      this.refreshing = true;
    }

    this.store.dispatch(modelsActions.refreshModels({hideLoader: isAutorefresh, autoRefresh: isAutorefresh}));
  }


  showAllSelected(active: boolean) {
    this.dispatchAndLock(modelsActions.showSelectedOnly({active, projectId: this.projectId}));
  }

  setAutoRefresh($event: boolean) {
    this.store.dispatch(setAutoRefresh({autoRefresh: $event}));
  }

  columnsReordered(cols: string[], fromUrl = false) {
    this.store.dispatch(modelsActions.setColsOrderForProject({cols, project: this.projectId, fromUrl}));
  }

  selectedTableColsChanged(col) {
    this.dispatchAndLock(modelsActions.toggleColHidden({columnId: col.id, projectId: this.projectId}));
  }

  columnResized(event: { columnId: string; widthPx: number }) {
    this.store.dispatch(modelsActions.setColumnWidth({
      ...event,
      projectId: this.projectId,
    }));
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
    this.footerState$ = this.createFooterState(config.selected$, config.data$, config.showAllSelectedIsActive$, config.companyTags$, config.projectTags$, config.tagsFilterByProject$);

    this.footerItems = [
      new ShowItemsFooterSelected(config.entitiesType),
      new DividerFooterItem(),

      new ArchiveFooterItem(config.entitiesType),
      new DeleteFooterItem(),
      new SelectedTagsFooterItem(config.entitiesType),
      new DividerFooterItem(),

      new MoveToFooterItem(),
      new PublishFooterItem(EntityTypeEnum.model),
      new HasReadOnlyFooterItem()
    ];
  }
  onFooterHandler({emitValue, item}) {
    switch (item.id) {
      case MenuItems.showAllItems:
        this.showAllSelected(!emitValue);
        break;
      case MenuItems.archive:
        this.table.contextMenuExtended.contextMenu.archiveClicked();
        break;
      case MenuItems.delete:
        this.table.contextMenuExtended.contextMenu.deleteModelPopup();
        break;
      case MenuItems.moveTo:
        this.table.contextMenuExtended.contextMenu.moveToProjectPopup();
        break;
      case MenuItems.publish:
        this.table.contextMenuExtended.contextMenu.publishPopup();
        break;
    }
  }

  clearTableFiltersHandler(tableFilters: any) {
    const filters = Object.keys(tableFilters).map( col => ({col, value: []}));
    this.store.dispatch(setTableFilters({filters, projectId: this.projectId}));
  }
}
