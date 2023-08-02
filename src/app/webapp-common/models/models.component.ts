import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {isEqual} from 'lodash-es';
import {combineLatest, Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, skip, switchMap, withLatestFrom} from 'rxjs/operators';
import {
  getCompanyTags,
  getTags,
  setArchive as setProjectArchive,
  setBreadcrumbsOptions,
  setDeep, setSelectedProject
} from '../core/actions/projects.actions';
import {initSearch, resetSearch} from '../common-search/common-search.actions';
import {SearchState, selectSearchQuery} from '../common-search/common-search.reducer';
import {resetAceCaretsPositions, setAutoRefresh} from '../core/actions/layout.actions';
import {
  selectCompanyTags,
  selectIsArchivedMode, selectIsDeepMode,
  selectProjectSystemTags,
  selectProjectTags,
  selectSelectedProjectId,
  selectTagsFilterByProject
} from '../core/reducers/projects.reducer';
import {selectAppVisible} from '../core/reducers/view.reducer';
import {BaseEntityPageComponent} from '../shared/entity-page/base-entity-page';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {ISmCol, TableSortOrderEnum} from '../shared/ui-components/data/table/table.consts';
import {
  createMetadataCol,
  createMetricColumn,
  decodeColumns,
  decodeFilter,
  decodeOrder
} from '../shared/utils/tableParamEncode';
import * as modelsActions from './actions/models-view.actions';
import {MODELS_TABLE_COLS} from './models.consts';
import * as modelsSelectors from './reducers';
import {
  selectMetadataColsForProject,
  selectMetadataColsOptions,
  selectMetadataKeys,
  selectMetricVariants,
  selectModelsFrameworks,
  selectModelsTags,
  selectModelTableColumns,
  selectTableMode
} from './reducers';
import {SelectedModel, TableModel} from './shared/models.model';
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
import {CountAvailableAndIsDisableSelectedFiltered, MenuItems} from '../shared/entity-page/items.utils';
import {PublishFooterItem} from '../shared/entity-page/footer-items/publish-footer-item';
import {HasReadOnlyFooterItem} from '../shared/entity-page/footer-items/has-read-only-footer-item';
import {SelectedTagsFooterItem} from '../shared/entity-page/footer-items/selected-tags-footer-item';
import {RefreshService} from '@common/core/services/refresh.service';
import {CompareFooterItem} from '@common/shared/entity-page/footer-items/compare-footer-item';
import {MetricVariantResult} from '~/business-logic/model/projects/metricVariantResult';
import {MetricValueType} from '@common/experiments-compare/experiments-compare.constants';
import {CustomColumnMode} from '@common/experiments/shared/common-experiments.const';
import {ALL_PROJECTS_OBJECT} from '@common/core/effects/projects.effects';


@Component({
  selector: 'sm-models',
  templateUrl: './models.component.html',
  styleUrls: ['./models.component.scss']
})
export class ModelsComponent extends BaseEntityPageComponent implements OnInit, OnDestroy {
  public readonly originalTableColumns = MODELS_TABLE_COLS;
  public entityTypeEnum = EntityTypeEnum;
  public models$: Observable<TableModel[]>;
  public tableSortFields$: Observable<SortMeta[]>;
  public tableSortOrder$: Observable<TableSortOrderEnum>;
  public selectedModels$: Observable<TableModel[]>;
  public selectedModel$: Observable<SelectedModel>;
  public searchValue$: Observable<SearchState['searchQuery']>;
  public isArchived$: Observable<boolean>;
  public tableFilters$: Observable<{ [s: string]: FilterMetadata }>;
  public noMoreModels$: Observable<boolean>;
  public showAllSelectedIsActive$: Observable<boolean>;
  public showInfo$: Observable<boolean>;
  public activeSectionEdit$: Observable<boolean>;
  public selectedProjectId$: Observable<string>;
  public tableColsOrder$: Observable<string[]>;
  public tags$: Observable<string[]>;
  public tableMode$: Observable<'table' | 'info'>;
  public systemTags$: Observable<string[]>;
  public tableCols$: Observable<ISmCol[]>;
  public frameworks$: Observable<string[]>;
  public isSharedAndNotOwner$: Observable<boolean>;
  public selectedModelsDisableAvailable$: Observable<Record<string, CountAvailableAndIsDisableSelectedFiltered>>;
  public metadataKeys$: Observable<string[]>;
  public filteredTableCols$: Observable<ISmCol[]>;
  public firstModel: TableModel;
  public metadataColsOptions$: Observable<Record<ISmCol['id'], string[]>>;
  public metricVariants$: Observable<MetricVariantResult[]>;
  public modelsPage$: Observable<boolean>;
  protected inEditMode$: Observable<boolean>;
  protected addTag = addTag;
  protected setSplitSizeAction = modelsActions.setSplitSize;
  protected setTableModeAction = modelsActions.setTableMode;
  private selectedModels: TableModel[];
  private searchQuery$: Observable<SearchState['searchQuery']>;
  private isAppVisible$: Observable<boolean>;
  private readonly tagsFilterByProject$: Observable<boolean>;
  private readonly projectTags$: Observable<string[]>;
  private readonly companyTags$: Observable<string[]>;

