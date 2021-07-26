import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, Input, Output, ViewChild} from '@angular/core';
import {ColHeaderTypeEnum, ISmCol} from '../../../shared/ui-components/data/table/table.consts';
import {get} from 'lodash/fp';
import {SelectedModel, TableModel} from '../models.model';
import {MODELS_FRAMEWORK_LABELS, MODELS_READY_LABELS, MODELS_TABLE_COL_FIELDS} from '../models.const';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {BaseTableView} from '../../../shared/ui-components/data/table/base-table-view';
import {User} from '../../../../business-logic/model/users/user';
import {sortByArr} from '../../../shared/pipes/show-selected-first.pipe';
import {Observable} from 'rxjs';
import {selectCompanyTags, selectProjectTags, selectTagsFilterByProject} from '../../../core/reducers/projects.reducer';
import {Store} from '@ngrx/store';
import {addTag} from '../../actions/models-menu.actions';
import { ModelMenuComponent } from '../../containers/model-menu/model-menu.component';
import {ICONS, TIME_FORMAT_STRING} from '../../../constants';
import {getSysTags} from '../../model.utils';
import {TableComponent} from '../../../shared/ui-components/data/table/table.component';
import { MODELS_TABLE_COLS } from '../../models.consts';
import {IOption} from '../../../shared/ui-components/inputs/select-autocomplete-for-template-forms/select-autocomplete-for-template-forms.component';
import {CountAvailableAndIsDisableSelectedFiltered} from '../../../shared/entity-page/items.utils';

