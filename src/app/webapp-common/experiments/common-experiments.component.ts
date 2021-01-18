import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  selectExperimentsHiddenTableCols,
  selectExperimentsList,
  selectExperimentsMetricsCols,
  selectExperimentsTableCols,
  selectExperimentsTableColsOrder,
  selectGlobalFilter,
  selectHyperParamsVariants,
  selectIsExperimentInEditMode,
  selectNoMoreExperiments,
  selectSelectedExperiments,
  selectSelectedTableExperiment,
  selectShowAllSelectedIsActive,
  selectTableFilters,
  selectTableSortField,
  selectTableSortOrder,
  selectExperimentsUsers,
  selectExperimentsTypes,
  selectSplitSize,
  selectExperimentsParents, selectActiveParentsFilter
} from './reducers/index';
import {selectIsArchivedMode, selectProjectSystemTags, selectProjectTags} from '../core/reducers/projects.reducer';
import {select, Store} from '@ngrx/store';
import {ColHeaderTypeEnum, ISmCol, TableSortOrderEnum} from '../shared/ui-components/data/table/table.consts';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {get, isEqual} from 'lodash/fp';
import {selectRouterParams} from '../core/reducers/router-reducer';
import {filter, map, skip, tap, withLatestFrom, distinctUntilChanged} from 'rxjs/operators';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {combineLatest, Observable, Subscription, interval} from 'rxjs';
import {ConfirmDialogComponent} from '../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {selectAutoRefresh, selectBackdropActive, selectNeverShowPopups} from '../core/reducers/view-reducer';
import {InitSearch, ResetSearch} from '../common-search/common-search.actions';
import {selectSearchQuery} from '../common-search/common-search.reducer';
import {ITableExperiment} from './shared/common-experiment-model.model';
import {IExperimentsViewState} from '../../features/experiments/reducers/experiments-view.reducer';
import {
  selectIsSharedAndNotOwner,
  selectMetricsLoading,
  selectMetricVariants,
  selectSelectedExperiment
} from '../../features/experiments/reducers';
import {EXPERIMENTS_TABLE_COL_FIELDS} from '../../features/experiments/shared/experiments.const';
import * as experimentsActions from './actions/common-experiments-view.actions';
import {
  AddCol,
  ClearHyperParamsCols,
  GetCustomHyperParams,
  GetCustomMetrics,
  getProjectTypes,
  RemoveCol,
  ResetSortOrder,
  SetShowAllSelectedIsActive,
  setSplitSize
} from './actions/common-experiments-view.actions';
import {ExperimentsViewModesEnum} from './shared/common-experiments.const';
import {MetricVariantResult} from '../../business-logic/model/projects/metricVariantResult';
import {AUTO_REFRESH_INTERVAL} from '../../app.constants';
import {SetAutoRefresh} from '../core/actions/layout.actions';
import {getCompanyTags, getTags, ResetProjectSelection} from '../core/actions/projects.actions';
import {
  decodeColumns,
  decodeFilter,
  decodeOrder,
  getValueTypeName,
  MetricColumn
} from '../shared/utils/tableParamEncode';
import {BaseEntityPage} from '../shared/entity-page/base-entity-page';
import {User} from '../../business-logic/model/users/user';
import {groupHyperParams, isReadOnly} from '../shared/utils/shared-utils';
import {selectCurrentUser} from '../core/reducers/users-reducer';
import {GetCurrentUserResponseUserObject} from '../../business-logic/model/users/getCurrentUserResponseUserObject';
import {ISelectedExperiment} from '../../features/experiments/shared/experiment-info.model';
import {showConfirmArchiveExperiments} from './shared/common-experiments.utils';
import {SmSyncStateSelectorService} from '../core/services/sync-state-selector.service';
import {ProjectsGetTaskParentsResponseParents} from '../../business-logic/model/projects/projectsGetTaskParentsResponseParents';