  @ViewChild('modelsTable') private table: ModelsTableComponent;
  private modelsFeature = false;

  constructor(
    protected store: Store,
    protected route: ActivatedRoute,
    protected router: Router,
    protected dialog: MatDialog,
    protected refresh: RefreshService,
  ) {
    super(store, route, router, dialog, refresh);
    this.selectSplitSize$ = this.store.select(modelsSelectors.selectSplitSize);
    this.tableSortFields$ = this.store.select(modelsSelectors.selectTableSortFields);
    this.selectedModel$ = this.store.select(modelsSelectors.selectSelectedTableModel);
    this.selectedModels$ = this.store.select(modelsSelectors.selectSelectedModels);
    this.selectedModelsDisableAvailable$ = this.store.select(modelsSelectors.selectSelectedModelsDisableAvailable);
    this.tableFilters$ = this.store.select(modelsSelectors.selectTableFilters);
    this.searchValue$ = this.store.select(modelsSelectors.selectGlobalFilter);
    this.isArchived$ = this.store.select(selectIsArchivedMode);
    this.noMoreModels$ = this.store.select(modelsSelectors.selectNoMoreModels);
    this.isSharedAndNotOwner$ = this.store.select(selectIsSharedAndNotOwner);
    this.metadataColsOptions$ = this.store.select(selectMetadataColsOptions);
    this.metricVariants$ = this.store.select(selectMetricVariants);
    this.modelsPage$ = this.store.select(modelsSelectors.selectModesPage);

    this.showAllSelectedIsActive$ = this.store.select(modelsSelectors.selectShowAllSelectedIsActive);
    this.searchQuery$ = this.store.select(selectSearchQuery);
    this.isAppVisible$ = this.store.select(selectAppVisible);
    this.activeSectionEdit$ = this.store.select(modelsSelectors.selectActiveSectionEdit);
    this.inEditMode$ = this.store.select(modelsSelectors.selectIsModelInEditMode);
    this.tableColsOrder$ = this.store.select(modelsSelectors.selectModelsTableColsOrder);
    this.selectedProjectId$ = this.store.select(modelsSelectors.selectProjectId);
    this.tags$ = this.store.select(selectModelsTags);
    this.metadataKeys$ = this.store.select(selectMetadataKeys);
    this.tagsFilterByProject$ = this.store.select(selectTagsFilterByProject);
    this.projectTags$ = this.store.select(selectProjectTags);
    this.companyTags$ = this.store.select(selectCompanyTags);
    this.systemTags$ = this.store.select(selectProjectSystemTags);
    this.frameworks$ = this.store.select(selectModelsFrameworks);
    this.tableMode$ = this.store.select(selectTableMode);
    this.filteredTableCols$ = combineLatest([
      this.store.select(selectModelTableColumns).pipe(distinctUntilChanged(isEqual)),
      this.store.select(selectMetadataColsForProject).pipe(distinctUntilChanged(isEqual))
    ])
      .pipe(
        debounceTime(50),
        map(([tableCols, metaCols]) =>
          tableCols.concat(metaCols.map(col => ({...col, meta: true})))
        ));

    let child = this.route.snapshot;
    while (child.firstChild && !child.data.setAllProject) {
      child = child.firstChild;
    }
    if (child.data.setAllProject) {
      this.store.dispatch(getCompanyTags());
      this.modelsFeature =true;
    }

    this.tableCols$ = this.filteredTableCols$.pipe(
      distinctUntilChanged(isEqual),
      map(cols => cols.filter(col => !col.hidden))
    );

    this.models$ = this.store.select(modelsSelectors.selectModelsList).pipe(
      filter(models => models !== null),
      withLatestFrom(this.isArchived$),
      // lil hack for hiding archived models after they been archived from models info or footer...
      map(([models, showArchived]) => this.filterArchivedModels(models, showArchived)),
    );
    this.showInfo$ = this.store.select(modelsSelectors.selectModelId);
    this.syncAppSearch();
  }

