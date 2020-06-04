import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ICONS} from '../../../../app.constants';
import {ColHeaderTypeEnum, ISmCol, TableSortOrderEnum} from '../../../shared/ui-components/data/table/table.consts';
import {FILTERED_EXPERIMENTS_STATUS_OPTIONS} from '../../shared/common-experiments.const';
import {get} from 'lodash/fp';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {ITableExperiment} from '../../shared/common-experiment-model.model';
import {DIGITS_AFTER_DECIMAL, EXPERIMENTS_TABLE_COL_FIELDS} from '../../../../features/experiments/shared/experiments.const';
import {BaseTableView} from '../../../shared/ui-components/data/table/base-table-view';
import {getSystemTags, isDevelopment} from '../../../../features/experiments/shared/experiments.utils';
import {User} from '../../../../business-logic/model/users/user';
import {sortByArr} from '../../../shared/pipes/show-selected-first.pipe';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectProjectTags} from '../../../core/reducers/projects.reducer';
import {addTag} from '../../actions/common-experiments-menu.actions';
import {ExperimentMenuComponent} from '../../../../features/experiments/shared/components/experiment-menu/experiment-menu.component';
import {TIME_FORMAT_STRING} from '../../../constants';
import {NoUnderscorePipe} from '../../../shared/pipes/no-underscore.pipe';
import {TitleCasePipe} from '@angular/common';

