import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {setAutoRefresh} from '@common/core/actions/layout.actions';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {Observable, of} from 'rxjs';
import {SortMeta} from 'primeng/api';
import {ISmCol, TableSortOrderEnum} from '@common/shared/ui-components/data/table/table.consts';
import {SearchState, selectSearchQuery} from '@common/common-search/common-search.reducer';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {MetricVariantResult} from '~/business-logic/model/projects/metricVariantResult';
import {distinctUntilChanged, filter, skip, tap} from 'rxjs/operators';
import {isEqual} from 'lodash-es';
import {Params} from '@angular/router';
import {decodeColumns, decodeFilter, decodeOrder} from '@common/shared/utils/tableParamEncode';
import {initSearch, resetSearch} from '@common/common-search/common-search.actions';
import {BaseEntityPageComponent} from '@common/shared/entity-page/base-entity-page';
import {modelServingRoutes, servingLoadingTableCols} from '@common/serving/serving.consts';
import {ServingActions} from '@common/serving/serving.actions';
import {ServingTableComponent} from '@common/serving/serving-table/serving-table.component';
import {servingFeature} from '@common/serving/serving.reducer';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {headerActions} from '@common/core/actions/router.actions';
import {EndpointStats} from '~/business-logic/model/serving/endpointStats';

@Component({
  selector: 'sm-serving-loading',
  templateUrl: './serving.component.html',
  styleUrl: './serving.component.scss'
})
export class ServingLoadingComponent extends BaseEntityPageComponent implements OnInit, OnDestroy {
  public readonly originalTableColumns = servingLoadingTableCols;
  public entityTypeEnum = EntityTypeEnum;
  protected override entityType = EntityTypeEnum.endpointsContainer;
  protected override inEditMode$: Observable<boolean> = of(false);
  public override showAllSelectedIsActive$: Observable<boolean> = of(false);
  public endpoints$: Observable<EndpointStats[]>;
  public tableSortFields$: Observable<SortMeta[]>;
  public tableSortOrder$: Observable<TableSortOrderEnum>;
  public selectedEndpoints$: Observable<EndpointStats[]>;
  public selectedEndpoint$: Observable<EndpointStats>;
  public searchValue$: Observable<SearchState['searchQuery']>;
  public tableFilters$: Observable<Record<string, FilterMetadata>>;
  public tableColsOrder$: Observable<string[]>;
  public tags$: Observable<string[]>;
  public tableMode$: Observable<'table' | 'info'>;
  public systemTags$: Observable<string[]>;
  public tableCols$: Observable<ISmCol[]>;
  public filteredTableCols$: Observable<ISmCol[]>;
  public firstEndpoint: EndpointStats;
  public metricVariants$: Observable<MetricVariantResult[]>;
  protected override setSplitSizeAction = ServingActions.setSplitSize;
  protected setTableModeAction = ServingActions.setTableViewMode;
  private selectedEndpoints: EndpointStats[];
  private searchQuery$: Observable<SearchState['searchQuery']>;
  private readonly tagsFilter$: Observable<boolean>;
  private readonly companyTags$: Observable<string[]>;
  modelNamesOptions$ = this.store.select(servingFeature.modelLoadingNamesOptions);
  inputTypesOptions$ = this.store.select(servingFeature.inputTypesOptions);
  preprocessArtifactOptions$ = this.store.select(servingFeature.preprocessArtifactOptions);

  @ViewChild('endpointsTable') private table: ServingTableComponent;
  viewMode = this.route.snapshot.url[0].path;

  constructor() {
    super();
    this.selectSplitSize$ = this.store.select(servingFeature.selectSplitSize);
    this.tableSortFields$ = this.store.select(servingFeature.selectLoadingTableSortFields);
    this.tableFilters$ = this.store.select(servingFeature.selectLoadingColumnFilters);
    this.searchValue$ = this.store.select(servingFeature.selectGlobalFilter);

    this.searchQuery$ = this.store.select(selectSearchQuery);
    this.tableColsOrder$ = this.store.select(servingFeature.selectLoadingColsOrder);
    this.tableMode$ = this.store.select(servingFeature.selectTableMode);
    this.filteredTableCols$ = this.store.select(servingFeature.selectLoadingServingTableColumns);

    this.tableCols$ = this.filteredTableCols$.pipe(
      distinctUntilChanged(isEqual)
    );

    this.endpoints$ = this.store.select(servingFeature.selectLoadingSortedFilteredEndpoints).pipe(
      filter(endpoints => endpoints !== null)) as Observable<EndpointStats[]>;
    this.syncAppSearch();

    this.setContextMenu();
  }