  ngOnInit() {
    super.ngOnInit();
    let prevQueryParams: Params;
    this.sub.add(this.selectedProject$.pipe(filter(selectedProject => (this.modelsFeature && !selectedProject))).subscribe(() =>
      this.store.dispatch(setSelectedProject({project: ALL_PROJECTS_OBJECT}))
    ));
    this.sub.add(combineLatest([
        this.store.select(modelsSelectors.selectProjectId),
        this.route.queryParams,
      ])
        .pipe(
          filter(([projectId, queryParams]) => {
            if (!projectId) {
              return false;
            }
            const equal = projectId === this.projectId && isEqual(queryParams, prevQueryParams);
            prevQueryParams = queryParams;
            return !equal;
          })
        )
        .subscribe(([projectId, params]: [string, Params]) => {
          if (projectId != this.projectId && Object.keys(params || {}).length === 0) {
            this.emptyUrlInit();
          } else {
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
            this.store.dispatch(setProjectArchive({archive: !!params.archive}));
            if (params.deep) {
              this.store.dispatch(setDeep({deep: true}));
            }

            if (params.columns) {
              const [, metrics, , metadataCols, allIds] = decodeColumns(params.columns, this.originalTableColumns);
              const hiddenCols = {};
              this.originalTableColumns.forEach((tableCol) => {
                if (tableCol.id !== 'selected') {
                  hiddenCols[tableCol.id] = !params.columns.includes(tableCol.id);
                }
              });
              this.store.dispatch(modelsActions.setHiddenCols({hiddenCols}));
              this.store.dispatch(modelsActions.setExtraColumns({
                projectId: projectId ?? this.projectId,
                columns: metadataCols.map(metadataCol => createMetadataCol(metadataCol, projectId))
                  .concat(metrics.map(metricCol => createMetricColumn(metricCol, projectId)))
              }));
              this.columnsReordered(allIds, false);
            }
            this.store.dispatch(modelsActions.fetchModelsRequested());
          }
          this.projectId = projectId;
        })
    );

    this.createFooterItems({
      entitiesType: EntityTypeEnum.model,
      selected$: this.selectedModels$,
      showAllSelectedIsActive$: this.showAllSelectedIsActive$,
      tags$: this.tags$,
      data$: this.selectedModelsDisableAvailable$,
      tagsFilterByProject$: this.tagsFilterByProject$,
      companyTags$: this.companyTags$,
      projectTags$: this.store.select(selectSelectedProjectId).pipe(switchMap(id =>
        id === '*' ? this.companyTags$ : this.projectTags$
      )),
    });

    this.sub.add(this.selectedModels$.subscribe(selectedModels => this.selectedModels = selectedModels));

    this.selectModelFromUrl();
    this.store.dispatch(modelsActions.getFrameworks());
    this.store.dispatch(modelsActions.getTags());
    this.store.dispatch(getTags());
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.store.dispatch(modelsActions.resetState());
    this.stopSyncSearch();
  }

  private emptyUrlInit() {
    this.store.dispatch(modelsActions.updateUrlParams());
    this.shouldOpenDetails = true;
  }

  getSelectedEntities() {
    return this.selectedModels;
  }

  stopSyncSearch() {
    this.store.dispatch(resetSearch());
    this.store.dispatch(modelsActions.resetGlobalFilter());
  }

  syncAppSearch() {
    this.store.dispatch(initSearch({payload: 'Search for models'}));
    this.sub.add(this.searchQuery$.pipe(skip(1)).subscribe(query => this.store.dispatch(modelsActions.globalFilterChanged(query))));
  }

