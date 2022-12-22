import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef
} from '@angular/core';
import {TIME_FORMAT_STRING} from '@common/constants';
import {ColHeaderTypeEnum, ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {FILTERED_EXPERIMENTS_STATUS_OPTIONS} from '../../shared/common-experiments.const';
import {get, uniq} from 'lodash/fp';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {ITableExperiment} from '../../shared/common-experiment-model.model';
import {EXPERIMENTS_TABLE_COL_FIELDS} from '~/features/experiments/shared/experiments.const';
import {BaseTableView} from '@common/shared/ui-components/data/table/base-table-view';
import {getSystemTags, isDevelopment} from '~/features/experiments/shared/experiments.utils';
import {User} from '~/business-logic/model/users/user';
import {sortByArr} from '@common/shared/pipes/show-selected-first.pipe';
import {Store} from '@ngrx/store';
import {NoUnderscorePipe} from '@common/shared/pipes/no-underscore.pipe';
import {TitleCasePipe} from '@angular/common';
import {INITIAL_EXPERIMENT_TABLE_COLS} from '../../experiment.consts';
import {
  ProjectsGetTaskParentsResponseParents
} from '~/business-logic/model/projects/projectsGetTaskParentsResponseParents';
import {Router} from '@angular/router';
import {
  IOption
} from '@common/shared/ui-components/inputs/select-autocomplete-for-template-forms/select-autocomplete-for-template-forms.component';
import {CountAvailableAndIsDisableSelectedFiltered} from '@common/shared/entity-page/items.utils';
import {hyperParamSelectedExperiments, selectAllExperiments} from '../../actions/common-experiments-view.actions';
import {createFiltersFromStore, excludedKey, uniqueFilterValueAndExcluded} from '@common/shared/utils/tableParamEncode';
import {getRoundedNumber} from '../../shared/common-experiments.utils';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions} from '@angular/material/tooltip';

@Component({
  selector: 'sm-experiments-table',
  templateUrl: './experiments-table.component.html',
  styleUrls: ['./experiments-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
    useValue: {showDelay: 500, position: 'above'} as MatTooltipDefaultOptions,
  }]
})
export class ExperimentsTableComponent extends BaseTableView implements OnInit, OnDestroy {
  readonly experimentsTableColFields = EXPERIMENTS_TABLE_COL_FIELDS;
  readonly timeFormatString = TIME_FORMAT_STRING;

  public filtersOptions: { [colId: string]: IOption[] } = {
    [EXPERIMENTS_TABLE_COL_FIELDS.STATUS]: [],
    [EXPERIMENTS_TABLE_COL_FIELDS.TYPE]: [],
    [EXPERIMENTS_TABLE_COL_FIELDS.USER]: [],
    [EXPERIMENTS_TABLE_COL_FIELDS.TAGS]: [],
    [EXPERIMENTS_TABLE_COL_FIELDS.PARENT]: [],
    [EXPERIMENTS_TABLE_COL_FIELDS.PROJECT]: [],
  };
  readonly getSystemTags = getSystemTags;
  public isDevelopment = isDevelopment;
  private _selectedExperiments: ITableExperiment[] = [];
  readonly colHeaderTypeEnum = ColHeaderTypeEnum;
  @Input() initialColumns = INITIAL_EXPERIMENT_TABLE_COLS;
  @Input() contextMenuTemplate: TemplateRef<any> = null;

  @Input() tableCols: ISmCol[];
  private _experiments: Array<ITableExperiment> = [];
  private _selectedExperiment: ITableExperiment;
  public searchValues: { [colId: string]: string } = {};
  public roundedMetricValues: { [colId: string]: { [expId: string]: boolean } } = {};
  private _tableFilters: { [p: string]: FilterMetadata };

  @Input() set experiments(experiments: Array<ITableExperiment>) {
    this._experiments = experiments;

    this.tableCols?.filter(tableCol => tableCol.id.startsWith('last_metrics')).forEach(col => experiments?.forEach(exp => {
      const value = get(col.id, exp);
      this.roundedMetricValues[col.id] = this.roundedMetricValues[col.id] || {};
      this.roundedMetricValues[col.id][exp.id] = value && getRoundedNumber(value) !== value;
    }));

    if (this.contextExperiment) {
      this.contextExperiment = this._experiments.find(experiment => experiment.id === this.contextExperiment.id);
    }
  }