@Component({
  selector       : 'sm-experiments-table',
  templateUrl    : './experiments-table.component.html',
  styleUrls      : ['./experiments-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentsTableComponent extends BaseTableView implements OnInit {
  readonly EXPERIMENTS_TABLE_COL_FIELDS = EXPERIMENTS_TABLE_COL_FIELDS;
  readonly FILTERED_EXPERIMENTS_STATUS_OPTIONS = FILTERED_EXPERIMENTS_STATUS_OPTIONS;
  public EXPERIMENTS_ALL_FILTER_OPTIONS = {
    status: this.FILTERED_EXPERIMENTS_STATUS_OPTIONS,
    type  :[],
    users : [],
    tags  : [],
  };
  readonly ICONS = ICONS;
  readonly getSystemTags = getSystemTags;
  public tagSearchValue: string;
  public sortOrder = 1;
  public statusFiltersValue: any;
  public typeFiltersValue: any;
  public allFiltersValue: { type: any; status: any; users: any, tags: any };
  public tagsFiltersValue: any;
  public systemTagsFiltersValue: any;
  public isDevelopment = isDevelopment;
  public menuOpen: boolean = false;
  private _selectedExperiments: ITableExperiment[] = [];
  readonly ColHeaderTypeEnum = ColHeaderTypeEnum;

  @Input() tableCols: Array<ISmCol>;
  private _experiments: Array<ITableExperiment> = [];
  @Input() set experiments(value: Array<ITableExperiment>) {
    this._experiments = value;
    if (this.contextExperiment) {
      this.contextExperiment = this._experiments.find(experiment => experiment.id === this.contextExperiment.id);
    }
  }

  get experiments(): Array<ITableExperiment> {
    return this._experiments;
  }

  public userFiltersValue: any;
  public userSearchValue: string;
  public contextExperiment: ITableExperiment;
  public tags$: Observable<string[]>;

  @Input() set users(users: User[]) {
    this.EXPERIMENTS_ALL_FILTER_OPTIONS.users = users.map(user => {
      return {label: user.name ? user.name : 'Unknown User', value: user.id};
    });
    this.sortOptionalUsersList();
  }

  @Input() set selectedExperiments(experiments: ITableExperiment[]) {
    this._selectedExperiments = experiments;
    this.updateSelectionState();
  }

  get selectedExperiments(): ITableExperiment[] {
    return this._selectedExperiments;
  }

  @Input() selectedExperiment: ITableExperiment;
  @Input() noMoreExperiments: boolean;

  @Input() set tags(tags) {
    const tagsAndActiveFilter = Array.from(new Set(tags.concat(this.tagsFiltersValue)));
    this.EXPERIMENTS_ALL_FILTER_OPTIONS.tags = tagsAndActiveFilter.map(tag => ({label: tag, value: tag}));
    this.sortOptionalTagsList();
  }

  @Input() systemTags;
  @Input() set experimentTypes(types: string[]){
    this.EXPERIMENTS_ALL_FILTER_OPTIONS.type = types.map((type) => ({label: this.titleCasePipe.transform(this.noUnderscorePipe.transform(type)), value: type}))
  };

  @Input() set tableFilters(filters: { [s: string]: FilterMetadata }) {
    this.statusFiltersValue = get([EXPERIMENTS_TABLE_COL_FIELDS.STATUS, 'value'], filters) || [];
    this.typeFiltersValue = get([EXPERIMENTS_TABLE_COL_FIELDS.TYPE, 'value'], filters) || [];
    this.userFiltersValue = get([EXPERIMENTS_TABLE_COL_FIELDS.USER, 'value'], filters) || [];
    this.tagsFiltersValue = get([EXPERIMENTS_TABLE_COL_FIELDS.TAGS, 'value'], filters) || [];
    this.systemTagsFiltersValue = get(['system_tags', 'value'], filters) || [];
    this.allFiltersValue = {status: this.statusFiltersValue, type: this.typeFiltersValue, users: this.userFiltersValue, tags: this.tagsFiltersValue};
  }

  @Output() experimentSelectionChanged = new EventEmitter<ITableExperiment>();
  @Output() experimentsSelectionChanged = new EventEmitter<Array<ITableExperiment>>();
  @Output() loadMoreExperiments = new EventEmitter();
  @Output() sortedChanged = new EventEmitter<{ sortOrder: TableSortOrderEnum; colId: ISmCol['id'] }>();
  @Output() filterChanged = new EventEmitter();
  @Output() tagsMenuOpened = new EventEmitter();
  @Output() typesMenuOpened = new EventEmitter();

  @ViewChild('tableContainer', {static: true}) tableContainer;
  @ViewChild('contextMenu') contextMenu: ExperimentMenuComponent;
  TIME_FORMAT_STRING = TIME_FORMAT_STRING;

  @HostListener('document:click', ['$event'])
  clickHandler(event) {
    if (event.button != 2) { // Bug in firefox: right click triggers `click` event
      this.menuOpen = false;
    }
  }

  constructor(private changeDetector: ChangeDetectorRef, private store: Store, private noUnderscorePipe: NoUnderscorePipe, private titleCasePipe: TitleCasePipe) {
    super();
    this.tags$ = this.store.select(selectProjectTags);
    this.entitiesKey = 'experiments';
    this.selectedEntitiesKey = 'selectedExperiments';
  }

  ngOnInit(): void {

  }

  onRowSelectionChanged(event) {
    this.experimentSelectionChanged.emit(event.data);
  }

  sortOptionalUsersList() {
    this.EXPERIMENTS_ALL_FILTER_OPTIONS.users.sort((a, b) => sortByArr(a.value, b.value, this.userFiltersValue));
  }

  sortOptionalTagsList() {
    this.EXPERIMENTS_ALL_FILTER_OPTIONS.tags.sort((a, b) => sortByArr(a.value, b.value, this.tagsFiltersValue));
  }

  tagSearchValueChanged(searchTerm) {
    this.tagSearchValue = searchTerm;
  }


  tableFilterChanged(col: ISmCol, event) {
    this.filterChanged.emit({col, value: event.value});
    this.scrollTableToTop();
  }

  scrollTableToTop() {
    this.tableContainer.nativeElement.scroll({top: 0});
  }

  tableAllFiltersChanged(event) {
    if (event.col === 'users') {
      event.col = 'user.name';
    }
    this.filterChanged.emit({col: {id: event.col}, value: event.value});
    this.scrollTableToTop();
  }

  onLoadMoreClicked() {
    this.loadMoreExperiments.emit();
  }

  onSortChanged(sortOrder, colId: ISmCol['id']) {
    this.sortedChanged.emit({sortOrder, colId});
    this.scrollTableToTop();
  }

  get sortableCols() {
    return this.tableCols.filter(col => col.sortable);
  }

  getColName(colId: ISmCol['id']) {
    const col = this.tableCols.find(col => colId === col.id);
    return col ? col.header : 'Sort by';
  }

  rowSelectedChanged(checked, experiment) {
    if (checked.value) {
      this.experimentsSelectionChanged.emit([...this.selectedExperiments, experiment]);
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
      const param = col.id.replace('execution.parameters.', '');
      return params[param];
    }
    return '';
  }

  emitSelection(selection: any[]) {
    this.experimentsSelectionChanged.emit(selection);
  }

  userSearchValueChanged(searchTerm) {
    this.userSearchValue = searchTerm;
  }


  searchValueChanged($event: any) {
    switch ($event.key) {
      case 'users':
        this.userSearchValueChanged($event.value);
        return;
      case 'tags':
        this.tagSearchValueChanged($event.value);
        return;
    }
  }

  usersMenuClosed() {
    this.userSearchValue = undefined;
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
    const event = data.e as MouseEvent;
    event.preventDefault();
    this.contextMenu.openMenu({x: event.clientX, y: event.clientY});
  }
}