  getNextModels() {
    this.store.dispatch(modelsActions.getNextModels());
  }

  selectModelFromUrl() {
    this.sub.add(combineLatest([
        this.store.select(modelsSelectors.selectModelId),
        this.models$
      ])
        .pipe(
          withLatestFrom(this.store.select(selectTableMode)),
          map(([[id, models], mode]) => {
            this.firstModel = models?.[0];
            if (!id && this.shouldOpenDetails && this.firstModel && mode === 'info') {
              this.shouldOpenDetails = false;
              this.store.dispatch(modelsActions.modelSelectionChanged({
                model: this.firstModel,
                project: this.projectId
              }));
            } else {
              this.store.dispatch(modelsActions.setTableMode({mode: !!id ? 'info' : 'table'}));
            }
            return models?.find(model => model.id === id);
          }),
          distinctUntilChanged()
        )
        .subscribe((selectedModel) => {
          this.store.dispatch(modelsActions.setSelectedModel({model: selectedModel}));
          this.store.dispatch(resetAceCaretsPositions());
        })
    );
  }

  filterArchivedModels(models: TableModel[], showArchived: boolean) {
    if (showArchived) {
      return models?.filter(model => model.system_tags && model.system_tags.includes('archived'));
    } else {
      return models?.filter(model => !model.system_tags || !(model.system_tags.includes('archived')));
    }
  }

  modelSelectionChanged(event: { model: SelectedModel; openInfo?: boolean }) {
    (this.minimizedView || event.openInfo) && event.model && this.store.dispatch(modelsActions.modelSelectionChanged({
      model: event.model,
      project: this.projectId
    }));
  }

  modelsSelectionChanged(models: SelectedModel[]) {
    this.store.dispatch(modelsActions.setSelectedModels({models}));
  }

  sortedChanged({colId, isShift}: { isShift: boolean; colId: string }) {
    this.store.dispatch(modelsActions.tableSortChanged({colId, isShift}));
  }

