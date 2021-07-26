import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild,} from '@angular/core';
import {selectActiveParentsFilter, selectedExperimentsDisableAvailable, selectExperimentsHiddenTableCols, selectExperimentsList, selectExperimentsMetricsColsForProject, selectExperimentsParents, selectExperimentsTableCols, selectExperimentsTableColsOrder, selectExperimentsTags, selectExperimentsTypes, selectExperimentsUsers, selectHyperParamsOptions, selectHyperParamsVariants, selectIsExperimentInEditMode, selectNoMoreExperiments, selectSelectedExperiments, selectSelectedTableExperiment, selectShowAllSelectedIsActive, selectSplitSize, selectTableFilters, selectTableSortFields} from './reducers/index';
import {
  selectCompanyTags,
  selectIsArchivedMode,
  selectProjectSystemTags,
  selectProjectTags,
  selectSelectedProject,
  selectTagsFilterByProject
} from '../core/reducers/projects.reducer';
import {Store} from '@ngrx/store';
import {ColHeaderTypeEnum, ISmCol, TableSortOrderEnum} from '../shared/ui-components/data/table/table.consts';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {get, isEqual} from 'lodash/fp';
import {selectRouterParams} from '../core/reducers/router-reducer';
import {distinctUntilChanged, filter, map, skip, tap, withLatestFrom} from 'rxjs/operators';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {combineLatest, interval, Observable, Subscription} from 'rxjs';
import {ConfirmDialogComponent} from '../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {selectAppVisible, selectAutoRefresh, selectBackdropActive} from '../core/reducers/view-reducer';
import {InitSearch, ResetSearch} from '../common-search/common-search.actions';
import {ICommonSearchState, selectSearchQuery} from '../common-search/common-search.reducer';
import {ITableExperiment} from './shared/common-experiment-model.model';
import {IExperimentsViewState} from '../../features/experiments/reducers/experiments-view.reducer';
import {selectIsSharedAndNotOwner, selectMetricsLoading, selectMetricVariants, selectSelectedExperiment} from '../../features/experiments/reducers';
import {EXPERIMENTS_TABLE_COL_FIELDS} from '../../features/experiments/shared/experiments.const';
import * as experimentsActions from './actions/common-experiments-view.actions';
import {MetricVariantResult} from '../../business-logic/model/projects/metricVariantResult';
import {AUTO_REFRESH_INTERVAL} from '../../app.constants';
import {setAutoRefresh} from '../core/actions/layout.actions';
import {ResetProjectSelection, setDeep} from '../core/actions/projects.actions';
import {
  createMetricColumn,
  decodeColumns,
  decodeFilter,
  decodeOrder,
} from '../shared/utils/tableParamEncode';
import {BaseEntityPage} from '../shared/entity-page/base-entity-page';
import {User} from '../../business-logic/model/users/user';
import {groupHyperParams, isReadOnly} from '../shared/utils/shared-utils';
import {selectCurrentUser} from '../core/reducers/users-reducer';
import {GetCurrentUserResponseUserObject} from '../../business-logic/model/users/getCurrentUserResponseUserObject';
import {IExperimentInfo} from '../../features/experiments/shared/experiment-info.model';
import {SmSyncStateSelectorService} from '../core/services/sync-state-selector.service';
import {ProjectsGetTaskParentsResponseParents} from '../../business-logic/model/projects/projectsGetTaskParentsResponseParents';
import {SortMeta} from 'primeng/api';
import {EntityTypeEnum} from '../../shared/constants/non-common-consts';
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
import {
  CountAvailableAndIsDisableSelectedFiltered,
  MenuItems
} from '../shared/entity-page/items.utils';
import {ExperimentsTableComponent} from './dumb/experiments-table/experiments-table.component';
import {DequeueFooterItem} from '../shared/entity-page/footer-items/dequeue-footer-item';
import { HasReadOnlyFooterItem } from '../shared/entity-page/footer-items/has-read-only-footer-item';
import {MetricValueType} from '../experiments-compare/reducers/experiments-compare-charts.reducer';
import {GetAllProjectsPageProjects, ResetProjectsSearchQuery} from "../projects/common-projects.actions";