  get experiments(): Array<ITableExperiment> {
    return this._experiments;
  }

  public contextExperiment: ITableExperiment;
  public filtersValues: { [colId: string]: any } = {};
  public filtersMatch: { [colId: string]: string } = {};
  public filtersSubValues: { [colId: string]: any } = {};
  @Input() selectedExperimentsDisableAvailable: Record<string, CountAvailableAndIsDisableSelectedFiltered>;

  @Input() set users(users: User[]) {
    this.filtersOptions[EXPERIMENTS_TABLE_COL_FIELDS.USER] = users?.map(user => ({
      label: user.name ? user.name : 'Unknown User',
      value: user.id,
      tooltip: ''
    }));
    this.sortOptionsList(EXPERIMENTS_TABLE_COL_FIELDS.USER);
  }

  @Input() set hyperParamsOptions(hyperParamsOptions: Record<ISmCol['id'], string[]>) {
    Object.entries(hyperParamsOptions).forEach(([id, values]) => {
      this.filtersOptions[id] = [{label: '(No Value)', value: null}].concat(values.map(value => ({
        label: value,
        value
      })));
    });
  }

  @Input() activeParentsFilter: ProjectsGetTaskParentsResponseParents[];


  @Input() set parents(parents: ProjectsGetTaskParentsResponseParents[]) {
    const parentsAndActiveFilter = Array.from(new Set(parents.concat(this.activeParentsFilter || [])));
    this.filtersOptions[EXPERIMENTS_TABLE_COL_FIELDS.PARENT] = parentsAndActiveFilter.map(parent => ({
      label: parent.name ? parent.name : 'Unknown Experiment',
      value: parent.id,
      tooltip: `${parent.project?.name} / ${parent.name}`
    }));
    this.sortOptionsList(EXPERIMENTS_TABLE_COL_FIELDS.PARENT);
  }

  @Input() set selectedExperiments(experiments: ITableExperiment[]) {
    this._selectedExperiments = experiments;
    this.updateSelectionState();
  }

  get selectedExperiments(): ITableExperiment[] {
    return this._selectedExperiments;
  }

  @Input() set selectedExperiment(experiment: ITableExperiment) {
    if (this._selectedExperiment?.id !== experiment?.id) {
      window.setTimeout(() => !this.contextMenuActive && this.table?.focusSelected());
    }
    this._selectedExperiment = experiment;
  }

  get selectedExperiment() {
    return this._selectedExperiment;
  }

  @Input() noMoreExperiments: boolean;

  @Input() set tags(tags) {
    const tagsAndActiveFilter = uniqueFilterValueAndExcluded(tags, this.filtersValues[EXPERIMENTS_TABLE_COL_FIELDS.TAGS]);
    this.filtersOptions[EXPERIMENTS_TABLE_COL_FIELDS.TAGS] = tagsAndActiveFilter.map(tag => ({
      label: tag === null ? '(No tags)' : tag,
      value: tag
    }) as IOption);
    this.sortOptionalTagsList();
  }

  @Input() set experimentTypes(types: string[]) {
    const typesAndActiveFilter = uniq(types.concat(this.filtersValues[EXPERIMENTS_TABLE_COL_FIELDS.TYPE]));
    // under 4 letters assume an acronym and capitalize.
    this.filtersOptions[EXPERIMENTS_TABLE_COL_FIELDS.TYPE] = typesAndActiveFilter.map((type: string) =>
      ({
        label: (type?.length < 4 ? type.toUpperCase() : this.titleCasePipe.transform(this.noUnderscorePipe.transform(type))),
        value: type
      })
    );
  }

  @Input() set projects(projects) {
    if (!projects) {
      return;
    }
    this.filtersOptions[EXPERIMENTS_TABLE_COL_FIELDS.PROJECT] = projects.map(project => ({
      label: project.name,
      value: project.id,
      tooltip: `${project.name}`
    }));
    this.sortOptionsList(EXPERIMENTS_TABLE_COL_FIELDS.PROJECT);
  }

