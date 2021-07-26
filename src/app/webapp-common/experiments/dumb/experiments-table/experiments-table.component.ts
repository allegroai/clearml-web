import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {ICONS} from '../../../constants';
import {ColHeaderTypeEnum, ISmCol} from '../../../shared/ui-components/data/table/table.consts';
import {FILTERED_EXPERIMENTS_STATUS_OPTIONS} from '../../shared/common-experiments.const';
import {get, uniq} from 'lodash/fp';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {ITableExperiment} from '../../shared/common-experiment-model.model';
import {
  DIGITS_AFTER_DECIMAL,
  EXPERIMENTS_TABLE_COL_FIELDS,
} from '../../../../features/experiments/shared/experiments.const';
import {BaseTableView} from '../../../shared/ui-components/data/table/base-table-view';
import {getSystemTags, isDevelopment} from '../../../../features/experiments/shared/experiments.utils';
import {User} from '../../../../business-logic/model/users/user';
import {sortByArr} from '../../../shared/pipes/show-selected-first.pipe';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectCompanyTags, selectProjectTags, selectTagsFilterByProject} from '../../../core/reducers/projects.reducer';
import {addTag} from '../../actions/common-experiments-menu.actions';

import {TIME_FORMAT_STRING} from '../../../constants';
import {NoUnderscorePipe} from '../../../shared/pipes/no-underscore.pipe';
import {TitleCasePipe} from '@angular/common';
import {INITIAL_EXPERIMENT_TABLE_COLS} from '../../experiment.consts';
import {ProjectsGetTaskParentsResponseParents} from '../../../../business-logic/model/projects/projectsGetTaskParentsResponseParents';
import {Router} from '@angular/router';
import {MatMenuTrigger} from '@angular/material/menu';
import {IOption} from '../../../shared/ui-components/inputs/select-autocomplete-for-template-forms/select-autocomplete-for-template-forms.component';
import {createFiltersFromStore} from '../../effects/common-experiments-view.effects';
import {CountAvailableAndIsDisableSelectedFiltered} from '../../../shared/entity-page/items.utils';
import {ExperimentMenuComponent} from '../../shared/components/experiment-menu/experiment-menu.component';
import {hyperParamSelectedExperiments} from '../../actions/common-experiments-view.actions';