@Component({
  selector: 'sm-common-experiments',
  templateUrl: './experiments.component.html',
  styleUrls: ['./experiments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentsComponent extends BaseEntityPage implements OnInit, OnDestroy {

  public EntityTypeEnum = EntityTypeEnum;
  public experiments$: Observable<Array<ITableExperiment>>;
  public noMoreExperiments$: Observable<boolean>;
  public tableSortFields$: Observable<SortMeta[]>;
  public tableSortOrder$: Observable<TableSortOrderEnum>;
  public selectedExperiments$: Observable<Array<any>>;
  public isArchived$: Observable<boolean>;
  public tableFilters$: Observable<any>;
  private selectedProjectSubs: Subscription;
  public showAllSelectedIsActive$: Observable<boolean>;
  public columns$: Observable<any>;
  public filteredTableCols$: Observable<ISmCol[]>;
  public tableCols$: Observable<ISmCol[]>;
  public metricVariants$: Observable<any>;
  public hyperParams$: Observable<{ [section: string]: any[] }>;
  public hyperParamsOptions$: Observable<Record<ISmCol['id'], string[]>>;
  private hiddenTableCols$: Observable<any>;
  private metricTableCols$: Observable<any>;
  private searchSubs: Subscription;
  public selectedTableExperiment$: Observable<ITableExperiment>;
  public selectedExperimentsDisableAvailable$: Observable<Record<string, CountAvailableAndIsDisableSelectedFiltered>>;
  private ExperimentFromUrlSub: Subscription;
  private refreshing: boolean;
  public backdropActive$: Observable<any>;
  private searchQuery$: Observable<ICommonSearchState['searchQuery']>;
  public metricLoading$: Observable<boolean>;
  private autoRefreshSub: Subscription;
  public autoRefreshState$: Observable<boolean>;
  private isExperimentInEditMode$: Observable<boolean>;
  private sortFields: SortMeta[];
  public tableColsOrder$: Observable<string[]>;
  public users$: Observable<Array<User>>;
  public parent$: Observable<ProjectsGetTaskParentsResponseParents[]>;
  public activeParentsFilter$: Observable<ProjectsGetTaskParentsResponseParents[]>;
  public tags$: Observable<string[]>;
  public companyTags$: Observable<string[]>;
  public projectTags$: Observable<string[]>;
  public tagsFilterByProject$: Observable<boolean>;
  public systemTags$: Observable<string[]>;
  public types$: Observable<Array<any>>;
  protected setSplitSizeAction = experimentsActions.setSplitSize;
  public currentUser$: Observable<GetCurrentUserResponseUserObject>;
  public selectedExperiment$: Observable<IExperimentInfo>;
  public isSharedAndNotOwner$: Observable<boolean>;
  public readOnlySelection: boolean;
  private isAppVisible$: Observable<boolean>;
  protected addTag = addTag;
  @ViewChild('experimentsTable') private table: ExperimentsTableComponent;
  private selectedProjectSubscription: Subscription;

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

    this.tableSortFields$ = this.store.select(selectTableSortFields).pipe(tap(field => this.sortFields = field));
    this.backdropActive$ = this.store.select(selectBackdropActive);
    this.noMoreExperiments$ = this.store.select(selectNoMoreExperiments);
    this.tableFilters$ = this.store.select(selectTableFilters);
    this.isArchived$ = this.store.select(selectIsArchivedMode);
    this.showAllSelectedIsActive$ = this.store.select(selectShowAllSelectedIsActive);
    this.selectedTableExperiment$ = this.store.select(selectSelectedTableExperiment);
    this.selectedExperimentsDisableAvailable$ = this.store.select(selectedExperimentsDisableAvailable);
    this.selectedProject$ = this.store.select(selectSelectedProject);
    this.selectedExperiment$ = this.store.select(selectSelectedExperiment);
    this.selectedExperiments$ = this.store.select(selectSelectedExperiments)
      .pipe(tap(selectedExperiments => {
        this.selectedExperiments = selectedExperiments;
        this.readOnlySelection = this.selectedExperiments.some(exp => isReadOnly(exp));
      }));
    this.hiddenTableCols$ = this.store.select(selectExperimentsHiddenTableCols);
    this.searchQuery$ = this.store.select(selectSearchQuery);
    this.autoRefreshState$ = this.store.select(selectAutoRefresh);
    this.isAppVisible$ = this.store.select(selectAppVisible);
    this.isExperimentInEditMode$ = this.store.select(selectIsExperimentInEditMode);
    this.isSharedAndNotOwner$ = this.store.select(selectIsSharedAndNotOwner);
    this.users$ = this.store.select(selectExperimentsUsers);
    this.parent$ = this.store.select(selectExperimentsParents);
    this.activeParentsFilter$ = this.store.select(selectActiveParentsFilter);
    this.types$ = this.store.select(selectExperimentsTypes);
    this.tags$ = this.store.select(selectExperimentsTags);
    this.tagsFilterByProject$ = this.store.select(selectTagsFilterByProject);
    this.projectTags$ = this.store.select(selectProjectTags);
    this.companyTags$ = this.store.select(selectCompanyTags);
    this.systemTags$ = this.store.select(selectProjectSystemTags);
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.metricTableCols$ = this.store.select(selectExperimentsMetricsColsForProject);
    this.tableColsOrder$ = this.store.select(selectExperimentsTableColsOrder);
    this.columns$ = this.store.select(selectExperimentsTableCols);
    this.metricVariants$ = this.store.select(selectMetricVariants);
    this.metricLoading$ = this.store.select(selectMetricsLoading);
    this.hyperParamsOptions$ = this.store.select(selectHyperParamsOptions);
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
    this.createFooterItems({
      entitiesType: EntityTypeEnum.experiment,
      showAllSelectedIsActive$: this.showAllSelectedIsActive$,
      selected$: this.selectedExperiments$,
      data$: this.selectedExperimentsDisableAvailable$,
      tags$: this.tags$,
      companyTags$: this.companyTags$,
      projectTags$: this.projectTags$,
      tagsFilterByProject$: this.tagsFilterByProject$
    });
    this.autoRefreshSub = interval(AUTO_REFRESH_INTERVAL).pipe(
      withLatestFrom(this.autoRefreshState$, this.isExperimentInEditMode$, this.isAppVisible$),
      filter(([, autoRefreshState, isExperimentInEditMode, isAppVisible]) => autoRefreshState && !isExperimentInEditMode && isAppVisible)
    ).subscribe(() => {
      this.refreshList(true);
    });
    this.selectedProjectSubscription = this.selectedProject$.pipe(filter(project=> !!project)).subscribe((project) => {
      this.dispatchAndLock(experimentsActions.getExperiments());
    });

    this.filteredTableCols$ = combineLatest([this.columns$, this.metricTableCols$])
      .pipe(
        map(([tableCols, metricCols]) =>
          tableCols.concat(metricCols.map(col => ({...col, metric: true})))
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
      if (queryParams.columns) {
        const [cols, metrics, hyperParams, allIds] = decodeColumns(queryParams.columns);
        this.store.dispatch(experimentsActions.setHiddenColumns({visibleColumns: cols, projectId: this.projectId}));
        this.store.dispatch(experimentsActions.setExtraColumns({
          projectId: this.selectedProject,
          columns: metrics.map(metricCol => createMetricColumn(metricCol, projectId))
            .concat(hyperParams.map(param => this.createParamColumn(param)))
        }));
        this.columnsReordered(allIds, true);
      }
      if (queryParams.order) {
        const orders = decodeOrder(queryParams.order);
        this.store.dispatch(experimentsActions.setTableSort({orders, projectId}));
      }
      if (queryParams.filter) {
        const filters = decodeFilter(queryParams.filter);
        this.store.dispatch(experimentsActions.setTableFilters({filters, projectId}));
      } else {
        if (queryParams.order) {
          this.store.dispatch(experimentsActions.setTableFilters({filters: [], projectId}));
        }
      }
      if (queryParams.deep) {
        this.store.dispatch(setDeep({deep: true}));
      }

      if (queryParams.archive) {
        this.store.dispatch(experimentsActions.setArchive({archive: true}));
      }
      this.store.dispatch(experimentsActions.getUsers());
      this.store.dispatch(experimentsActions.getParents());
      this.store.dispatch(experimentsActions.getTags());
      this.store.dispatch(experimentsActions.getProjectTypes());
    });

    this.selectExperimentFromUrl();
  }

  createFooterItems(config: {
    entitiesType: EntityTypeEnum;
    selected$: Observable<Array<any>>;
    showAllSelectedIsActive$: Observable<boolean>;
    data$?: Observable<Record<string, CountAvailableAndIsDisableSelectedFiltered>>;
    tags$: Observable<string[]>;
    companyTags$:   Observable<string[]>;
    projectTags$: Observable<string[]>;
    tagsFilterByProject$: Observable<boolean>;
  }) {
    const state$ = this.createFooterState(config.selected$, config.data$);

    this.footerItems = [
      new ShowItemsFooterSelected(config.entitiesType, config.showAllSelectedIsActive$, config.selected$),
      new CompareFooterItem(),
      new DividerFooterItem(),

      new ArchiveFooterItem(config.entitiesType, state$),
      new DeleteFooterItem(state$),
      new DividerFooterItem(),

      new EnqueueFooterItem(state$),
      new DequeueFooterItem(state$),
      new ResetFooterItem(config.entitiesType, state$),
      new AbortFooterItem(state$),
      new PublishFooterItem(state$, EntityTypeEnum.model),
      new DividerFooterItem(),

      new SelectedTagsFooterItem(config.entitiesType, state$, config.companyTags$, config.projectTags$, config.tagsFilterByProject$),
      new DividerFooterItem(),

      new MoveToFooterItem(state$),
      new HasReadOnlyFooterItem(state$)
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
        this.table.contextMenu.restoreArchive();
        break;
      case MenuItems.reset:
        this.table.contextMenu.resetPopup();
        break;
      case MenuItems.publish:
        this.table.contextMenu.publishPopup();
        break;
      case MenuItems.enqueue:
        this.table.contextMenu.enqueuePopup();
        break;
      case MenuItems.dequeue:
        this.table.contextMenu.dequeuePopup();
        break;
      case MenuItems.delete:
        this.table.contextMenu.deleteExperimentPopup();
        break;
      case MenuItems.abort:
        this.table.contextMenu.stopPopup();
        break;
      case MenuItems.moveTo:
        this.table.contextMenu.moveToProjectPopup();
        break;
    }
  }
  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.selectedProjectSubs.unsubscribe();
    this.selectedProjectSubscription.unsubscribe();
    this.ExperimentFromUrlSub.unsubscribe();
    this.store.dispatch(experimentsActions.resetExperiments());
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
      this.dispatchAndLock(experimentsActions.globalFilterChanged(query));
    });
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
      this.store.dispatch(experimentsActions.setSelectedExperiment({experiment: selectedExperiment}));
    });
  }

  getNextExperiments() {
    this.dispatchAndLock(experimentsActions.getNextExperiments());
  }

  filterArchivedExperiments(experiments, showArchived) {
    if (showArchived) {
      return experiments.filter(ex => ex?.system_tags?.includes('archived'));
    } else {
      return experiments.filter(ex => !(ex?.system_tags?.includes('archived')));
    }
  }

  experimentsSelectionChanged(experiments: Array<ITableExperiment>) {
    this.store.dispatch(experimentsActions.setSelectedExperiments({experiments}));
  }

  experimentSelectionChanged(experiment: ITableExperiment) {
    this.store.dispatch(experimentsActions.experimentSelectionChanged({
      experiment,
      project: this.selectedProject
    }));
  }

  sortedChanged(event: { isShift: boolean; colId: ISmCol['id'] }) {
    this.dispatchAndLock(experimentsActions.tableSortChanged(event));
  }

  filterChanged({col, value, andFilter}: { col: ISmCol; value: any; andFilter?: boolean }) {
    this.dispatchAndLock(experimentsActions.tableFilterChanged({filter: {
      col: col.id,
      value,
      filterMatchMode: col.filterMatchMode || andFilter ? 'AND' : undefined
    }, projectId: this.projectId}));
  }

  compareExperiments() {
    // TODO: temporary until the compare component will be under experiment module...
    this.router.navigate(
      [
        `projects/${this.projectId}/compare-experiments/`,
        {ids: this.selectedExperiments.map(experiment => experiment.id).join(',')}
      ]);
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

  switchArchiveMode(isArchived) {
    this.store.dispatch(new ResetProjectSelection());
    this.store.dispatch(experimentsActions.showOnlySelected({active: false, projectId: this.projectId}));
    this.dispatchAndLock(experimentsActions.setArchive({archive: isArchived}));
    this.closeExperimentPanel();
  }


  showAllSelected(active: boolean) {
    this.dispatchAndLock(experimentsActions.showOnlySelected({active, projectId: this.projectId}));
  }

  selectedTableColsChanged(col: ISmCol) {
    this.dispatchAndLock(experimentsActions.toggleColHidden({columnId: col.id, projectId: this.projectId}));
  }

  getMetricsToDisplay() {
    this.store.dispatch(experimentsActions.getCustomMetrics());
    this.store.dispatch(experimentsActions.getCustomHyperParams());
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
      this.store.dispatch(experimentsActions.addColumn({col: variantCol}));
    } else {
      this.store.dispatch(experimentsActions.removeCol({id: variantCol.id, projectId: variantCol.projectId}));
    }
  }

  createParamColumn(param: string): ISmCol {
    return {
      id: param,
      getter: param + '.value',
      headerType: ColHeaderTypeEnum.sortFilter,
      sortable: true,
      filterable: true,
      header: param.replace('hyperparams.', ''),
      hidden: false,
      projectId: this.projectId,
      isParam: true,
      style: {width: '200px'},
    };
  }

  selectedHyperParamToShow(event: { param: string; addCol: boolean }) {
    const variantCol = this.createParamColumn(event.param);
    if (event.addCol) {
      this.store.dispatch(experimentsActions.addColumn({col: variantCol}));
    } else {
      this.store.dispatch(experimentsActions.removeCol({id: variantCol.id, projectId: variantCol.projectId}));
    }
  }

  removeColFromList(colId: string) {
    const sortIndex = this.sortFields.findIndex(field => field.field === colId);
    if (sortIndex > -1) {
      this.store.dispatch(experimentsActions.resetSortOrder({sortIndex, projectId: this.projectId}));
    }
    this.store.dispatch(experimentsActions.removeCol({id: colId, projectId: this.projectId}));
  }

  columnResized(event: { columnId: string; widthPx: number }) {
    this.store.dispatch(experimentsActions.setColumnWidth({
      ...event,
      projectId: this.projectId,
    }));
  }

  refreshList(isAutorefresh: boolean) {
    if (this.refreshing) {
      return;
    }
    if (!isAutorefresh) {
      this.refreshing = true;
    }

    this.dispatchAndLock(experimentsActions.refreshExperiments({
      hideLoader: isAutorefresh,
      autoRefresh: isAutorefresh
    }));
  }

  closeExperimentPanel() {
    this.router.navigate([`projects/${this.projectId}/experiments`], {queryParamsHandling: 'merge'});
    window.setTimeout(() => this.infoDisabled = false);
  }

  setAutoRefresh($event: boolean) {
    this.store.dispatch(setAutoRefresh({autoRefresh: $event}));
  }

  clearSelection() {
    this.store.dispatch(experimentsActions.clearHyperParamsCols({projectId: this.projectId}));
  }

  columnsReordered(cols: string[], fromUrl = false) {
    this.store.dispatch(experimentsActions.setColsOrderForProject({cols, project: this.projectId, fromUrl}));
  }

  refreshTagsList() {
    this.store.dispatch(experimentsActions.getTags());
  }

  refreshTypesList() {
    this.store.dispatch(experimentsActions.getProjectTypes());
  }

  protected getParamId(params) {
    return params?.experimentId;
  }
}