@Component({
  selector: 'sm-common-experiments',
  templateUrl: './common-experiments.component.html',
  styleUrls: ['./common-experiments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommonExperimentsComponent extends BaseEntityPage implements OnInit, OnDestroy {

  public experiments$: Observable<Array<ITableExperiment>>;
  public noMoreExperiments$: Observable<boolean>;
  public tableSortField$: Observable<string>;
  public tableSortOrder$: Observable<TableSortOrderEnum>;
  public selectedExperiments$: Observable<Array<any>>;
  public searchValue$: Observable<string>;
  public isArchived$: Observable<boolean>;
  public tableFilters$: Observable<any>;
  private selectedExperiments: Array<any>;
  private selectedProjectSubs: Subscription;
  public showAllSelectedIsActive$: Observable<boolean>;
  public columns$: Observable<any>;
  public filteredTableCols$: Observable<ISmCol[]>;
  public tableCols$: Observable<ISmCol[]>;
  public metricVariants$: Observable<any>;
  public hyperParams$: Observable<{ [section: string]: any[] }>;
  private hiddenTableCols$: Observable<any>;
  private metricTableCols$: Observable<any>;
  private searchSubs: Subscription;
  public selectedTableExperiment$: Observable<ITableExperiment>;
  private ExperimentFromUrlSub: Subscription;
  private refreshing: boolean;
  public backdropActive$: Observable<any>;
  private searchQuery$: Observable<string>;
  public metricLoading$: Observable<boolean>;
  private autoRefreshSub: Subscription;
  public autoRefreshState$: Observable<boolean>;
  private isExperimentInEditMode$: Observable<boolean>;
  private sortField: string;
  public tableColsOrder$: Observable<string[]>;
  public users$: Observable<Array<User>>;
  public parent$: Observable<ProjectsGetTaskParentsResponseParents[]>;
  public activeParentsFilter$: Observable<ProjectsGetTaskParentsResponseParents[]>;
  public tags$: Observable<string[]>;
  public systemTags$: Observable<string[]>;
  public types$: Observable<Array<any>>;
  protected setSplitSizeAction = setSplitSize;
  public currentUser$: Observable<GetCurrentUserResponseUserObject>;
  public selectedExperiment$: Observable<ISelectedExperiment>;
  public isSharedAndNotOwner$: Observable<boolean>;
  public readOnlySelection: boolean;

  get selectedProject() {
    return this.route.parent.snapshot.params.projectId;
  }

  constructor(
    protected store: Store<IExperimentsViewState>,
    protected syncSelector: SmSyncStateSelectorService,
    private route: ActivatedRoute,
    private router: Router, private dialog: MatDialog
  ) {
    super(store);
    this.selectSplitSize$ = this.store.select(selectSplitSize);
    this.tableSortField$ = this.store.select(selectTableSortField).pipe(tap(field => this.sortField = field));
    this.backdropActive$ = this.store.select(selectBackdropActive);
    this.noMoreExperiments$ = this.store.select(selectNoMoreExperiments);
    this.tableSortOrder$ = this.store.select(selectTableSortOrder);
    this.tableFilters$ = this.store.select(selectTableFilters);
    this.searchValue$ = this.store.select(selectGlobalFilter);
    this.isArchived$ = this.store.select(selectIsArchivedMode);
    this.showAllSelectedIsActive$ = this.store.select(selectShowAllSelectedIsActive);
    this.selectedTableExperiment$ = this.store.select(selectSelectedTableExperiment);
    this.selectedExperiment$ = this.store.select(selectSelectedExperiment);
    this.selectedExperiments$ = this.store.select(selectSelectedExperiments)
      .pipe(tap(selectedExperiments => {
        this.selectedExperiments = selectedExperiments;
        this.readOnlySelection = this.selectedExperiments.some(exp => isReadOnly(exp));
      }));
    this.hiddenTableCols$ = this.store.select(selectExperimentsHiddenTableCols);
    this.searchQuery$ = this.store.select(selectSearchQuery);
    this.autoRefreshState$ = this.store.select(selectAutoRefresh);
    this.isExperimentInEditMode$ = this.store.select(selectIsExperimentInEditMode);
    this.isSharedAndNotOwner$ = this.store.select(selectIsSharedAndNotOwner);
    this.users$ = this.store.select(selectExperimentsUsers);
    this.parent$ = this.store.select(selectExperimentsParents);
    this.activeParentsFilter$ = this.store.select(selectActiveParentsFilter);
    this.types$ = this.store.select(selectExperimentsTypes);
    this.tags$ = this.store.select(selectProjectTags);
    this.systemTags$ = this.store.select(selectProjectSystemTags);
    this.currentUser$ = this.store.select(selectCurrentUser);


    this.metricTableCols$ = this.store.pipe(
      select(selectExperimentsMetricsCols),
      map(cols => cols.filter(col => !col.projectId || col.projectId === this.selectedProject))
    );
    this.tableColsOrder$ = this.store.select(selectExperimentsTableColsOrder);
    this.columns$ = this.store.select(selectExperimentsTableCols);
    this.metricVariants$ = this.store.select(selectMetricVariants);
    this.metricLoading$ = this.store.select(selectMetricsLoading);
    this.hyperParams$ = this.store.select(selectHyperParamsVariants).pipe(
      map(hyperParams => groupHyperParams(hyperParams))
    );
    this.experiments$ = this.store.select(selectExperimentsList).pipe(
      withLatestFrom(this.isArchived$),
      // lil hack for hiding archived task after they been archived from task info or footer...
      map(([experiments, showArchived]) => this.filterArchivedExperiments(experiments, showArchived)),
      tap(() => this.refreshing = false)
    );
    this.syncAppSearch();
  }

  ngOnInit() {
    super.ngOnInit();
    this.autoRefreshSub = interval(AUTO_REFRESH_INTERVAL).pipe(
      withLatestFrom(this.autoRefreshState$, this.isExperimentInEditMode$),
      filter(([iteration, autoRefreshState, isExperimentInEditMode]) => autoRefreshState && !isExperimentInEditMode)
    ).subscribe(() => {
      this.refreshList(true);
    });

    this.filteredTableCols$ = combineLatest([this.columns$, this.hiddenTableCols$, this.metricTableCols$])
      .pipe(
        map(([tableCols, hiddenCols, metricCols]) =>
          tableCols.concat(metricCols.map(col => ({...col, metric: true})))
            .map(col => ({...col, hidden: hiddenCols[col.id] || null}))
            .filter(col => col.id !== EXPERIMENTS_TABLE_COL_FIELDS.PROJECT || this.selectedProject == '*'))
      ); // Only show project col on "all projects"

    this.tableCols$ = this.filteredTableCols$.pipe(map(cols => cols.filter(col => !col.hidden)));
    let prevQueryParams: Params;

    this.selectedProjectSubs = combineLatest([
      this.store.select(selectRouterParams),
      this.route.queryParams
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
    ).subscribe(([projectId, queryParams]) => {
      if (queryParams.order) {
        const [col, direction] = decodeOrder(queryParams.order);
        this.store.dispatch(new experimentsActions.TableSortChanged(col, direction));
      }
      if (queryParams.filter) {
        const filters = decodeFilter(queryParams.filter);
        this.store.dispatch(experimentsActions.setTableFilters({filters}));
      } else {
        if (queryParams.order) {
          this.store.dispatch(experimentsActions.setTableFilters({filters: []}));
        }
      }

      if (queryParams.archive) {
        this.store.dispatch(experimentsActions.setArchive({archive: true}));
      }
      if (queryParams.columns) {
        const [cols, metrics, hyperParams, allIds] = decodeColumns(queryParams.columns);
        this.store.dispatch(experimentsActions.setHiddenColumns({visibleColumns: cols}));
        this.store.dispatch(experimentsActions.setExtraColumns({
          columns: metrics.map(metricCol => this.createMetricColumn(metricCol))
            .concat(hyperParams.map(param => this.createParamColumn(param)) as any[])
        }));
        this.columnsReordered(allIds);
      }
      this.dispatchAndLock(new experimentsActions.GetExperiments());
      this.store.dispatch(experimentsActions.getUsers());
      this.store.dispatch(experimentsActions.getParents());
      this.store.dispatch(getTags());
      // this.store.dispatch(getCompanyTags());
      this.store.dispatch(getProjectTypes());
    });

    this.selectExperimentFromUrl();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.selectedProjectSubs.unsubscribe();
    this.ExperimentFromUrlSub.unsubscribe();
    this.store.dispatch(new experimentsActions.ResetExperiments());
    this.stopSyncSearch();
    this.autoRefreshSub.unsubscribe();
  }

  stopSyncSearch() {
    this.searchSubs.unsubscribe();
    this.store.dispatch(new ResetSearch());
    this.store.dispatch(experimentsActions.resetGlobalFilter());
  }

  syncAppSearch() {
    this.store.dispatch(new InitSearch('Search for experiments'));

    this.searchSubs = this.searchQuery$.pipe(skip(1)).subscribe(query => {
      this.onSearchValueChanged(query);
    });
    // this.searchQuerySubs = this.searchValue$.subscribe(query => this.header.searchQuery = query);
  }

  selectExperimentFromUrl() {
    this.ExperimentFromUrlSub = combineLatest([
      this.store.select(selectRouterParams)
        .pipe(map(params => get('experimentId', params))),
      this.experiments$
    ]).pipe(
      map(([experimentId, experiments]) => experiments.find(experiment => experiment.id === experimentId)),
      distinctUntilChanged()
    ).subscribe((selectedExperiment) => {
      this.store.dispatch(new experimentsActions.SetSelectedExperiment(selectedExperiment));
    });
  }

  getNextExperiments() {
    this.dispatchAndLock(new experimentsActions.GetNextExperiments());
  }

  filterArchivedExperiments(experiments, showArchived) {
    if (showArchived) {
      return experiments.filter(ex => ex?.system_tags?.includes('archived'));
    } else {
      return experiments.filter(ex => !(ex?.system_tags?.includes('archived')));
    }
  }

  experimentsSelectionChanged(experiments: Array<ITableExperiment>) {
    this.store.dispatch(new experimentsActions.SetSelectedExperiments(experiments));
  }

  experimentSelectionChanged(experiment: ITableExperiment) {
    this.store.dispatch(new experimentsActions.ExperimentSelectionChanged({
      experiment: experiment,
      project: this.selectedProject
    }));
  }

  sortedChanged(sort: { sortOrder: TableSortOrderEnum; colId: ISmCol['id'] }) {
    this.dispatchAndLock(new experimentsActions.TableSortChanged(sort.colId, sort.sortOrder));
  }

  filterChanged({col, value}: { col: ISmCol; value: any }) {
    this.dispatchAndLock(new experimentsActions.TableFilterChanged({
      col: col.id,
      value: value,
      filterMatchMode: col.filterMatchMode
    }));
  }

  compareExperiments() {
    // TODO: temporary until the compare component will be under experiment module...
    this.router.navigate(
      [
        `projects/${this.projectId}/compare-experiments/`,
        {ids: this.selectedExperiments.map(experiment => experiment.id).join(',')}
      ]);
  }

  archiveExperiments() {
    const showShareWarningDialog = this.selectedExperiments?.find(item => item?.system_tags.includes('shared')) &&
      !this.syncSelector.selectSync(selectNeverShowPopups)?.includes('archive-shared-task');
    if (showShareWarningDialog) {
      showConfirmArchiveExperiments(this.store, this.dialog);
    } else {
      this.store.dispatch(new experimentsActions.ArchiveSelectedExperiments({}));
    }
  }

  restoreExperiments() {
    this.store.dispatch(new experimentsActions.RestoreSelectedExperiments({}));
  }

  onSearchValueChanged(value: string) {
    this.dispatchAndLock(new experimentsActions.GlobalFilterChanged(value));
  }

  onIsArchivedChanged(isArchived: boolean) {
    if (this.selectedExperiments.length > 0) {
      const archiveDialog: MatDialogRef<any> = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Are you sure?',
          body: 'Navigating between "Live" and "Archive" will deselect your selected experiments.',
          yes: 'Proceed',
          no: 'Back',
          iconClass: ''
        }
      });

      archiveDialog.afterClosed().subscribe((confirmed) => {
        if (confirmed) {
          this.switchArchiveMode(isArchived);
        }
      });
    } else {
      this.switchArchiveMode(isArchived);
    }
  }

  onViewModeChanged(viewMode: ExperimentsViewModesEnum) {
    this.store.dispatch(new experimentsActions.SetViewMode(viewMode));
  }

  switchArchiveMode(isArchived) {
    this.store.dispatch(new ResetProjectSelection());
    this.store.dispatch(new SetShowAllSelectedIsActive(false));
    this.dispatchAndLock(experimentsActions.setArchive({archive: isArchived}));
  }


  showAllSelected(active: boolean) {
    this.store.dispatch(new experimentsActions.ShowAllSelected(active));
  }

  selectedTableColsChanged(col) {
    this.dispatchAndLock(new experimentsActions.ToggleColHidden(col.itemValue));
  }

  getMetricsToDisplay() {
    this.store.dispatch(new GetCustomMetrics());
    this.store.dispatch(new GetCustomHyperParams());
  }

  createMetricColumn(column: MetricColumn): ISmCol {
    return {
      id: `last_metrics.${column.metricHash}.${column.variantHash}.${column.valueType}`,
      headerType: ColHeaderTypeEnum.sort,
      sortable: true,
      filterable: false,
      header: `${column.metric} > ${column.variant} ${getValueTypeName(column.valueType)}`,
      hidden: false,
      metric_hash: column.metricHash,
      variant_hash: column.variantHash,
      valueType: column.valueType,
      projectId: this.projectId,
      style: {width: '115px'},
    };
  }

  selectedMetricToShow(event: {
    variant: MetricVariantResult;
    addCol: boolean;
    valueType: string;
  }) {
    const variantCol = this.createMetricColumn({
      metricHash: event.variant.metric_hash,
      variantHash: event.variant.variant_hash,
      valueType: event.valueType,
      metric: event.variant.metric,
      variant: event.variant.variant
    });
    if (event.addCol) {
      this.store.dispatch(new AddCol(variantCol));
    } else {
      this.store.dispatch(new RemoveCol(variantCol as any));
    }
  }

  createParamColumn(param: string) {
    return {
      id: `hyperparams.${param}`,
      headerType: ColHeaderTypeEnum.sort,
      sortable: true,
      filterable: false,
      header: param,
      hidden: false,
      projectId: this.projectId,
      isParam: true,
      style: {width: '115px'},
    };
  }

  selectedHyperParamToShow(event: {
    param: any;
    addCol: boolean;
  }) {
    const variantCol = this.createParamColumn(event.param);
    if (event.addCol) {
      this.store.dispatch(new AddCol(variantCol));
    } else {
      this.store.dispatch(new RemoveCol(variantCol));
    }
  }

  removeColFromList(colId: string) {
    if (this.sortField === colId) {
      this.store.dispatch(new ResetSortOrder());
    }
    this.store.dispatch(new RemoveCol({id: colId, projectId: this.projectId}));
  }

  refreshList(isAutorefresh: boolean) {
    if (this.refreshing) {
      return;
    }
    if (!isAutorefresh) {
      this.refreshing = true;
    }

    this.dispatchAndLock(new experimentsActions.RefreshExperiments({
      hideLoader: isAutorefresh,
      autoRefresh: isAutorefresh
    }));
  }

  closeExperimentPanel() {
    this.router.navigate([`projects/${this.projectId}/experiments`], {queryParamsHandling: 'merge'});
    window.setTimeout(() => this.infoDisabled = false);
  }

  setAutoRefresh($event: boolean) {
    this.store.dispatch(new SetAutoRefresh($event));
  }

  clearSelection() {
    this.store.dispatch(new ClearHyperParamsCols(this.projectId));
  }

  columnsReordered(cols: string[]) {
    this.store.dispatch(experimentsActions.changeColsOrder({cols: cols}));
  }

  refreshTagsList() {
    this.store.dispatch(getTags());
  }

  refreshTypesList() {
    this.store.dispatch(getProjectTypes());
  }

  protected getParamId(params) {
    return params?.experimentId;
  }
}
