import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import {ColHeaderTypeEnum, ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {get} from 'lodash-es';
import {SelectedModel, TableModel} from '../models.model';
import {MODELS_READY_LABELS, MODELS_TABLE_COL_FIELDS} from '../models.const';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {BaseTableView} from '@common/shared/ui-components/data/table/base-table-view';
import {User} from '~/business-logic/model/users/user';
import {Observable} from 'rxjs';
import {selectCompanyTags, selectProjectTags, selectTagsFilterByProject} from '@common/core/reducers/projects.reducer';
import {Store} from '@ngrx/store';
import {addTag} from '../../actions/models-menu.actions';
import {ICONS, TIME_FORMAT_STRING} from '@common/constants';
import {getSysTags} from '../../model.utils';
import {TableComponent} from '@common/shared/ui-components/data/table/table.component';
import {MODELS_TABLE_COLS} from '../../models.consts';
import {
  IOption
} from '@common/shared/ui-components/inputs/select-autocomplete-for-template-forms/select-autocomplete-for-template-forms.component';
import {
  CountAvailableAndIsDisableSelectedFiltered,
  MenuItems,
  selectionDisabledArchive,
  selectionDisabledDelete,
  selectionDisabledMoveTo,
  selectionDisabledPublishModels
} from '@common/shared/entity-page/items.utils';
import {getCustomMetrics, getModelsMetadataValuesForKey, selectAllModels} from '../../actions/models-view.actions';
import {
  ModelMenuExtendedComponent
} from '~/features/models/containers/model-menu-extended/model-menu-extended.component';
import {createFiltersFromStore} from '@common/shared/utils/tableParamEncode';
import {EXPERIMENTS_TABLE_COL_FIELDS} from '~/features/experiments/shared/experiments.const';
import {getRoundedNumber} from '@common/experiments/shared/common-experiments.utils';

@Component({
  selector: 'sm-models-table',
  templateUrl: './models-table.component.html',
  styleUrls: ['./models-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelsTableComponent extends BaseTableView {
  readonly modelsTableColFields = MODELS_TABLE_COL_FIELDS;
  readonly modelsReadyOptions = Object.entries(MODELS_READY_LABELS).map(([key, val]) => ({label: val, value: key}));
  readonly timeFormatString = TIME_FORMAT_STRING;

  public filtersOptions: { [colId: string]: IOption[] } = {
    [MODELS_TABLE_COL_FIELDS.FRAMEWORK]: [],
    [MODELS_TABLE_COL_FIELDS.READY]: this.modelsReadyOptions,
    [MODELS_TABLE_COL_FIELDS.USER]: [],
    [MODELS_TABLE_COL_FIELDS.TAGS]: [],
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
  public filtersMatch: { [colId: string]: string } = {};
  public filtersSubValues: { [colId: string]: any } = {};
  public singleRowContext: boolean;
  private _tableFilters: { [p: string]: FilterMetadata };
  public roundedMetricValues: { [colId: string]: { [expId: string]: boolean } } = {};


  @Input() set models(models: SelectedModel[]) {
    this._models = models;

    this.tableCols?.filter(tableCol => tableCol.id.startsWith('last_metrics')).forEach(col => models?.forEach(exp => {
      const value = get(exp, col.id);
      this.roundedMetricValues[col.id] = this.roundedMetricValues[col.id] || {};
      this.roundedMetricValues[col.id][exp.id] = value && getRoundedNumber(value) !== value;
    }));

    if (this.contextModel) {
      this.contextModel = this.models.find(model => model.id === this.contextModel.id);
    }
  }

  get models() {
    return this._models;
  }

  @Input() noMoreModels: boolean;
  @Input() reorderableColumns: boolean = true;

  @Input() set tableCols(tableCols: ISmCol[]) {
    if (tableCols?.length > 0) {
      tableCols[0].hidden = this.enableMultiSelect === false;
      const statusColumn = tableCols.find(col => col.id === 'ready');
      if (statusColumn) {
        statusColumn.filterable = this.enableMultiSelect;
        statusColumn.sortable = this.enableMultiSelect;
      }
      this._tableCols = tableCols;
    }
  }

  get tableCols() {
    return this._tableCols;
  }

  @Input() set onlyPublished(only: boolean) {
    const readyCol = this.tableCols.find(col => col.id === MODELS_TABLE_COL_FIELDS.READY);
    if (readyCol) {
      readyCol.hidden = only;
    }
  }

  @Input() set projects(projects) {
    if (!projects) {
      this.filtersOptions[MODELS_TABLE_COL_FIELDS.PROJECT] = null;
      return;
    }
    this.filtersOptions[MODELS_TABLE_COL_FIELDS.PROJECT] = projects.map(project => ({
      label: project.name,
      value: project.id,
      tooltip: `${project.name}`
    }));
    this.sortOptionsList(MODELS_TABLE_COL_FIELDS.PROJECT);
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
    if (model && model.id !== this._selectedModel?.id) {
      window.setTimeout(() => this.table?.focusSelected());
    }
    this._selectedModel = model;
  }

  get selectedModel() {
    return this._selectedModel;
  }

  @Input() set tableFilters(filters: { [s: string]: FilterMetadata }) {
    this._tableFilters = filters;
    this.filtersValues = {};
    this.filtersValues[MODELS_TABLE_COL_FIELDS.FRAMEWORK] = filters?.[MODELS_TABLE_COL_FIELDS.FRAMEWORK]?.value ?? [];
    this.filtersValues[MODELS_TABLE_COL_FIELDS.READY] = filters?.[MODELS_TABLE_COL_FIELDS.READY]?.value ?? [];
    this.filtersValues[MODELS_TABLE_COL_FIELDS.USER] = get(filters, [MODELS_TABLE_COL_FIELDS.USER, 'value'], []);
    this.filtersValues[MODELS_TABLE_COL_FIELDS.TAGS] = filters?.[MODELS_TABLE_COL_FIELDS.TAGS]?.value ?? [];
    this.filtersValues[MODELS_TABLE_COL_FIELDS.PROJECT] = get(filters, [MODELS_TABLE_COL_FIELDS.PROJECT, 'value'], []);
    this.filtersMatch[MODELS_TABLE_COL_FIELDS.TAGS] = filters?.[MODELS_TABLE_COL_FIELDS.TAGS]?.matchMode ?? '';
    this.filtersSubValues[MODELS_TABLE_COL_FIELDS.TAGS] = filters?.system_tags?.value ?? [];
    // dynamic filters
    const filtersValues = createFiltersFromStore(filters || {}, false);
    this.filtersValues = Object.assign({}, {...this.filtersValues}, {...filtersValues});
  }

  get tableFilters() {
    return this._tableFilters;
  }

  @Input() set users(users: User[]) {
    this.filtersOptions[MODELS_TABLE_COL_FIELDS.USER] = users.map(user => ({
      label: user.name ? user.name : 'Unknown User',
      value: user.id
    }));
    this.sortOptionsList(MODELS_TABLE_COL_FIELDS.USER);
  }

  @Input() set metadataValuesOptions(metadataValuesOptions: Record<ISmCol['id'], string[]>) {
    Object.entries(metadataValuesOptions).forEach(([id, values]) => {
      this.filtersOptions[id] = [{label: '(No Value)', value: null}].concat(values.map(value => ({
        label: value,
        value
      })));
    });
  }


  @Input() set frameworks(frameworks: string[]) {
    const frameworksAndActiveFilter = Array.from(new Set(frameworks.concat(this.filtersValues[MODELS_TABLE_COL_FIELDS.FRAMEWORK])));
    this.filtersOptions[MODELS_TABLE_COL_FIELDS.FRAMEWORK] = frameworksAndActiveFilter.map(framework => ({
      label: framework ? framework :
        (framework === null ? '(No framework)' : 'Unknown'), value: framework
    }));
    this.sortOptionsList(MODELS_TABLE_COL_FIELDS.FRAMEWORK);
  }

  @Input() set tags(tags) {
    const tagsAndActiveFilter = Array.from(new Set(tags.concat(this.filtersValues[MODELS_TABLE_COL_FIELDS.TAGS])));
    this.filtersOptions[MODELS_TABLE_COL_FIELDS.TAGS] = tagsAndActiveFilter.map(tag => ({
      label: tag === null ? '(No tags)' : tag,
      value: tag
    }) as IOption);
    this.sortOptionsList(MODELS_TABLE_COL_FIELDS.TAGS);
  }

  @Input() systemTags = [] as string[];

  get validSystemTags() {
    return this.systemTags.filter(tag => tag !== 'archived');
  }

  @Output() modelsSelectionChanged = new EventEmitter<SelectedModel[]>();
  @Output() modelSelectionChanged = new EventEmitter<{ model: SelectedModel; openInfo?: boolean }>();
  @Output() loadMoreModels = new EventEmitter();
  @Output() tagsMenuOpened = new EventEmitter();
  @Output() sortedChanged = new EventEmitter<{ isShift: boolean; colId: ISmCol['id'] }>();
  @Output() columnResized = new EventEmitter<{ columnId: string; widthPx: number }>();
  @Output() clearAllFilters = new EventEmitter<{ [s: string]: FilterMetadata }>();

  @ViewChild(TableComponent, {static: true}) table: TableComponent;
  @ViewChild('contextMenuExtended') contextMenuExtended: ModelMenuExtendedComponent;
  public readonly initialColumns = MODELS_TABLE_COLS;

  @HostListener('document:click', ['$event'])
  clickHandler(event) {
    if (event.button != 2) { // Bug in firefox: right click triggers `click` event
      this.menuOpen = false;
    }
  }

  constructor(private changeDetector: ChangeDetectorRef, private store: Store) {
    super();
    this.tagsFilterByProject$ = this.store.select(selectTagsFilterByProject);
    this.projectTags$ = this.store.select(selectProjectTags);
    this.companyTags$ = this.store.select(selectCompanyTags);
    this.entitiesKey = 'models';
    this.selectedEntitiesKey = 'selectedModels';

  }


  onRowSelectionChanged(event) {
    this.modelSelectionChanged.emit({model: event.data});
  }


  onLoadMoreClicked() {
    this.loadMoreModels.emit();
  }

  onSortChanged(isShift: boolean, colId: ISmCol['id']) {
    this.sortedChanged.emit({isShift, colId});
    this.scrollTableToTop();
  }

  get sortableCols() {
    return this.tableCols?.filter(col => col.sortable);
  }

  getColName(colId: ISmCol['id']) {
    return this.tableCols?.find(col => colId === col.id)?.header;
  }

  rowSelectedChanged(change: { field: string; value: boolean; event: Event }, model: TableModel) {
    if (change.value) {
      const addList = this.getSelectionRange<TableModel>(change, model);
      this.modelsSelectionChanged.emit([...this.selectedModels, ...addList]);
    } else {
      const removeList = this.getDeselectionRange(change, model as any);
      this.modelsSelectionChanged.emit(this.selectedModels.filter((selectedModel) =>
        !removeList.includes(selectedModel.id)));
    }
  }

  selectAll(filtered = false) {
    this.store.dispatch(selectAllModels({filtered}));
  }

  emitSelection(selection: any[]) {
    this.modelsSelectionChanged.emit(selection);
  }


  addTag(tag: string) {
    this.store.dispatch(addTag({
      tag,
      models: this.selectedModels.length > 1 ? this.selectedModels : [this.contextModel]
    }));
    this.filtersOptions[MODELS_TABLE_COL_FIELDS.TAGS] = [];
  }

  tableRowClicked(event: { e: MouseEvent; data: TableModel }) {
    if (this._selectedModels.some(exp => exp.id === event.data.id)) {
      this.openContextMenu({e: event.e, rowData: event.data, backdrop: true});
    } else {
      this.modelsSelectionChanged.emit([event.data]);
    }
  }

  openContextMenu(data: { e: MouseEvent; rowData; single?: boolean; backdrop?: boolean }) {
    if (!this.modelsSelectionChanged.observed) {
      return;
    }
    this.singleRowContext = !!data?.single;
    this.menuBackdrop = !!data?.backdrop;
    if (!data?.single) {
      this.contextModel = this.models.find(model => model.id === data.rowData.id);
      if (!this.selectedModels.map(model => model.id).includes(this.contextModel.id)) {
        this.prevSelected = this.contextModel.id;
        this.emitSelection([this.contextModel]);
      }
    } else {
      this.contextModel = data.rowData;
    }

    const event = data.e as MouseEvent;
    event.preventDefault();
    this.contextMenuExtended?.contextMenu.openMenu({x: event.clientX, y: event.clientY});
  }

  columnFilterOpened(col: ISmCol) {
    this.sortOptionsList(col.id);
    if (col.id === MODELS_TABLE_COL_FIELDS.TAGS && !this.filtersOptions[MODELS_TABLE_COL_FIELDS.TAGS]?.length) {
      this.tagsMenuOpened.emit();
    } else if (col.type === 'metadata') {
      this.store.dispatch(getModelsMetadataValuesForKey({col}));
    } else if (col.type === 'hyperparams') {
      this.store.dispatch(getCustomMetrics());
    } else if (col.id === EXPERIMENTS_TABLE_COL_FIELDS.PROJECT) {
      if (!this.filtersOptions[EXPERIMENTS_TABLE_COL_FIELDS.PROJECT]?.length) {
        this.filterSearchChanged.emit({colId: col.id, value: {value: ''}});
      }
    }
  }

  getSingleSelectedModelsDisableAvailable = (model): Record<string, CountAvailableAndIsDisableSelectedFiltered> => ({
    [MenuItems.publish]: selectionDisabledPublishModels([model]),
    [MenuItems.moveTo]: selectionDisabledMoveTo([model]),
    [MenuItems.delete]: selectionDisabledDelete([model]),
    [MenuItems.archive]: selectionDisabledArchive([model])
  });

  columnsWidthChanged({columnId, width}) {
    const colIndex = this.tableCols.findIndex(col => col.id === columnId);
    const delta = width - parseInt(this.tableCols[colIndex].style.width, 10);
    this.table?.updateColumnsWidth(columnId, width, delta);
  }
}