  override ngOnInit() {
    super.ngOnInit();
    this.store.dispatch(ServingActions.fetchServingLoadingEndpoints());
    let prevQueryParams: Params;

    this.sub.add(this.route.queryParams
        .pipe(
          filter(queryParams => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {q, qreg, ...queryParamsWithoutSearch} = queryParams;
            const equal = isEqual(queryParamsWithoutSearch, prevQueryParams);
            prevQueryParams = queryParamsWithoutSearch;
            return !equal;
          })
        )
        .subscribe(params => {
          if (Object.keys(params || {}).length === 0) {
            this.emptyUrlInit();
          } else {
            if (params.order) {
              const orders = decodeOrder(params.order);
              this.store.dispatch(ServingActions.setLoadingTableSort({orders}));
            }
            if (params.filter) {
              const filters = decodeFilter(params.filter);
              this.store.dispatch(ServingActions.setLoadingTableFilters({filters}));
            } else {
              if (params.order) {
                this.store.dispatch(ServingActions.setLoadingTableFilters({filters: []}));
              }
            }

            if (params.columns) {
              const [, , , , allIds] = decodeColumns(params.columns, this.originalTableColumns);
              this.columnsReordered(allIds, false);
            }
          }
        })
    );
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.store.dispatch(ServingActions.resetState());
    this.stopSyncSearch();
  }

  private emptyUrlInit() {
    this.store.dispatch(ServingActions.updateUrlParamsFromLoadingState());
    this.shouldOpenDetails = true;
  }

  getSelectedEntities() {
    return this.selectedEndpoints;
  }

  stopSyncSearch() {
    this.store.dispatch(resetSearch());
    this.store.dispatch(ServingActions.resetGlobalFilter());
  }

  syncAppSearch() {
    this.store.dispatch(initSearch({payload: 'Search for endpoints'}));
    this.sub.add(this.searchQuery$.pipe(skip(1)).subscribe(query => this.store.dispatch(ServingActions.globalFilterChanged(query))));
  }

  getNextEndpoints() {
    this.store.dispatch(ServingActions.getNextServingEndpoints());
  }


  endpointsSelectionChanged(endpoints: EndpointStats[]) {
    this.store.dispatch(ServingActions.setSelectedServingEndpoint({endpoint: endpoints[0]}));
  }

  sortedChanged({colId, isShift}: { isShift: boolean; colId: string }) {
    this.store.dispatch(ServingActions.loadingTableSortChanged({colId, isShift}));
  }

  filterChanged({col, value, andFilter}: { col: ISmCol; value: any; andFilter?: boolean }) {

    this.store.dispatch(ServingActions.loadingTableFiltersChanged({
      filters: [{
        col: col.id,
        value,
        filterMatchMode: col.filterMatchMode || andFilter ? 'AND' : undefined
      }],
    }));
  }

  refreshList(isAutorefresh: boolean) {
    this.store.dispatch(ServingActions.refreshLoadingEndpoints({hideLoader: isAutorefresh, autoRefresh: isAutorefresh}));
  }

  setAutoRefresh(autoRefresh: boolean) {
    this.store.dispatch(setAutoRefresh({autoRefresh}));
  }

  columnsReordered(cols: string[], updateUrl = true) {
    this.store.dispatch(ServingActions.setLoadingColsOrder({cols}));
    if (updateUrl) {
      this.store.dispatch(ServingActions.updateUrlParamsFromLoadingState());
    }
  }

  selectedTableColsChanged(col) {
    // this.store.dispatch(ServingActions.toggleColHidden({columnId: col.id}));
  }

  columnResized(event: { columnId: string; widthPx: number }) {
    this.store.dispatch(ServingActions.setLoadingColumnWidth({...event}));
  }

  refreshTagsList() {
    // this.store.dispatch(ServingActions.getTags());
  }

  protected getParamId(params) {
    return params?.endpointId;
  }

  clearTableFiltersHandler(tableFilters: Record<string, FilterMetadata>) {
    const filters = Object.keys(tableFilters).map(col => ({col, value: []}));
    this.store.dispatch(ServingActions.loadingTableFiltersChanged({filters}));
  }

  getCustomMetrics() {
  }

  removeColFromList(id: string) {

  }

  modeChanged(mode: 'table' | 'info') {
  }

  override closePanel(queryParams?: Params): Promise<boolean> {
    return null
  }

  selectedMetricToShow(event) {
  }

  downloadTableAsCSV() {
    this.table.table.downloadTableAsCSV(`ClearML All Endpoints`);
  }

  override onFooterHandler(): void {
    return;
  }
  override afterArchiveChanged() {
    return;
  }

  private setContextMenu() {
    this.route.url
      .pipe(
        takeUntilDestroyed(),
        filter(config => !!config),
        )    .subscribe((conf) => {
        const contextMenu = modelServingRoutes
          .map(route => {
            const baseLink = route.link.at(-1);
            return {
              ...route,
              isActive: baseLink === conf[0]?.path
            };
          });
        this.store.dispatch(headerActions.setTabs({contextMenu}));
      });
  }

  endpointSelectionChanged(event: { endpoint: EndpointStats; openInfo?: boolean }) {
    return event;
  }

}
