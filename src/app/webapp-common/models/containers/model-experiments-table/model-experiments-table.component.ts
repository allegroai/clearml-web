import {Component, EventEmitter, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {selectRouterParams} from '@common/core/reducers/router-reducer';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import {
  selectExperimentsList,
  selectExperimentsTableCols,
  selectGlobalFilter,
  selectNoMoreExperiments,
  selectTableFilters
} from '@common/experiments/reducers';
import {uniq} from 'lodash-es';
import {ColHeaderTypeEnum, ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import * as experimentsActions from '../../../experiments/actions/common-experiments-view.actions';
import {resetExperiments, resetGlobalFilter} from '@common/experiments/actions/common-experiments-view.actions';
import {selectProjectSystemTags} from '@common/core/reducers/projects.reducer';
import {SortMeta} from 'primeng/api';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {ExperimentsTableComponent} from '@common/experiments/dumb/experiments-table/experiments-table.component';
import {
  modelExperimentsTableFilterChanged,
  modelsExperimentsTableClearAllFilters
} from '@common/models/actions/models-info.actions';
import {EXPERIMENTS_TABLE_COL_FIELDS} from '~/features/experiments/shared/experiments.const';
import {MatInput} from '@angular/material/input';

export const INITIAL_MODEL_EXPERIMENTS_TABLE_COLS: ISmCol[] = [
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.NAME,
    headerType: ColHeaderTypeEnum.title,
    sortable: false,
    header: 'NAME',
    style: {width: '400px'},
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.TAGS,
    headerType: ColHeaderTypeEnum.sortFilter,
    filterable: true,
    searchableFilter: true,
    sortable: false,
    header: 'TAGS',
    style: {width: '300px'},
    excludeFilter: true,
    andFilter: true,
    columnExplain: 'Click to include tag. Click again to exclude.',
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.STATUS,
    headerType: ColHeaderTypeEnum.sortFilter,
    filterable: true,
    header: 'STATUS',
    style: {width: '115px'},
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.ID,
    headerType: ColHeaderTypeEnum.title,
    header: 'ID',
    style: {width: '100px'},
  }
];

@Component({
  selector: 'sm-model-experiments-table',
  templateUrl: './model-experiments-table.component.html',
  styleUrls: ['./model-experiments-table.component.scss']
})
export class ModelExperimentsTableComponent implements OnInit, OnDestroy {
  public tableCols = INITIAL_MODEL_EXPERIMENTS_TABLE_COLS;
  public entityTypes = EntityTypeEnum;
  private paramsSubscription: Subscription;
  private columns$: Observable<ISmCol[] | undefined>;
  public experiments$: Observable<any>;
  public tableFilters$: Observable<{ [columnId: string]: FilterMetadata }>;
  public tags$: Observable<string[]>;
  public systemTags$: Observable<string[]>;
  public noMoreExperiments$: Observable<boolean>;
  public tableSortFields$: Observable<SortMeta[]>;
  selectedExperiment: any;
  private _resizedCols = {} as { [colId: string]: string };
  private resizedCols$ = new BehaviorSubject<{ [colId: string]: string }>(this._resizedCols);
  @ViewChild('searchExperiments', {static: true}) searchExperiments: MatInput;
  @ViewChild(ExperimentsTableComponent) table: ExperimentsTableComponent;
  private modelId: string;
  public tags: string[];
  private initTags: boolean;
  public searchTerm$: Observable<{ query: string; regExp?: boolean; original?: string }>;

  constructor(
    private store: Store<any>,
  ) {
    this.resizedCols$.next(this._resizedCols);
    this.experiments$ = this.store.select(selectExperimentsList);
    this.searchTerm$ = this.store.pipe(select(selectGlobalFilter));
    this.columns$ = this.store.select(selectExperimentsTableCols);

    this.tableFilters$ = this.store.select(selectTableFilters)
      .pipe(map(filtersObj => Object.fromEntries(Object.entries(filtersObj).filter(([key]) => key !== 'models.input.model'))));
    this.systemTags$ = this.store.select(selectProjectSystemTags);
    this.noMoreExperiments$ = this.store.select(selectNoMoreExperiments);
  }

  public searchTermChanged(term: string) {
    this.store.dispatch(experimentsActions.globalFilterChanged({query: term}));
  }

  ngOnInit() {
    window.setTimeout(() => this.table.table.rowRightClick = new EventEmitter());
    this.paramsSubscription = this.store.select(selectRouterParams)
      .pipe(
        debounceTime(150),
        map(params => params?.modelId),
        filter(modelId => !!modelId),
        distinctUntilChanged()
      )
      .subscribe(modelId => {
        this.modelId = modelId;
        this.initTags = true;
        this.store.dispatch(modelsExperimentsTableClearAllFilters());
        this.searchTermChanged('');
        this.filterChanged({col: {id: 'models.input.model'}, value: modelId, andFilter: false});
      });
    this.experiments$.pipe(filter(() => this.initTags)).subscribe(experiments => {
      this.tags = uniq(experiments.map(exp => exp.tags).flat());
      this.initTags = false;
    });
  }

  ngOnDestroy(): void {
    this.paramsSubscription.unsubscribe();
    this.store.dispatch(resetExperiments());
    this.store.dispatch(resetGlobalFilter());
  }


  experimentsSelectionChanged(tasks) {
    const projectId = tasks?.[0]?.project?.id ? tasks?.[0]?.project?.id : '*';
    window.open('projects/' + projectId + '/experiments/' + tasks?.[0]?.id);
  }

  getNextExperiments() {
    this.store.dispatch(experimentsActions.getNextExperiments());
  }

  filterChanged({col, value, andFilter}: { col: ISmCol; value: any; andFilter?: boolean }) {
    this.store.dispatch(modelExperimentsTableFilterChanged({
      filter: {
        col: col.id,
        value,
        filterMatchMode: col.filterMatchMode || andFilter ? 'AND' : undefined
      }
    }));
  }

  clearTableFilters() {
    this.store.dispatch(modelsExperimentsTableClearAllFilters());
    this.filterChanged({col: {id: 'models.input.model'}, value: this.modelId, andFilter: false});
  }

  resizeCol({columnId, widthPx}: { columnId: string; widthPx: number }) {
    this._resizedCols[columnId] = `${widthPx}px`;
    this.resizedCols$.next(this._resizedCols);
  }
}