  filterChanged({col, value, andFilter}: { col: ISmCol; value: any; andFilter?: boolean }) {

    this.store.dispatch(modelsActions.tableFilterChanged({
      filters: [{
        col: col.id,
        value,
        filterMatchMode: col.filterMatchMode || andFilter ? 'AND' : undefined
      }],
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

  afterArchiveChanged() {
    this.store.dispatch(modelsActions.showSelectedOnly({active: false, projectId: this.projectId}));
  }

  refreshList(isAutorefresh: boolean) {
    this.store.dispatch(modelsActions.refreshModels({hideLoader: isAutorefresh, autoRefresh: isAutorefresh}));
  }


  showAllSelected(active: boolean) {
    this.store.dispatch(modelsActions.showSelectedOnly({active, projectId: this.projectId}));
  }

  setAutoRefresh($event: boolean) {
    this.store.dispatch(setAutoRefresh({autoRefresh: $event}));
  }

  columnsReordered(cols: string[], fromUrl = false) {
    this.store.dispatch(modelsActions.setColsOrderForProject({cols, project: this.projectId, fromUrl}));
    this.store.dispatch(modelsActions.updateUrlParams());
  }

  selectedTableColsChanged(col) {
    this.store.dispatch(modelsActions.toggleColHidden({columnId: col.id, projectId: this.projectId}));
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

  protected getParamId(params) {
    return params?.modelId;
  }

  createFooterItems(config: {
    entitiesType: EntityTypeEnum;
    selected$: Observable<Array<any>>;
    showAllSelectedIsActive$: Observable<boolean>;
    tags$: Observable<string[]>;
    data$?: Observable<Record<string, CountAvailableAndIsDisableSelectedFiltered>>;
    companyTags$: Observable<string[]>;
    projectTags$: Observable<string[]>;
    tagsFilterByProject$: Observable<boolean>;
  }) {
    super.createFooterItems(config);
    this.footerItems = [
      new ShowItemsFooterSelected(config.entitiesType),
      new CompareFooterItem(config.entitiesType),
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
      case MenuItems.compare:
        this.compareExperiments();
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

  compareExperiments() {
    this.router.navigate(
      [
        `compare-models`,
        {ids: this.selectedModels.map(experiment => experiment.id).join(',')},
        'models-details'
      ],
      {relativeTo: this.route.parent.parent});
  }

  clearTableFiltersHandler(tableFilters: any) {
    const filters = Object.keys(tableFilters).map(col => ({col, value: []}));
    this.store.dispatch(modelsActions.tableFilterChanged({filters, projectId: this.projectId}));
  }

  selectMetadataKeysActiveChanged(mode: { customMode: CustomColumnMode }) {
    if (mode.customMode === CustomColumnMode.Metadata) {
      this.store.dispatch(modelsActions.getMetadataKeysForProject());
    } else if (mode.customMode === CustomColumnMode.Metrics) {
      this.store.dispatch(modelsActions.getCustomMetrics());
    }
  }


  addOrRemoveMetadataKeyFromColumns($event: { key: string; show: boolean }) {
    if ($event.show) {
      this.store.dispatch(modelsActions.addColumn({col: createMetadataCol($event.key, this.projectId)}));
    } else {
      this.store.dispatch(modelsActions.removeCol({id: $event.key, projectId: this.projectId}));
    }
  }

  removeColFromList(id: string) {
    if (id.startsWith('last_metrics')) {
      this.store.dispatch(modelsActions.removeMetricCol({id, projectId: this.projectId}));
    } else {
      this.store.dispatch(modelsActions.removeCol({id: id.split('.')[1], projectId: this.projectId}));
    }
  }

  modeChanged(mode: 'info' | 'table') {
    if (mode === 'info') {
      this.store.dispatch(modelsActions.setTableMode({mode}));
      this.firstModel && this.store.dispatch(modelsActions.modelSelectionChanged({
        model: this.selectedModels?.[0] || this.firstModel,
        project: this.projectId
      }));
    } else {
      return this.closePanel();
    }
  }

  selectedMetricToShow(event: { variant: MetricVariantResult; addCol: boolean; valueType: MetricValueType }) {
    if (!event.valueType) {
      return;
    }
    const variantCol = createMetricColumn({
      metricHash: event.variant.metric_hash,
      variantHash: event.variant.variant_hash,
      valueType: event.valueType,
      metric: event.variant.metric,
      variant: event.variant.variant
    }, this.projectId);
    if (event.addCol) {
      this.store.dispatch(modelsActions.addColumn({col: variantCol}));
    } else {
      this.store.dispatch(modelsActions.removeMetricCol({id: variantCol.id, projectId: variantCol.projectId}));
    }
  }

  downloadTableAsCSV() {
    this.table.table.downloadTableAsCSV(`ClearML ${this.selectedProject.id === '*'? 'All': this.selectedProject?.basename?.substring(0, 60)} Models`);
  }

  downloadFullTableAsCSV() {
    this.store.dispatch(modelsActions.prepareTableForDownload({entityType: 'model'}));
  }

  setupBreadcrumbsOptions() {
    this.sub.add(this.selectedProject$.pipe(
      withLatestFrom(this.store.select(selectIsDeepMode)),
    ).subscribe(([selectedProject, isDeep]) => {
      if (this.modelsFeature) {
        this.store.dispatch(setBreadcrumbsOptions({
          breadcrumbOptions: {
            showProjects: false,
            featureBreadcrumb: {name: 'Models'},
          }
        }));
      } else {
        this.store.dispatch(setBreadcrumbsOptions({
          breadcrumbOptions: {
            showProjects: !!selectedProject && !this.modelsFeature,
            featureBreadcrumb: {
              name: 'PROJECTS',
              url: 'projects'
            },
            ...(isDeep && selectedProject?.id !== '*' && {
              subFeatureBreadcrumb: {
                name: 'All Models'
              }
            }),
            projectsOptions: {
              basePath: 'projects',
              filterBaseNameWith: null,
              compareModule: null,
              showSelectedProject: selectedProject?.id !== '*',
              ...(selectedProject && {
                selectedProjectBreadcrumb: {
                  name: selectedProject?.id === '*' ? 'All Models' : selectedProject?.basename,
                  url: `projects/${selectedProject?.id}/projects`
                }
              })
            }
          }
        }));
      }
    }));
  }
}