@Component({
  selector       : 'sm-models-table',
  templateUrl    : './models-table.component.html',
  styleUrls      : ['./models-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelsTableComponent extends BaseTableView {
  readonly MODELS_TABLE_COL_FIELDS = MODELS_TABLE_COL_FIELDS;
  readonly MODELS_FRAMEWORK_OPTIONS = Object.entries(MODELS_FRAMEWORK_LABELS).map(([key, val]) => ({label: val, value: key}));
  readonly MODELS_READY_OPTIONS = Object.entries(MODELS_READY_LABELS).map(([key, val]) => ({label: val, value: key}));
  readonly filtersOptions: {[colId: string]: IOption[]} = {
    [MODELS_TABLE_COL_FIELDS.FRAMEWORK]: [],
    [MODELS_TABLE_COL_FIELDS.READY]    : this.MODELS_READY_OPTIONS,
    [MODELS_TABLE_COL_FIELDS.USER]    : [],
    [MODELS_TABLE_COL_FIELDS.TAGS]     : [],
  };

  readonly icons = ICONS;
  public menuOpen: boolean;
  public sortOrder = 1;

  public contextModel: SelectedModel;
  public tagsFilterByProject$: Observable<boolean>;
  public projectTags$: Observable<string[]>;
  public companyTags$: Observable<string[]>;
  private _selectedModels: TableModel[];
  private _models: SelectedModel[];
  private _enableMultiSelect: boolean;
  private _tableCols: ISmCol[];
  public getSysTags = getSysTags;
  public filtersValues: {[colId: string]: any} = {};
  public filtersMatch: {[colId: string]: string} = {};
  public filtersSubValues: {[colId: string]: any} = {};
  public searchValues: {[colId: string]: string} = {};

  @Input() set models(models: SelectedModel[]) {
    this._models = models;
    if (this.contextModel) {
      this.contextModel = this.models.find(model => model.id === this.contextModel.id);
    }
  }

  get models() {
    return this._models;
  }

  @Input() noMoreModels: boolean;

  @Input() set tableCols(tableCols: ISmCol[]) {
    if (tableCols?.length > 0) {
      tableCols[0].hidden = this.enableMultiSelect === false;
      this._tableCols = tableCols;
    }
  }

  get tableCols() {
    return this._tableCols;
  }

  @Input() set onlyPublished(only: boolean) {
    const readyCol = this.tableCols.find(col => col.id === MODELS_TABLE_COL_FIELDS.READY);
    readyCol.hidden = only;
  }

  @Input() set enableMultiSelect(enable: boolean) {
    this._enableMultiSelect = enable;
    if (this.tableCols) {
      this.tableCols[0].hidden = enable === false;
    }
  }

  get enableMultiSelect() {
    return this._enableMultiSelect;
  }

  @Input() set selectedModels(selection) {
    this._selectedModels = selection;
    this.updateSelectionState();
  }

  get selectedModels() {
    return this._selectedModels;
  }
  @Input() selectedModelsDisableAvailable: Record<string, CountAvailableAndIsDisableSelectedFiltered> = {};
  @Input() set colRatio(ratio: number) {
    if (ratio) {
      this.tableCols.forEach(col => {
        if (col.headerType != ColHeaderTypeEnum.checkBox && col.style?.width?.endsWith('px')) {
          const width = parseInt(col.style.width, 10);
          col.style.width = ratio * width + 'px';
        }
      });
    }
  }

  private _selectedModel;
  @Input() set selectedModel(model) {
    if(model !== this._selectedModel) {
      window.setTimeout(() => this.table.focusSelected());
    }
    this._selectedModel = model;
  }

  get selectedModel() {
    return this._selectedModel;
  }

  @Input() set tableFilters(filters: { [s: string]: FilterMetadata }) {
    this.filtersValues[MODELS_TABLE_COL_FIELDS.FRAMEWORK] = get([MODELS_TABLE_COL_FIELDS.FRAMEWORK, 'value'], filters) || [];
    this.filtersValues[MODELS_TABLE_COL_FIELDS.READY] = get([MODELS_TABLE_COL_FIELDS.READY, 'value'], filters) || [];
    this.filtersValues[MODELS_TABLE_COL_FIELDS.USER] = get([MODELS_TABLE_COL_FIELDS.USER, 'value'], filters) || [];
    this.filtersValues[MODELS_TABLE_COL_FIELDS.TAGS] = get([MODELS_TABLE_COL_FIELDS.TAGS, 'value'], filters) || [];
    this.filtersMatch[MODELS_TABLE_COL_FIELDS.TAGS] = filters?.[MODELS_TABLE_COL_FIELDS.TAGS]?.matchMode || '';
    this.filtersSubValues[MODELS_TABLE_COL_FIELDS.TAGS] = get(['system_tags', 'value'], filters) || [];
  }

  @Input() set users(users: User[]) {
    this.filtersOptions[MODELS_TABLE_COL_FIELDS.USER] = users.map(user => ({label: user.name ? user.name : 'Unknown User', value: user.id}));
    this.sortOptionalUsersList();
  }

  @Input() set frameworks(frameworks: string[]) {
    const frameworksAndActiveFilter = Array.from(new Set(frameworks.concat(this.filtersValues[MODELS_TABLE_COL_FIELDS.FRAMEWORK])));
    this.filtersOptions[MODELS_TABLE_COL_FIELDS.FRAMEWORK] = frameworksAndActiveFilter.map(framework => ({
      label: framework ? framework :
        (framework === null ? '(No framework)' : 'Unknown'), value: framework
    }));
    this.sortOptionalFrameworksList();
  }

  @Input() set tags(tags) {
    const tagsAndActiveFilter = Array.from(new Set(tags.concat(this.filtersValues[MODELS_TABLE_COL_FIELDS.TAGS])));
    this.filtersOptions[MODELS_TABLE_COL_FIELDS.TAGS] = tagsAndActiveFilter.
    map(tag => ({label: tag===null? 'No tag':tag , value: tag}) as IOption);
    this.sortOptionalTagsList();
  }

  @Input() systemTags = [] as string[];
  get validSystemTags() {
    return this.systemTags.filter(tag => tag !== 'archived');
  }

  @Output() modelsSelectionChanged = new EventEmitter<SelectedModel[]>();
  @Output() modelSelectionChanged = new EventEmitter<SelectedModel>();
  @Output() loadMoreModels = new EventEmitter();
  @Output() tagsMenuOpened = new EventEmitter();
  @Output() sortedChanged = new EventEmitter<{ isShift: boolean; colId: ISmCol['id'] }>();
  @Output() columnResized = new EventEmitter<{columnId: string; widthPx: number}>();
  @ViewChild(TableComponent, {static: true}) table: TableComponent;
  @ViewChild('contextMenu') contextMenu: ModelMenuComponent;
  timeFormatString = TIME_FORMAT_STRING;
  public readonly initialColumns = MODELS_TABLE_COLS;

  @HostListener('document:click', ['$event'])
  clickHandler(event) {
    if (event.button != 2) { // Bug in firefox: right click triggers `click` event
      this.menuOpen = false;
    }
  }

  constructor(private changeDetector: ChangeDetectorRef, private store: Store<any>) {
    super();
    this.tagsFilterByProject$ = this.store.select(selectTagsFilterByProject);
    this.projectTags$ = this.store.select(selectProjectTags);
    this.companyTags$ = this.store.select(selectCompanyTags);
    this.entitiesKey = 'models';
    this.selectedEntitiesKey = 'selectedModels';
  }

  afterTableInit() {
    if (this._selectedModel) {
      this.table.scrollToElement(this._selectedModel);
    }
  }

  sortOptionalUsersList() {
    this.filtersOptions.users.sort((a, b) => sortByArr(a.value, b.value, this.filtersValues[MODELS_TABLE_COL_FIELDS.USER]));
  }

  sortOptionalTagsList() {
    this.filtersOptions.tags.sort((a, b) => sortByArr(a.value, b.value, this.filtersValues[MODELS_TABLE_COL_FIELDS.TAGS]));
  }

  sortOptionalFrameworksList() {
    this.filtersOptions.framework.sort((a, b) => sortByArr(a.value, b.value, [null].concat(this.filtersValues[MODELS_TABLE_COL_FIELDS.FRAMEWORK])));
  }

  onRowSelectionChanged(event) {
    this.modelSelectionChanged.emit(event.data);
  }

  tableFilterChanged(col: ISmCol, event) {
    if (event.col === 'users') {
      event.col = 'user.name';
    }
    this.filterChanged.emit({col, value: event.value, andFilter: event.andFilter});
    this.scrollTableToTop();
  }

  onLoadMoreClicked() {
    this.loadMoreModels.emit();
  }

  onSortChanged(isShift: boolean, colId: ISmCol['id']) {
    this.sortedChanged.emit({isShift, colId});
    this.scrollTableToTop();
  }

  get sortableCols() {
    return this.tableCols.filter(col => col.sortable);
  }

  getColName(colId: ISmCol['id']) {
    return this.tableCols.find(col => colId === col.id)?.header;
  }

  rowSelectedChanged(change: { field: string; value: boolean; event: Event }, model: TableModel) {
    if (change.value) {
      const addList = this.getSelectionRange<TableModel>(change, model);
      this.modelsSelectionChanged.emit([...this.selectedModels, ...addList]);
    } else {
      this.modelsSelectionChanged.emit(this.selectedModels.filter((selectedModel) => selectedModel.id !== model.id));
    }
  }

  selectAll(checked) {
    const notAllAreSelected = this.models.length !== this.selectedModels.length && this.selectedModels.length > 1;
    if (!checked.value || notAllAreSelected) {
      this.modelsSelectionChanged.emit([]);
    } else {
      this.modelsSelectionChanged.emit(this.models);
    }
  }

  emitSelection(selection: any[]) {
    this.modelsSelectionChanged.emit(selection);
  }

  searchValueChanged($event: string, colId) {
    this.searchValues[colId] = $event;
  }

  addTag(tag: string) {
    this.store.dispatch(addTag({
      tag,
      models: this.selectedModels.length > 1 ? this.selectedModels : [this.contextModel]
    }));
  }

  openContextMenu(data) {
    if (this.modelsSelectionChanged.observers.length === 0) {
      return;
    }
    this.contextModel = this.models.find(model => model.id === data.rowData.id);
    if (!this.selectedModels.map(model => model.id).includes(this.contextModel.id)) {
      this.prevSelected = this.contextModel;
      this.emitSelection([this.contextModel]);
    }
    const event = data.e as MouseEvent;
    event.preventDefault();
    this.contextMenu?.openMenu({x: event.clientX, y: event.clientY});
  }
}