  @Input() systemTags = [] as string[];
  @Input() reorderableColumns: boolean = true;
  @Input() selectionReachedLimit: boolean;

  get validSystemTags() {
    return this.systemTags.filter(tag => tag !== 'archived');
  }

  @Input() set tableFilters(filters: { [s: string]: FilterMetadata }) {
    this._tableFilters = filters;
    this.filtersValues = {};
    this.filtersValues[EXPERIMENTS_TABLE_COL_FIELDS.STATUS] = get([EXPERIMENTS_TABLE_COL_FIELDS.STATUS, 'value'], filters) || [];
    this.filtersValues[EXPERIMENTS_TABLE_COL_FIELDS.TYPE] = get([EXPERIMENTS_TABLE_COL_FIELDS.TYPE, 'value'], filters) || [];
    this.filtersValues[EXPERIMENTS_TABLE_COL_FIELDS.USER] = get([EXPERIMENTS_TABLE_COL_FIELDS.USER, 'value'], filters) || [];
    this.filtersValues[EXPERIMENTS_TABLE_COL_FIELDS.TAGS] = get([EXPERIMENTS_TABLE_COL_FIELDS.TAGS, 'value'], filters) || [];
    this.filtersMatch[EXPERIMENTS_TABLE_COL_FIELDS.TAGS] = filters?.[EXPERIMENTS_TABLE_COL_FIELDS.TAGS]?.matchMode || '';
    this.filtersSubValues[EXPERIMENTS_TABLE_COL_FIELDS.TAGS] = (get(['system_tags', 'value'], filters) || []);
    this.filtersValues[EXPERIMENTS_TABLE_COL_FIELDS.PARENT] = get([EXPERIMENTS_TABLE_COL_FIELDS.PARENT, 'value'], filters) || [];
    this.filtersValues[EXPERIMENTS_TABLE_COL_FIELDS.PROJECT] = get([EXPERIMENTS_TABLE_COL_FIELDS.PROJECT, 'value'], filters) || [];
    this.filtersValues[EXPERIMENTS_TABLE_COL_FIELDS.VERSION] = get([EXPERIMENTS_TABLE_COL_FIELDS.VERSION, 'value'], filters) || [];
    this.filtersValues[EXPERIMENTS_TABLE_COL_FIELDS.LAST_UPDATE] = get([EXPERIMENTS_TABLE_COL_FIELDS.LAST_UPDATE, 'value'], filters) || [];
    this.filtersValues[EXPERIMENTS_TABLE_COL_FIELDS.STARTED] = get([EXPERIMENTS_TABLE_COL_FIELDS.STARTED, 'value'], filters) || [];

    // handle dynamic filters;
    const filtersValues = createFiltersFromStore(filters || {}, false);
    this.filtersValues = Object.assign({}, {...this.filtersValues}, {...filtersValues});
  }

  get tableFilters() {
    return this._tableFilters;
  }

  @Output() experimentSelectionChanged = new EventEmitter<{ experiment: ITableExperiment; openInfo?: boolean }>();
  @Output() experimentsSelectionChanged = new EventEmitter<Array<ITableExperiment>>();
  @Output() loadMoreExperiments = new EventEmitter();
  @Output() sortedChanged = new EventEmitter<{ isShift: boolean; colId: ISmCol['id'] }>();
  @Output() tagsMenuOpened = new EventEmitter();
  @Output() typesMenuOpened = new EventEmitter();
  @Output() columnResized = new EventEmitter<{ columnId: string; widthPx: number }>();
  @Output() openContextMenu = new EventEmitter<{ x: number; y: number; single?: boolean; backdrop?: boolean }>();
  @Output() removeTag = new EventEmitter<{ experiment: ITableExperiment; tag: string }>();
  @Output() clearAllFilters = new EventEmitter<{ [s: string]: FilterMetadata }>();

  constructor(
    private changeDetector: ChangeDetectorRef,
    private store: Store<any>,
    private noUnderscorePipe: NoUnderscorePipe,
    private titleCasePipe: TitleCasePipe,
    private router: Router
  ) {
    super();
    this.entitiesKey = 'experiments';
    this.selectedEntitiesKey = 'selectedExperiments';
  }