@Component({
  selector: 'sm-experiments-table',
  templateUrl: './experiments-table.component.html',
  styleUrls: ['./experiments-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentsTableComponent extends BaseTableView {
  readonly EXPERIMENTS_TABLE_COL_FIELDS = EXPERIMENTS_TABLE_COL_FIELDS;
  readonly FILTERED_EXPERIMENTS_STATUS_OPTIONS = FILTERED_EXPERIMENTS_STATUS_OPTIONS;
  public allFiltersOptions: {[colId: string]: IOption[]} = {
    [EXPERIMENTS_TABLE_COL_FIELDS.STATUS]: this.FILTERED_EXPERIMENTS_STATUS_OPTIONS,
    [EXPERIMENTS_TABLE_COL_FIELDS.TYPE]: [],
    [EXPERIMENTS_TABLE_COL_FIELDS.USER]: [],
    [EXPERIMENTS_TABLE_COL_FIELDS.TAGS]: [],
    [EXPERIMENTS_TABLE_COL_FIELDS.PARENT]: []
  };
  readonly ICONS = ICONS;
  readonly getSystemTags = getSystemTags;
  public isDevelopment = isDevelopment;
  public menuOpen: boolean = false;
  private _selectedExperiments: ITableExperiment[] = [];
  readonly colHeaderTypeEnum = ColHeaderTypeEnum;
  public readonly initialColumns = INITIAL_EXPERIMENT_TABLE_COLS;

  @Input() tableCols: ISmCol[];
  private _experiments: Array<ITableExperiment> = [];
  private _selectedExperiment: ITableExperiment;
  private lastOpenPopover: MatMenuTrigger;
  public searchValues: {[colId: string]: string} = {};

  @Input() set experiments(value: Array<ITableExperiment>) {
    this._experiments = value;
    if (this.contextExperiment) {
      this.contextExperiment = this._experiments.find(experiment => experiment.id === this.contextExperiment.id);
    }
  }

  get experiments(): Array<ITableExperiment> {
    return this._experiments;
  }

  public contextExperiment: ITableExperiment;
  public tagsFilterByProject$: Observable<boolean>;
  public projectTags$: Observable<string[]>;
  public companyTags$: Observable<string[]>;
  public filtersValues: {[colId: string]: any} = {};
  public filtersMatch: {[colId: string]: string} = {};
  public filtersSubValues: {[colId: string]: any} = {};
  @Input() selectedExperimentsDisableAvailable: Record<string, CountAvailableAndIsDisableSelectedFiltered>;
  @Input() set users(users: User[]) {
    this.allFiltersOptions[EXPERIMENTS_TABLE_COL_FIELDS.USER] = users.map(user => ({
      label: user.name ? user.name : 'Unknown User',
      value: user.id
    }));
    this.sortOptionalUsersList();
  }

  @Input() set hyperParamsOptions(hyperParamsOptions: Record<ISmCol['id'], string[]>) {
    Object.entries(hyperParamsOptions).forEach(([id, values]) => {
      this.allFiltersOptions[id] = [{label: '(No Value)', value: null}].concat(values.map(value => ({label: value, value})));
    });
  }

  @Input() activeParentsFilter: ProjectsGetTaskParentsResponseParents[];

  @Input() set parents(parents: ProjectsGetTaskParentsResponseParents[]) {
    const parentsAndActiveFilter = Array.from(new Set(parents.concat(this.activeParentsFilter || [])));
    this.allFiltersOptions[EXPERIMENTS_TABLE_COL_FIELDS.PARENT] = parentsAndActiveFilter.map(parent => ({
      label: parent.name ? parent.name : 'Unknown Experiment',
      value: parent.id,
      tooltip: `${parent.project?.name} / ${parent.name}`
    }));
    this.sortOptionalParentsList();
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
    const tagsAndActiveFilter = Array.from(new Set(tags.concat(this.filtersValues[EXPERIMENTS_TABLE_COL_FIELDS.TAGS])));
    this.allFiltersOptions[EXPERIMENTS_TABLE_COL_FIELDS.TAGS] = tagsAndActiveFilter.map(tag => ({
      label: tag === null ? '(No tags)' : tag,
      value: tag
    }) as IOption);
    this.sortOptionalTagsList();
  }

  @Input() set experimentTypes(types: string[]) {
    const typesAndActiveFilter = uniq(types.concat(this.filtersValues[EXPERIMENTS_TABLE_COL_FIELDS.TYPE]));
    // under 4 letters assume an acronym and capitalize.
    this.allFiltersOptions[EXPERIMENTS_TABLE_COL_FIELDS.TYPE] = typesAndActiveFilter.map((type: string) =>
      ({
        label: (type?.length < 4 ? type.toUpperCase() : this.titleCasePipe.transform(this.noUnderscorePipe.transform(type))),
        value: type
      })
    );
  }

  @Input() systemTags = [] as string[];

  get validSystemTags() {
    return this.systemTags.filter(tag => tag !== 'archived');
  }

  @Input() set tableFilters(filters: { [s: string]: FilterMetadata }) {
    this.filtersValues[EXPERIMENTS_TABLE_COL_FIELDS.STATUS] = get([EXPERIMENTS_TABLE_COL_FIELDS.STATUS, 'value'], filters) || [];
    this.filtersValues[EXPERIMENTS_TABLE_COL_FIELDS.TYPE] = get([EXPERIMENTS_TABLE_COL_FIELDS.TYPE, 'value'], filters) || [];
    this.filtersValues[EXPERIMENTS_TABLE_COL_FIELDS.USER] = get([EXPERIMENTS_TABLE_COL_FIELDS.USER, 'value'], filters) || [];
    this.filtersValues[EXPERIMENTS_TABLE_COL_FIELDS.TAGS] = get([EXPERIMENTS_TABLE_COL_FIELDS.TAGS, 'value'], filters) || [];
    this.filtersMatch[EXPERIMENTS_TABLE_COL_FIELDS.TAGS] = filters?.[EXPERIMENTS_TABLE_COL_FIELDS.TAGS]?.matchMode || '';
    this.filtersSubValues[EXPERIMENTS_TABLE_COL_FIELDS.TAGS] = (get(['system_tags', 'value'], filters) || []);
    this.filtersValues[EXPERIMENTS_TABLE_COL_FIELDS.PARENT] = get([EXPERIMENTS_TABLE_COL_FIELDS.PARENT, 'value'], filters) || [];

    // handle dynamic filters;
    const filtersValues = createFiltersFromStore(filters || {}, false);
    this.filtersValues = Object.assign({}, {...this.filtersValues}, {...filtersValues});
  }

  @Output() experimentSelectionChanged = new EventEmitter<ITableExperiment>();
  @Output() experimentsSelectionChanged = new EventEmitter<Array<ITableExperiment>>();
  @Output() loadMoreExperiments = new EventEmitter();
  @Output() sortedChanged = new EventEmitter<{ isShift: boolean; colId: ISmCol['id'] }>();
  @Output() tagsMenuOpened = new EventEmitter();
  @Output() typesMenuOpened = new EventEmitter();
  @Output() columnResized = new EventEmitter<{columnId: string; widthPx: number}>();
  @ViewChild('contextMenu') contextMenu: ExperimentMenuComponent;
  TIME_FORMAT_STRING = TIME_FORMAT_STRING;

  @HostListener('document:click', ['$event'])
  clickHandler(event) {
    if (event.button != 2) { // Bug in firefox: right click triggers `click` event
      this.menuOpen = false;
    }
  }
  constructor(
    private changeDetector: ChangeDetectorRef,
    private store: Store<any>,
    private noUnderscorePipe: NoUnderscorePipe,
    private titleCasePipe: TitleCasePipe,
    private router: Router
  ) {
    super();
    this.tagsFilterByProject$ = this.store.select(selectTagsFilterByProject);
    this.projectTags$ = this.store.select(selectProjectTags);
    this.companyTags$ = this.store.select(selectCompanyTags);
    this.entitiesKey = 'experiments';
    this.selectedEntitiesKey = 'selectedExperiments';
  }

  afterTableInit() {
    if (this.selectedExperiment) {
      this.table.scrollToElement(this.selectedExperiment);
    }
  }

  onSortFilterMenuOpened(col: ISmCol) {
    if (col.id === EXPERIMENTS_TABLE_COL_FIELDS.TAGS) {
      this.tagsMenuOpened.emit();
    } else if (col.id.includes('hyperparams')) {
      this.store.dispatch(hyperParamSelectedExperiments({col}));
    }
  }

  onRowSelectionChanged(event) {
    this.experimentSelectionChanged.emit(event.data);
  }

  sortOptionalUsersList() {
    this.allFiltersOptions[EXPERIMENTS_TABLE_COL_FIELDS.USER]
      .sort((a, b) => sortByArr(a.value, b.value, this.filtersValues[EXPERIMENTS_TABLE_COL_FIELDS.USER]));
  }

  sortOptionalParentsList() {
    this.allFiltersOptions[EXPERIMENTS_TABLE_COL_FIELDS.PARENT]
      .sort((a, b) => sortByArr(a.value, b.value, this.filtersValues[EXPERIMENTS_TABLE_COL_FIELDS.PARENT]));
  }

  sortOptionalTagsList() {
    this.allFiltersOptions[EXPERIMENTS_TABLE_COL_FIELDS.TAGS]
      .sort((a, b) => sortByArr(a.value, b.value, [null].concat(this.filtersValues[EXPERIMENTS_TABLE_COL_FIELDS.TAGS])));
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
      this.experimentsSelectionChanged.emit(this.selectedExperiments.filter((selectedExperiment) => selectedExperiment.id !== experiment.id));
    }
  }

  getVarient(metrics, col) {
    const value = get(`${col.metric_hash}.${col.variant_hash}.${col.valueType}`, metrics);
    if (value !== undefined) {
      return Math.round(value * Math.pow(10, DIGITS_AFTER_DECIMAL)) / Math.pow(10, DIGITS_AFTER_DECIMAL);
    }
    return '';
  }

  getHyperParam(params, col) {
    if (params && col.isParam) {
      const param = col.id.replace('hyperparams.', '');
      return get(`${param}.value`, params);
    }
    return '';
  }

  emitSelection(selection: any[]) {
    this.experimentsSelectionChanged.emit(selection);
  }

  searchValueChanged($event: string, colId) {
    this.searchValues[colId] = $event;
  }

  usersMenuClosed() {
    // this.searchValues[EXPERIMENTS_TABLE_COL_FIELDS.PARENT] = undefined;
    this.sortOptionalUsersList();
  }

  addTag(tag: string) {
    this.store.dispatch(addTag({
      tag,
      experiments: this.selectedExperiments.length > 1 ? this.selectedExperiments : [this.contextExperiment]
    }));
  }

  onContextMenu(data) {
    this.contextExperiment = this._experiments.find(experiment => experiment.id === data.rowData.id);
    if (!this.selectedExperiments.map(exp => exp.id).includes(this.contextExperiment.id)) {
      this.prevSelected = this.contextExperiment;
      this.emitSelection([this.contextExperiment]);
    }
    const event = data.e as MouseEvent;
    event.preventDefault();
    this.contextMenu?.openMenu({x: event.clientX, y: event.clientY});
  }


  navigateToParent(event: MouseEvent, experiment: ITableExperiment) {
    event.stopPropagation();
    return this.router.navigate([`projects/${experiment.parent.project?.id || '*'}/experiments/${experiment.parent.id}`],
      {queryParams: {filter: []}});
  }

  closeLast(currTrigger: MatMenuTrigger) {
    if (this.lastOpenPopover !== currTrigger) {
      this.lastOpenPopover?.closeMenu();
      this.lastOpenPopover = currTrigger;
    }
  }
}
