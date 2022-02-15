import {ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {
  compareAddDialogTableSortChanged,
  compareAddTableClearAllFilters,
  compareAddTableFilterChanged,
  compareAddTableFilterInit,
  getSelectedExperimentsForCompareAddDialog,
  resetSelectCompareHeader,
  setShowSearchExperimentsForCompare
} from '../../actions/compare-header.actions';
import {
  selectCompareAddTableSortFields,
  selectExperimentsForCompareSearchTerm,
  selectSelectedExperimentsForCompareAdd
} from '../../reducers';
import {BehaviorSubject, combineLatest, Observable, Subscription} from 'rxjs';
import {Task} from '../../../../business-logic/model/tasks/task';
import {Params} from '@angular/router';
import {selectRouterParams} from '../../../core/reducers/router-reducer';
import {distinctUntilChanged, distinctUntilKeyChanged, filter, map} from 'rxjs/operators';
import {compareLimitations} from '../../../shared/entity-page/footer-items/compare-footer-item';
import {MatDialogRef} from '@angular/material/dialog';
import {ITableExperiment} from '../../../experiments/shared/common-experiment-model.model';
import {
  selectActiveParentsFilter,
  selectExperimentsList,
  selectExperimentsMetricsColsForProject,
  selectExperimentsParents,
  selectExperimentsTableCols,
  selectExperimentsTableColsOrder,
  selectExperimentsTags,
  selectExperimentsTypes,
  selectExperimentsUsers,
  selectHyperParamsOptions,
  selectNoMoreExperiments,
  selectTableFilters
} from '../../../experiments/reducers';
import {get, isEqual, unionBy} from 'lodash/fp';
import {ColHeaderTypeEnum, ISmCol, TableSortOrderEnum} from '../../../shared/ui-components/data/table/table.consts';
import {filterArchivedExperiments} from '../../../experiments/shared/common-experiments.utils';
import {InitSearch} from '../../../common-search/common-search.actions';
import * as experimentsActions from '../../../experiments/actions/common-experiments-view.actions';
import {resetExperiments, resetGlobalFilter} from '../../../experiments/actions/common-experiments-view.actions';
import {User} from '../../../../business-logic/model/users/user';
import {selectProjectSystemTags, selectRootProjects} from '../../../core/reducers/projects.reducer';
import {SortMeta} from 'primeng/api';
import {Project} from '../../../../business-logic/model/projects/project';
import {addMessage} from '../../../core/actions/layout.actions';
import {MESSAGES_SEVERITY} from '../../../../app.constants';
import {ProjectsGetTaskParentsResponseParents} from '../../../../business-logic/model/projects/projectsGetTaskParentsResponseParents';

export const allowAddExperiment$ = (selectRouterParams$: Observable<Params>) => selectRouterParams$.pipe(
  distinctUntilKeyChanged('ids'),
  map(res => res.ids),
  distinctUntilChanged(),
  map(res => res.split(',').length < compareLimitations)
);


@Component({
  selector: 'sm-select-experiments-for-compare',
  templateUrl: './select-experiments-for-compare.component.html',
  styleUrls: ['./select-experiments-for-compare.component.scss']
})
export class SelectExperimentsForCompareComponent implements OnInit, OnDestroy {
  public experimentsResults$: Observable<Task[]>;
  public selectedExperimentsIds: string[] = [];
  private paramsSubscription: Subscription;
  public searchTerm$: Observable<string>;
  @ViewChild('searchExperiments', {static: true}) searchExperiments;
  public allowAddExperiment$: Observable<boolean>;
  public tableColsOrder$: Observable<string[]>;
  public tableSortOrder$: Observable<TableSortOrderEnum>;
  private columns$: Observable<ISmCol[] | undefined>;
  private metricTableCols$: Observable<ISmCol[]>;
  public tableCols$: Observable<any>;
  public experiments$: Observable<any>;
  private projectId: string;
  public users$: Observable<User[]>;
  public tableFilters$: Observable<{ [p: string]: { value: any; matchMode: string } }>;
  public tags$: Observable<string[]>;
  public systemTags$: Observable<string[]>;
  public types$: Observable<string[]>;
  public noMoreExperiments$: Observable<boolean>;
  public hyperParamsOptions$: Observable<Record<string, string[]>>;
  public activeParentsFilter$: Observable<ProjectsGetTaskParentsResponseParents[]>;
  public parent$: Observable<ProjectsGetTaskParentsResponseParents[]>;
  public tableSortFields$: Observable<SortMeta[]>;
  public projects$: Observable<Project[]>;
  private originalSelectedExperiments: string[];
  selectedExperiment: any;
  public reachedCompareLimit: boolean;
  private _resizedCols = {} as { [colId: string]: string };
  private resizedCols$ = new BehaviorSubject<{[colId: string]: string }>(this._resizedCols);

  constructor(
    private store: Store<any>,
    private eRef: ElementRef,
    private changedDetectRef: ChangeDetectorRef,
    public dialogRef: MatDialogRef<SelectExperimentsForCompareComponent>
  ) {
    this.resizedCols$.next(this._resizedCols);
    this.experimentsResults$ = this.store.pipe(select(selectSelectedExperimentsForCompareAdd));
    this.experiments$ = combineLatest([this.store.select(selectExperimentsList), this.store.select(selectSelectedExperimentsForCompareAdd)]).pipe(
      map(([experiments, selectedExperiments]) => unionBy('id', selectedExperiments, experiments)),
      map((experiments) => filterArchivedExperiments(experiments, false))
    );
    this.searchTerm$ = this.store.pipe(select(selectExperimentsForCompareSearchTerm));
    this.tableColsOrder$ = this.store.select(selectExperimentsTableColsOrder);
    this.columns$ = this.store.select(selectExperimentsTableCols);
    this.metricTableCols$ = this.store.select(selectExperimentsMetricsColsForProject);
    this.users$ = this.store.select(selectExperimentsUsers);
    this.tableFilters$ = this.store.select(selectTableFilters);
    this.parent$ = this.store.select(selectExperimentsParents);
    this.projects$ = this.store.select(selectRootProjects);

    this.tags$ = this.store.select(selectExperimentsTags);
    this.types$ = this.store.select(selectExperimentsTypes);
    this.systemTags$ = this.store.select(selectProjectSystemTags);
    this.noMoreExperiments$ = this.store.select(selectNoMoreExperiments);
    this.tableSortFields$ = this.store.select(selectCompareAddTableSortFields);
    this.hyperParamsOptions$ = this.store.select(selectHyperParamsOptions);
    this.activeParentsFilter$ = this.store.select(selectActiveParentsFilter);
    this.tableCols$ = combineLatest([this.columns$, this.metricTableCols$, this.resizedCols$])
      .pipe(
        filter(([tableCols,,]) => !!tableCols),
        map(([tableCols, metricCols, resizedCols]) =>
          tableCols
            .concat(metricCols.map(col => ({...col, metric: true})))
            .map(col => ({
              ...col,
              style: {...col.style, width: resizedCols[col.id] || col.style?.width}
            }))
        ),
        distinctUntilChanged((a, b) => isEqual(a, b)),
        map(cols => cols.filter(col => (!col.hidden || col.id === 'project.name')).map(col => ({
            ...col,
            hidden: false,
            headerType: col.headerType === ColHeaderTypeEnum.checkBox ? ColHeaderTypeEnum.title : col.headerType,
            ...(col.id === 'project.name' && {
              getter: 'project',
              filterable: true,
              searchableFilter: true,
              sortable: false,
              headerType: ColHeaderTypeEnum.sortFilter,
            }),
          })
        )));
  }

  public searchTermChanged(term: string) {

    this.store.dispatch(experimentsActions.globalFilterChanged({query: term}));
  }

  public closeSearch() {
    this.store.dispatch(setShowSearchExperimentsForCompare({payload: false}));
  }

  public syncSelectedExperiments() {
    if (this.selectedExperimentsIds) {
      this.store.dispatch(getSelectedExperimentsForCompareAddDialog({tasksIds: this.selectedExperimentsIds}));
    }
  }

  syncAppSearch() {
    this.store.dispatch(new InitSearch('Search for experiments'));
    this.store.dispatch(experimentsActions.getExperiments());
  }

  refreshTagsList() {
    this.store.dispatch(experimentsActions.getTags());
  }

  refreshTypesList() {
    this.store.dispatch(experimentsActions.getProjectTypes());
  }


  ngOnInit() {
    this.paramsSubscription = this.store.pipe(
      select(selectRouterParams),
      map(params => [params && params['ids'], get('projectId', params)]),
      filter(([experimentIds,]) => !!experimentIds)
    ).subscribe(([experimentIds, projectId]) => {
      if (this.selectedExperimentsIds.length === 0) {
        this.selectedExperimentsIds = experimentIds.split(',');
        this.originalSelectedExperiments = this.selectedExperimentsIds;
      }
      if (!this.projectId && projectId !== '*') {
        this.store.dispatch(compareAddTableFilterInit({projectId}));
      }
      this.projectId = projectId;
      this.changedDetectRef.detectChanges();
    });
    this.allowAddExperiment$ = allowAddExperiment$(this.store.select(selectRouterParams));
    this.store.dispatch(experimentsActions.getUsers());
    this.store.dispatch(experimentsActions.getTags());
    this.store.dispatch(experimentsActions.getProjectTypes());
    this.store.dispatch(experimentsActions.getParents());
    this.store.dispatch(getSelectedExperimentsForCompareAddDialog(null));
    this.syncAppSearch();
  }

  ngOnDestroy(): void {
    this.paramsSubscription.unsubscribe();
    this.store.dispatch(setShowSearchExperimentsForCompare({payload: false}));
    this.store.dispatch(resetExperiments());
    this.store.dispatch(resetGlobalFilter());
    this.store.dispatch(resetSelectCompareHeader());

  }


  experimentsSelectionChanged(experiments: Array<ITableExperiment>) {
    this.reachedCompareLimit = experiments.length === compareLimitations;
    if (experiments.length === 0) {
      this.store.dispatch(addMessage(MESSAGES_SEVERITY.WARN, 'Compare module should include at least one experiment'));
      return;
    }
    if (experiments.length <= compareLimitations) {
      this.selectedExperimentsIds = experiments.map(ex => ex.id);
    } else {
      this.store.dispatch(addMessage(MESSAGES_SEVERITY.WARN, compareLimitations + ' or fewer experiments can be compared'));
    }
  }

  getNextExperiments() {
    this.syncSelectedExperiments();
    this.store.dispatch(experimentsActions.getNextExperiments());
  }

  sortedChanged(event: { isShift: boolean; colId: ISmCol['id'] }) {
    this.syncSelectedExperiments();
    this.store.dispatch(compareAddDialogTableSortChanged(event));
  }

  filterChanged({col, value, andFilter}: { col: ISmCol; value: any; andFilter?: boolean }) {
    this.syncSelectedExperiments();
    this.store.dispatch(compareAddTableFilterChanged({
      filter: {
        col: col.id,
        value,
        filterMatchMode: col.filterMatchMode || andFilter ? 'AND' : undefined
      }, projectId: this.projectId
    }));
  }

  clearTableFilters() {
    this.store.dispatch(compareAddTableClearAllFilters({projectId: this.projectId}));
  }

  applyChanges() {
    this.closeDialog(this.selectedExperimentsIds);
  }

  closeDialog(experimentIds?: string[]) {
    this.dialogRef.close(experimentIds);
  }

  resizeCol({columnId, widthPx}: {columnId: string; widthPx: number}) {
    this._resizedCols[columnId] = `${widthPx}px`;
    this.resizedCols$.next(this._resizedCols);
  }
}