  ngOnInit() {
    this.filtersOptions[EXPERIMENTS_TABLE_COL_FIELDS.STATUS] = FILTERED_EXPERIMENTS_STATUS_OPTIONS(this.entityType === EntityTypeEnum.dataset);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  sortOptionalTagsList() {
    const selectedTags = (this.filtersValues[EXPERIMENTS_TABLE_COL_FIELDS.TAGS] || [])
      .map(tag => typeof tag === 'string' ? tag.replace(excludedKey, '') : tag);
    const tagsWithNull = [null].concat(selectedTags);
    this.filtersOptions[EXPERIMENTS_TABLE_COL_FIELDS.TAGS].sort((a, b) => sortByArr(a.value, b.value, tagsWithNull));
    this.filtersOptions = {
      ...this.filtersOptions,
      [EXPERIMENTS_TABLE_COL_FIELDS.TAGS]: [...this.filtersOptions[EXPERIMENTS_TABLE_COL_FIELDS.TAGS]]
    };
  }

  scrollTableToTop() {
    this.table?.table?.scrollTo({top: 0});
  }

  onLoadMoreClicked() {
    this.loadMoreExperiments.emit();
  }

  onSortChanged(isShift: boolean, colId: ISmCol['id']) {
    this.sortedChanged.emit({isShift, colId});
    this.scrollTableToTop();
  }

  rowSelectedChanged(change: { field: string; value: boolean; event: Event }, experiment: ITableExperiment) {
    if (change.value) {
      const addList = this.getSelectionRange<ITableExperiment>(change, experiment);
      this.experimentsSelectionChanged.emit([...this.selectedExperiments, ...addList]);
    } else {
      const removeList = this.getDeselectionRange(change, experiment as any);
      this.experimentsSelectionChanged.emit(this.selectedExperiments.filter((selectedExperiment) =>
        !removeList.includes(selectedExperiment.id)));
    }
  }

  tableRowClicked(event: { e: MouseEvent; data: ITableExperiment }) {
    if (this._selectedExperiments.some(exp => exp.id === event.data.id)) {
      this.onContextMenu({e: event.e, rowData: event.data, backdrop: true});
    } else if (!this.selectionReachedLimit) {
      this.experimentsSelectionChanged.emit([event.data]);
    }
  }

  emitSelection(selection: any[]) {
    this.experimentsSelectionChanged.emit(selection);
  }


  onContextMenu(data: { e: MouseEvent; rowData; single?: boolean; backdrop?: boolean }) {
    if (!data?.single) {
      this.contextExperiment = this._experiments.find(experiment => experiment.id === data.rowData.id);
      if (!this.selectedExperiments.map(exp => exp.id).includes(this.contextExperiment.id)) {
        this.prevSelected = this.contextExperiment.id;
        this.emitSelection([this.contextExperiment]);
      }
    } else {
      this.contextExperiment = data.rowData;
    }
    const event = data.e as MouseEvent;
    event.preventDefault();
    this.openContextMenu.emit({x: event.clientX, y: event.clientY, single: data?.single, backdrop: data?.backdrop});
  }


  navigateToParent(event: MouseEvent, experiment: ITableExperiment) {
    event.stopPropagation();
    return this.router.navigate(['projects', experiment.parent.project?.id || '*', 'experiments', experiment.parent.id],
      {queryParams: {filter: []}});
  }

  columnsWidthChanged({columnId, width}) {
    const colIndex = this.tableCols.findIndex(col => col.id === columnId);
    const delta = width - parseInt(this.tableCols[colIndex].style.width, 10);
    this.table?.updateColumnsWidth(columnId, width, delta);
  }

  columnFilterOpened(col: ISmCol) {
    if (col.id === EXPERIMENTS_TABLE_COL_FIELDS.TAGS) {
      if (!this.filtersOptions[EXPERIMENTS_TABLE_COL_FIELDS.TAGS]?.length) {
        this.tagsMenuOpened.emit();
      }
    } else if (col.id.includes('hyperparams')) {
      this.store.dispatch(hyperParamSelectedExperiments({col}));
    }
  }


  selectAll(filtered?: boolean) {
    this.store.dispatch(selectAllExperiments({filtered}));
  }

}
