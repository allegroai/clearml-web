import {AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {selectActiveParentsFilter, selectCompareSelectedMetrics, selectCustomColumns, selectExperimentsList, selectExperimentsParents, selectExperimentsTableColsOrder, selectExperimentsTags, selectExperimentsTypes, selectFilteredTableCols, selectHyperParamsOptions, selectHyperParamsVariants, selectIsExperimentInEditMode, selectMetricVariants, selectMetricVariantsPlots, selectNoMoreExperiments, selectSelectedExperiments, selectSelectedExperimentsDisableAvailable, selectSelectedTableExperiment, selectShowAllSelectedIsActive, selectShowCompareScalarSettings, selectSplitSize, selectTableFilters, selectTableMode, selectTableRefreshList, selectTableSortFields} from './reducers';
import {selectCompanyTags, selectIsArchivedMode, selectIsDeepMode, selectProjectSystemTags, selectSelectedProjectId, selectTagsFilterByProject} from '../core/reducers/projects.reducer';
import {ColHeaderTypeEnum, ISmCol, TableSortOrderEnum} from '../shared/ui-components/data/table/table.consts';
import {Params} from '@angular/router';
import {isEqual} from 'lodash-es';
import {selectRouterParams} from '../core/reducers/router-reducer';
import {distinctUntilChanged, filter, map, skip, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {combineLatest, Observable} from 'rxjs';
import {selectAppVisible, selectBackdropActive} from '../core/reducers/view.reducer';
import {initSearch, resetSearch} from '../common-search/common-search.actions';
import {SearchState, selectSearchQuery} from '../common-search/common-search.reducer';
import {ITableExperiment} from './shared/common-experiment-model.model';
import {selectIsSharedAndNotOwner, selectMetricsLoading, selectSelectedExperiment} from '~/features/experiments/reducers';
import * as experimentsActions from './actions/common-experiments-view.actions';
import {addProjectsTag, getSelectedExperiments, setTableCols, tableFilterChanged, toggleCompareScalarSettings} from './actions/common-experiments-view.actions';
import {MetricVariantResult} from '~/business-logic/model/projects/metricVariantResult';
import {resetAceCaretsPositions, setAutoRefresh} from '../core/actions/layout.actions';
import {setArchive as setProjectArchive, setBreadcrumbsOptions, setDeep} from '../core/actions/projects.actions';
import {createCompareMetricColumn, createMetricColumn, decodeColumns, decodeFilter, decodeOrder} from '../shared/utils/tableParamEncode';
import {BaseEntityPageComponent} from '../shared/entity-page/base-entity-page';
import {groupHyperParams} from '../shared/utils/shared-utils';
import {selectCurrentUser} from '../core/reducers/users-reducer';
import {GetCurrentUserResponseUserObject} from '~/business-logic/model/users/getCurrentUserResponseUserObject';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {ProjectsGetTaskParentsResponseParents} from '~/business-logic/model/projects/projectsGetTaskParentsResponseParents';
import {SortMeta} from 'primeng/api';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {ShowItemsFooterSelected} from '../shared/entity-page/footer-items/show-items-footer-selected';
import {CompareFooterItem} from '../shared/entity-page/footer-items/compare-footer-item';
import {DividerFooterItem} from '../shared/entity-page/footer-items/divider-footer-item';
import {ArchiveFooterItem} from '../shared/entity-page/footer-items/archive-footer-item';
import {SelectedTagsFooterItem} from '../shared/entity-page/footer-items/selected-tags-footer-item';
import {DeleteFooterItem} from '../shared/entity-page/footer-items/delete-footer-item';
import {ResetFooterItem} from '../shared/entity-page/footer-items/reset-footer-item';
import {PublishFooterItem} from '../shared/entity-page/footer-items/publish-footer-item';
import {MoveToFooterItem} from '../shared/entity-page/footer-items/move-to-footer-item';
import {EnqueueFooterItem} from '../shared/entity-page/footer-items/enqueue-footer-item';
import {AbortFooterItem} from '../shared/entity-page/footer-items/abort-footer-item';
import {addTag} from './actions/common-experiments-menu.actions';
import {CountAvailableAndIsDisableSelectedFiltered, MenuItems, selectionDisabledAbort, selectionDisabledAbortAllChildren, selectionDisabledArchive, selectionDisabledDelete, selectionDisabledDequeue, selectionDisabledEnqueue, selectionDisabledMoveTo, selectionDisabledPublishExperiments, selectionDisabledQueue, selectionDisabledReset, selectionDisabledViewWorker} from '../shared/entity-page/items.utils';
import {ExperimentsTableComponent} from './dumb/experiments-table/experiments-table.component';
import {DequeueFooterItem} from '../shared/entity-page/footer-items/dequeue-footer-item';
import {HasReadOnlyFooterItem} from '../shared/entity-page/footer-items/has-read-only-footer-item';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {encodeHyperParameter, filterArchivedExperiments} from './shared/common-experiments.utils';
import {AbortAllChildrenFooterItem} from '../shared/entity-page/footer-items/abort-all-footer-item';
import {ExperimentMenuExtendedComponent} from '~/features/experiments/containers/experiment-menu-extended/experiment-menu-extended.component';
import {INITIAL_EXPERIMENT_TABLE_COLS} from './experiment.consts';
import {selectIsPipelines} from '@common/experiments-compare/reducers';
import {ExperimentMenuComponent} from '@common/experiments/shared/components/experiment-menu/experiment-menu.component';
import {WelcomeMessageComponent} from '@common/layout/welcome-message/welcome-message.component';
import {ConfigurationService} from '@common/shared/services/configuration.service';
import {isReadOnly} from '@common/shared/utils/is-read-only';
import {rootProjectsPageSize} from '@common/constants';
import {SelectionEvent} from '@common/experiments/dumb/select-metric-for-custom-col/select-metric-for-custom-col.component';

@Component({
  selector: 'sm-common-experiments',
  templateUrl: './experiments.component.html',
  styleUrls: ['./experiments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentsComponent extends BaseEntityPageComponent implements OnInit, OnDestroy, AfterViewInit {

  public tableCols = INITIAL_EXPERIMENT_TABLE_COLS;

  public entityTypeEnum = EntityTypeEnum;
  public experiments$: Observable<Array<ITableExperiment>>;
  public selectedExperimentsHasUpdate$: Observable<boolean>;
  public noMoreExperiments$: Observable<boolean>;
  public tableSortFields$: Observable<SortMeta[]>;
  public tableSortOrder$: Observable<TableSortOrderEnum>;
  public selectedExperiments$: Observable<Array<ITableExperiment>>;
  public isArchived$: Observable<boolean>;
  public tableFilters$: Observable<{ [columnId: string]: FilterMetadata }>;
  public filteredTableCols$: Observable<ISmCol[]>;
  public tableCols$: Observable<ISmCol[]>;
  public metricVariants$: Observable<MetricVariantResult[]>;
  public metricVariantsPlots$: Observable<MetricVariantResult[]>;
  public compareSelectedMetricsPlots$: Observable<MetricVariantResult[]>;
  public compareSelectedMetricsScalars$: Observable<MetricVariantResult[]>;
  public hyperParams$: Observable<any[]>;
  public hyperParamsOptions$: Observable<Record<ISmCol['id'], string[]>>;
  public selectedTableExperiment$ = this.store.select(selectSelectedTableExperiment);
  public selectedExperimentsDisableAvailable$: Observable<Record<string, CountAvailableAndIsDisableSelectedFiltered>>;
  public backdropActive$: Observable<boolean>;
  public metricLoading$: Observable<boolean>;
  public tableColsOrder$: Observable<string[]>;
  public parents$: Observable<ProjectsGetTaskParentsResponseParents[]>;
  public activeParentsFilter$: Observable<ProjectsGetTaskParentsResponseParents[]>;
  public tags$: Observable<string[]>;
  public companyTags$: Observable<string[]>;
  public tagsFilterByProject$: Observable<boolean>;
  public systemTags$: Observable<string[]>;
  public types$: Observable<string[]>;
  public currentUser$: Observable<GetCurrentUserResponseUserObject>;
  public selectedExperiment$: Observable<IExperimentInfo>;
  public isSharedAndNotOwner$: Observable<boolean>;
  public readOnlySelection: boolean;
  public contextMenuActive: boolean;
  public tableMode$: Observable<'table' | 'info' | 'compare'>;
  public contextMenu: ExperimentMenuComponent;
  public isPipeline$: Observable<boolean>;
  protected override entityType = EntityTypeEnum.experiment;
  public singleRowContext: boolean;
  public selectedDisableAvailable;
  public firstExperiment: ITableExperiment;
  public menuBackdrop: boolean;
  protected setTableModeAction = experimentsActions.setTableMode;
  protected inEditMode$: Observable<boolean>;
  private sortFields: SortMeta[];
  protected isAppVisible$: Observable<boolean>;
  private searchQuery$: Observable<SearchState['searchQuery']>;
  protected override parents: ProjectsGetTaskParentsResponseParents[];

  @ViewChild('experimentsTable') public table: ExperimentsTableComponent;
  @ViewChild('contextMenuExtended') contextMenuExtended: ExperimentMenuExtendedComponent;
  public tableMode: 'table' | 'info' | 'compare';
  public showCompareScalarSettings$: Observable<boolean>;


  constructor() {
    super();
    this.setSplitSizeAction = experimentsActions.setSplitSize;
    this.addTag = addTag;
    this.selectSplitSize$ = this.store.select(selectSplitSize);
    this.isPipeline$ = this.store.select(selectIsPipelines);
    this.tableSortFields$ = this.store.select(selectTableSortFields).pipe(tap(field => this.sortFields = field));
    this.backdropActive$ = this.store.select(selectBackdropActive);
    this.noMoreExperiments$ = this.store.select(selectNoMoreExperiments);
    this.tableFilters$ = this.store.select(selectTableFilters);
    this.isArchived$ = this.store.select(selectIsArchivedMode);
    this.showAllSelectedIsActive$ = this.store.select(selectShowAllSelectedIsActive);
    this.selectedExperimentsDisableAvailable$ = this.store.select(selectSelectedExperimentsDisableAvailable);
    this.selectedExperiment$ = this.store.select(selectSelectedExperiment);
    this.selectedExperimentsHasUpdate$ = this.store.select(selectTableRefreshList);
    this.selectedExperiments$ = this.store.select(selectSelectedExperiments)
      .pipe(tap((selectedExperiments: ITableExperiment[]) => {
        this.selectedExperiments = selectedExperiments;
        this.readOnlySelection = this.selectedExperiments.some(exp => isReadOnly(exp));
      }));
    this.searchQuery$ = this.store.select(selectSearchQuery);
    this.isAppVisible$ = this.store.select(selectAppVisible);
    this.inEditMode$ = this.store.select(selectIsExperimentInEditMode);
    this.isSharedAndNotOwner$ = this.store.select(selectIsSharedAndNotOwner);
    this.parents$ = this.store.select(selectExperimentsParents).pipe(tap(parents => this.parents = parents));
    this.activeParentsFilter$ = this.store.select(selectActiveParentsFilter);
    this.types$ = this.store.select(selectExperimentsTypes);
    this.tags$ = this.store.select(selectExperimentsTags);
    this.tagsFilterByProject$ = this.store.select(selectTagsFilterByProject);
    this.companyTags$ = this.store.select(selectCompanyTags);
    this.systemTags$ = this.store.select(selectProjectSystemTags);
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.tableColsOrder$ = this.store.select(selectExperimentsTableColsOrder);
    this.metricVariants$ = this.store.select(selectMetricVariants);
    this.metricVariantsPlots$ = this.store.select(selectMetricVariantsPlots);
    this.metricLoading$ = this.store.select(selectMetricsLoading);
    this.hyperParamsOptions$ = this.store.select(selectHyperParamsOptions);
    this.hyperParams$ = this.store.select(selectHyperParamsVariants).pipe(
      map(hyperParams => groupHyperParams(hyperParams))
    );
    this.experiments$ = this.store.select(selectExperimentsList)
      .pipe(
        filter(experiments => experiments !== null),
        withLatestFrom(this.isArchived$),
        // lil hack for hiding archived task after they have been archived from task info or footer...
        map(([experiments, showArchived]) => filterArchivedExperiments(experiments, showArchived)));

    this.filteredTableCols$ = this.store.select(selectFilteredTableCols);


    this.tableCols$ = this.filteredTableCols$.pipe(
      distinctUntilChanged((a, b) => isEqual(a, b)),
      map(cols => cols.filter(col => !col.hidden))
    );
    this.tableMode$ = this.store.select(selectTableMode).pipe(tap(tableMode => this.tableMode = tableMode));
    this.showCompareScalarSettings$ = this.store.select(selectShowCompareScalarSettings);
    this.compareSelectedMetricsScalars$ = this.store.select(selectCompareSelectedMetrics('scalars'));
    this.compareSelectedMetricsPlots$ = this.store.select(selectCompareSelectedMetrics('plots'));
    this.syncAppSearch();
  }

  override ngOnInit() {
    super.ngOnInit();
    if (this.route.snapshot.firstChild?.routeConfig.path.startsWith('compare/')) {
      this.compareViewMode = this.route.snapshot.firstChild?.routeConfig.path.replace(/compare\//, '') as 'scalars' | 'plots' || 'scalars';
    } else {
      this.compareViewMode = 'scalars';
    }
    this.store.dispatch(setTableCols({cols: this.tableCols}));
    let prevQueryParams: Params;
    this.sub.add(this.store.select(selectRouterParams).pipe(map(params => this.getParamId(params))).subscribe(() =>
      this.store.dispatch(resetAceCaretsPositions())));
    this.sub.add(combineLatest([
        this.store.select(selectSelectedProjectId),
        this.route.queryParams,
        this.store.select(selectCustomColumns)
      ])
        .pipe(
          filter(([projectId, queryParams]) => {
            if (!projectId) {
              return false;
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {q, qreg, ...queryParamsWithoutSearch} = queryParams;
            const equal = projectId === this.projectId && isEqual(queryParamsWithoutSearch, prevQueryParams);
            prevQueryParams = queryParamsWithoutSearch;
            return !equal;
          })
        )
        .subscribe(([projectId, params]) => {
          if (projectId != this.projectId && Object.keys(params || {}).length === 0) {
            this.emptyUrlInit();
          } else {
            this.projectId = projectId;
            if (this.entityType === this.entityTypeEnum.experiment) {
              this.setupContextMenu('experiments');
            }
            if (params.columns) {
              const [cols, metrics, hyperParams, , allIds] = decodeColumns(params.columns, this.tableCols);
              this.store.dispatch(experimentsActions.setVisibleColumnsForProject({
                visibleColumns: cols,
                projectId: this.projectId
              }));
              this.store.dispatch(experimentsActions.setExtraColumns({
                projectId: this.selectedProjectId,
                columns: metrics.map(metricCol => createMetricColumn(metricCol, projectId))
                  .concat(hyperParams.map(param => this.createParamColumn(decodeURIComponent(param), projectId)))
              }));
              this.columnsReordered(allIds, false);
            }
            if (params.order) {
              const orders = decodeOrder(params.order);
              this.store.dispatch(experimentsActions.setTableSort({orders, projectId}));
            }
            if (params.filter) {
              const filters = decodeFilter(params.filter);
              this.store.dispatch(experimentsActions.setTableFilters({filters, projectId}));
            } else {
              if (params.order) {
                this.store.dispatch(experimentsActions.setTableFilters({filters: [], projectId}));
              }
            }
            if (params.deep) {
              this.store.dispatch(setDeep({deep: true}));
            }
            this.store.dispatch(setProjectArchive({archive: params.archive === 'true'}));
            this.store.dispatch(experimentsActions.getExperiments());
          }
        })
    );

    this.createFooterItemsRunner();


    this.selectExperimentFromUrl();
    this.store.dispatch(experimentsActions.getParents({searchValue: null}));
    this.store.dispatch(experimentsActions.getTags({}));
    this.store.dispatch(experimentsActions.getProjectTypes({}));
  }

  createFooterItemsRunner = () => this.createFooterItems({
    entitiesType: this.entityType,
    showAllSelectedIsActive$: this.showAllSelectedIsActive$,
    selected$: this.selectedExperiments$,
    tags$: this.tags$,
    data$: this.selectedExperimentsDisableAvailable$,
    companyTags$: this.companyTags$,
    projectTags$: this.store.select(selectSelectedProjectId).pipe(switchMap(id =>
      id === '*' ? this.companyTags$ : this.tags$
    )),
    tagsFilterByProject$: this.tagsFilterByProject$
  });

  override ngAfterViewInit() {
    super.ngAfterViewInit();
    if (this.contextMenuExtended) {
      this.contextMenu = this.contextMenuExtended.contextMenu;
    }
  }

  protected emptyUrlInit() {
    this.store.dispatch(experimentsActions.updateUrlParams());
    this.shouldOpenDetails = true;
  }

  getSelectedEntities() {
    return this.selectedExperiments;
  }

  override createFooterItems(config: {
    entitiesType: EntityTypeEnum;
    selected$: Observable<Array<ITableExperiment>>;
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
      ...((this.getTableModeFromURL() === 'compare') ? [] : [
        new ArchiveFooterItem(config.entitiesType),
        new DeleteFooterItem(),
        new DividerFooterItem()
      ]),
      new EnqueueFooterItem(),
      new DequeueFooterItem(),
      new ResetFooterItem(config.entitiesType),
      new AbortFooterItem(config.entitiesType),
      new AbortAllChildrenFooterItem(),
      new PublishFooterItem(this.entityType),
      new DividerFooterItem(),

      new SelectedTagsFooterItem(this.entityType),
      new DividerFooterItem(),

      new MoveToFooterItem(),
      new HasReadOnlyFooterItem()
    ];
  }

  onFooterHandler({emitValue, item}) {
    this.singleRowContext = false;
    window.setTimeout(() => {
      switch (item.id) {
        case MenuItems.showAllItems:
          this.showAllSelected(!emitValue);
          break;
        case MenuItems.compare:
          this.compareExperiments();
          break;
        case MenuItems.archive:
          this.contextMenu.restoreArchive(item.entitiesType);
          break;
        case MenuItems.reset:
          this.contextMenu.resetPopup();
          break;
        case MenuItems.publish:
          this.contextMenu.publishPopup();
          break;
        case MenuItems.enqueue:
          this.contextMenu.enqueuePopup();
          break;
        case MenuItems.dequeue:
          this.contextMenu.dequeuePopup();
          break;
        case MenuItems.delete:
          this.contextMenu.deleteExperimentPopup();
          break;
        case MenuItems.abort:
          this.contextMenu.stopPopup();
          break;
        case MenuItems.abortAllChildren:
          this.contextMenu.stopAllChildrenPopup();
          break;
        case MenuItems.moveTo:
          this.contextMenu.moveToProjectPopup();
          break;
      }
    });
  }

  onAddTag(tag: string, contextExperiment: ITableExperiment) {
    this.store.dispatch(addTag({
      tag,
      experiments: this.singleRowContext ? [contextExperiment] : this.selectedExperiments.filter(_selected => !isReadOnly(_selected))
    }));
    this.store.dispatch(addProjectsTag({tag}));
  }

  setContextMenuStatus(menuStatus: boolean) {
    this.contextMenuActive = menuStatus;
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.store.dispatch(experimentsActions.resetExperiments());
    this.stopSyncSearch();
    this.table = undefined;
    if (this.contextMenuExtended?.contextMenu) {
      this.contextMenuExtended.contextMenu = null;
    }
  }

  stopSyncSearch() {
    this.store.dispatch(resetSearch());
    this.store.dispatch(experimentsActions.resetGlobalFilter());
  }

  syncAppSearch() {
    this.store.dispatch(initSearch({payload: 'Search for experiments'}));

    this.sub.add(this.searchQuery$.pipe(skip(1)).subscribe(query => {
      this.store.dispatch(experimentsActions.globalFilterChanged(query));
    }));
  }

  selectExperimentFromUrl() {
    this.sub.add(combineLatest([
        this.store.select(selectRouterParams).pipe(map(params => this.getParamId(params))),
        this.experiments$
      ])
        .pipe(
          withLatestFrom(this.store.select(selectTableMode)),
          map(([[experimentId, experiments], mode]) => {
            this.firstExperiment = experiments?.[0];
            this.entities = experiments;
            const experimentsIds = this.route.snapshot.firstChild?.params?.ids?.split(',').filter(id => !!id);
            if (mode === 'compare' && experimentsIds?.length > 0 && this.selectedExperiments.length === 0) {
              this.store.dispatch(getSelectedExperiments({ids: experimentsIds}));
            }
            if (!experimentId && this.shouldOpenDetails && this.firstExperiment && mode === 'info') {
              this.shouldOpenDetails = false;
              this.store.dispatch(experimentsActions.experimentSelectionChanged({
                experiment: this.firstExperiment,
                project: this.selectedProjectId
              }));
            } else if (mode !== 'compare' || this.entityType !== EntityTypeEnum.experiment) {
              this.store.dispatch(experimentsActions.setTableMode({mode: this.getTableModeFromURL()}));
            } else if (this.shouldOpenDetails) {
              this.modeChanged(mode);
              this.shouldOpenDetails = false;
            } else {
              this.modeChanged(this.getTableModeFromURL());
            }

            return experiments.find(experiment => experiment.id === experimentId);
          }),
          distinctUntilChanged()
        )
        .subscribe((selectedExperiment) => {
            this.tableMode = this.getTableModeFromURL();
            this.store.dispatch(experimentsActions.setSelectedExperiment({experiment: selectedExperiment}));
          }
        )
    );
  }

  public getTableModeFromURL() {
    return this.route.snapshot.firstChild?.routeConfig.path.includes('compare/') ? 'compare' :
      this.route.snapshot.firstChild?.routeConfig.path === undefined ? 'table' : 'info';
  }

  getNextExperiments() {
    this.store.dispatch(experimentsActions.getNextExperiments());
  }

  experimentsSelectionChanged(experiments: Array<ITableExperiment>) {
    this.store.dispatch(experimentsActions.setSelectedExperiments({experiments, compareMode: this.compareViewMode}));
    if (this.getTableModeFromURL() === 'compare') {
      this.router.navigate(['compare', this.compareViewMode, {ids: experiments.map(ex => ex.id)}],
        {relativeTo: this.route, queryParamsHandling: 'preserve'});
    }
  }

  experimentSelectionChanged(event: { experiment: ITableExperiment; openInfo?: boolean }) {
    (this.minimizedView || event.openInfo) && event.experiment && this.store.dispatch(experimentsActions.experimentSelectionChanged({
      experiment: event.experiment,
      project: this.selectedProjectId
    }));
  }

  sortedChanged(event: { isShift: boolean; colId: ISmCol['id'] }) {
    this.store.dispatch(experimentsActions.tableSortChanged(event));
  }

  filterChanged({col, value, andFilter}: { col: ISmCol; value: any; andFilter?: boolean }) {
    this.store.dispatch(experimentsActions.tableFilterChanged({
      filters: [{
        col: col.id,
        value,
        filterMatchMode: col.filterMatchMode || andFilter ? 'AND' : undefined
      }], projectId: this.projectId
    }));
  }

  compareExperiments() {
    this.router.navigate(
      [
        `compare-experiments`,
        {ids: this.selectedExperiments.map(experiment => experiment.id).join(',')}
      ],
      {relativeTo: this.route.parent.parent});
  }

  afterArchiveChanged() {
    this.store.dispatch(experimentsActions.showOnlySelected({active: false, projectId: this.projectId}));
  }

  showAllSelected(active: boolean) {
    this.store.dispatch(experimentsActions.showOnlySelected({active, projectId: this.projectId}));
  }

  selectedTableColsChanged(col: ISmCol) {
    this.store.dispatch(experimentsActions.toggleColHidden({columnId: col.id, projectId: this.projectId}));
  }

  toggleSelectedMetricHidden(col: ISmCol) {
    this.store.dispatch(experimentsActions.toggleSelectedMetricCompare({columnId: col.id, projectId: this.projectId, compareView: this.compareViewMode}));
  }

  getMetricsToDisplay() {
    if (this.getTableModeFromURL() !== 'compare') {
      this.store.dispatch(experimentsActions.getCustomMetrics({hideLoader: true}));
      this.store.dispatch(experimentsActions.getCustomHyperParams());
    }
  }

  selectedMetricToShow(event: SelectionEvent) {
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
      this.store.dispatch(experimentsActions.addColumn({col: variantCol}));
    } else {
      this.store.dispatch(experimentsActions.removeCol({id: variantCol.id, projectId: variantCol.projectId}));
    }
    this.store.dispatch(experimentsActions.updateUrlParams());
  }

  compareSelectedMetricToShow(event: SelectionEvent) {
    const variantCol = createCompareMetricColumn(event.variant);
    if (event.addCol) {
      this.store.dispatch(experimentsActions.addSelectedMetric({col: variantCol, projectId: this.projectId, compareView: this.compareViewMode}));
    } else {
      this.store.dispatch(experimentsActions.removeSelectedMetric({id: variantCol.id, projectId: this.projectId, compareView: this.compareViewMode}));
    }
  }

  createParamColumn(param: string, projectId?: string): ISmCol {
    return {
      id: param,
      getter: encodeHyperParameter(param),
      headerType: ColHeaderTypeEnum.sortFilter,
      sortable: true,
      filterable: true,
      header: decodeURIComponent(param.replace('hyperparams.', '')),
      hidden: false,
      projectId: projectId || this.projectId,
      isParam: true,
      style: {width: '200px'},
      searchableFilter: true,
      asyncFilter: true,
      paginatedFilterPageSize: rootProjectsPageSize
    };
  }

  selectedHyperParamToShow(event: { param: string; addCol: boolean }) {
    const variantCol = this.createParamColumn(event.param);
    if (event.addCol) {
      this.store.dispatch(experimentsActions.addColumn({col: variantCol}));
    } else {
      this.store.dispatch(experimentsActions.removeCol({id: variantCol.id, projectId: variantCol.projectId}));
    }
    this.store.dispatch(experimentsActions.updateUrlParams());
  }

  removeColFromList(colId: string) {
    const sortIndex = this.sortFields.findIndex(field => field.field === colId);
    if (sortIndex > -1) {
      this.store.dispatch(experimentsActions.resetSortOrder({sortIndex, projectId: this.projectId}));
    }
    this.store.dispatch(experimentsActions.removeCol({id: colId, projectId: this.projectId}));
    this.store.dispatch(experimentsActions.updateUrlParams());
  }

  compareRemoveColFromList(colId: string) {
    this.store.dispatch(experimentsActions.removeSelectedMetric({id: colId, projectId: this.projectId, compareView: this.compareViewMode}));
  }

  columnResized(event: { columnId: string; widthPx: number }) {
    this.store.dispatch(experimentsActions.setColumnWidth({
      ...event,
      projectId: this.projectId
    }));
  }

  refreshList(isAutorefresh: boolean) {
    this.store.dispatch(experimentsActions.refreshExperiments({
      hideLoader: isAutorefresh,
      autoRefresh: isAutorefresh
    }));
  }

  setAutoRefresh($event: boolean) {
    this.store.dispatch(setAutoRefresh({autoRefresh: $event}));
  }

  clearSelection() {
    this.store.dispatch(experimentsActions.clearHyperParamsCols({projectId: this.projectId}));
  }

  columnsReordered(cols: string[], updateUrl = true) {
    this.store.dispatch(experimentsActions.setColsOrderForProject({cols, project: this.projectId}));
    if (updateUrl) {
      this.store.dispatch(experimentsActions.updateUrlParams());
    }
  }

  refreshTagsList() {
    this.store.dispatch(experimentsActions.getTags({}));
  }

  refreshTypesList() {
    this.store.dispatch(experimentsActions.getProjectTypes({}));
  }

  protected getParamId(params) {
    return params?.experimentId;
  }

  clearTableFiltersHandler(tableFilters: { [s: string]: FilterMetadata }) {
    const filters = Object.keys(tableFilters).map(col => ({col, value: []}));
    this.store.dispatch(tableFilterChanged({filters, projectId: this.selectedProjectId}));
  }

  onContextMenuOpen({x, y, single, backdrop}: { x: number; y: number; single?: boolean; backdrop?: boolean }) {
    this.singleRowContext = single;
    this.menuBackdrop = !!backdrop;
    this.contextMenu.openMenu({x, y});
  }

  getSingleSelectedDisableAvailable(experiment) {
    return {
      [MenuItems.abort]: selectionDisabledAbort([experiment]),
      [MenuItems.abortAllChildren]: selectionDisabledAbortAllChildren([experiment]),
      [MenuItems.publish]: selectionDisabledPublishExperiments([experiment]),
      [MenuItems.reset]: selectionDisabledReset([experiment]),
      [MenuItems.delete]: selectionDisabledDelete([experiment]),
      [MenuItems.moveTo]: selectionDisabledMoveTo([experiment]),
      [MenuItems.enqueue]: selectionDisabledEnqueue([experiment]),
      [MenuItems.dequeue]: selectionDisabledDequeue([experiment]),
      [MenuItems.queue]: selectionDisabledQueue([experiment]),
      [MenuItems.viewWorker]: selectionDisabledViewWorker([experiment]),
      [MenuItems.archive]: selectionDisabledArchive([experiment])
    };
  }

  modeChanged(mode: 'info' | 'table' | 'compare') {
    if (this.getTableModeFromURL() === mode) {
      if (this.tableMode !== mode) {
        this.store.dispatch(experimentsActions.setTableMode({mode}));
      }
      return false;
    }
    this.store.dispatch(experimentsActions.setTableMode({mode}));
    setTimeout(() => this.createFooterItemsRunner(), 100);
    if (mode === 'info') {
      this.store.dispatch(experimentsActions.experimentSelectionChanged({
        experiment: this.selectedExperiments?.[0] || this.firstExperiment,
        project: this.selectedProjectId
      }));
      return Promise.resolve();
    } else if (mode === 'compare') {
      return this.compareView();
    } else {
      return this.closePanel();
    }
  }

  newExperiment() {
    this.dialog.open(WelcomeMessageComponent, {
      width: '720px',
      height: '764px',
      data: {
        showTabs: true,
        step: 2,
        newExperimentYouTubeVideoId: ConfigurationService.globalEnvironment.newExperimentYouTubeVideoId
      }
    });
  }

  downloadTableAsCSV() {
    this.table.table.downloadTableAsCSV(`ClearML ${this.selectedProject.id === '*' ? 'All' : this.selectedProject?.basename?.substring(0, 60)} Experiments`);
  }

  downloadFullTableAsCSV() {
    this.store.dispatch(experimentsActions.prepareTableForDownload({entityType: 'task'}));
  }

  override setupBreadcrumbsOptions() {
    this.sub.add(combineLatest([
      this.selectedProject$,
      this.store.select(selectIsDeepMode)
    ]).subscribe(([selectedProject, isDeep]) => {
      this.store.dispatch(setBreadcrumbsOptions({
        breadcrumbOptions: {
          showProjects: !!selectedProject,
          featureBreadcrumb: {
            name: 'PROJECTS',
            url: 'projects'
          },
          ...(isDeep && selectedProject?.id !== '*' && {
            subFeatureBreadcrumb: {
              name: 'All Experiments'
            }
          }),
          projectsOptions: {
            basePath: 'projects',
            filterBaseNameWith: null,
            compareModule: null,
            showSelectedProject: selectedProject?.id !== '*',
            ...(selectedProject && {
              selectedProjectBreadcrumb: {
                name: selectedProject?.id === '*' ? 'All Experiments' : selectedProject?.basename,
                url: `projects/${selectedProject?.id}/projects`
              }
            })
          }
        }
      }));
    }));
  }

  showCompareSettingsChanged() {
    this.store.dispatch(toggleCompareScalarSettings());
  }

  compareViewChanged(compareView: 'scalars' | 'plots') {
    this.compareViewMode = compareView;
    this.router.navigate(['compare', compareView, {ids: this.selectedExperiments.map(ex => ex.id)}], {
      relativeTo: this.route,
      queryParamsHandling: 'preserve'
    });
    setTimeout(() => this.compareViewMode = this.route.snapshot.firstChild?.routeConfig.path.replace(/compare\//, '') as 'scalars' | 'plots' || 'scalars');
  }
}
