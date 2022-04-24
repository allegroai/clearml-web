import {TableSelectionState} from '@common/constants';
import {allItemsAreSelected} from '../../../utils/shared-utils';
import {unionBy} from 'lodash/fp';
import {AfterViewInit, EventEmitter, Input, Output, QueryList, ViewChildren, Directive, OnDestroy} from '@angular/core';
import {ISmCol, TABLE_SORT_ORDER, TableSortOrderEnum} from './table.consts';
import {filter, take} from 'rxjs/operators';
import {TableComponent} from './table.component';
import {SortMeta} from 'primeng/api';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {sortByArr} from '../../../pipes/show-selected-first.pipe';
import {IOption} from '../../inputs/select-autocomplete-for-template-forms/select-autocomplete-for-template-forms.component';

@Directive()
export abstract class BaseTableView implements AfterViewInit, OnDestroy{
  public entityTypes = EntityTypeEnum;
  public selectionState: TableSelectionState;
  protected entitiesKey: string;
  public selectedEntitiesKey: string;
  public table: TableComponent;
  public menuBackdrop: boolean;
  public searchValues: { [colId: string]: string } = {};
  public filtersOptions: { [colId: string]: IOption[] } = {};
  public filtersValues: { [colId: string]: any } = {};
  public tableSortFieldsObject: {[fieldName: string]: {index: number; field: string; order: TableSortOrderEnum}} = {};

  @Input() contextMenuActive: boolean;
  @Input() selectionMode: 'multiple' | 'single' | null = 'single';
  @Input() entityType: EntityTypeEnum;
  @Input() colsOrder: string[];
  private _tableSortFields: SortMeta[];
  @Input() set tableSortFields(tableSortFields: SortMeta[]) {
    this._tableSortFields = tableSortFields;
    this.tableSortFieldsObject = tableSortFields.reduce((acc, sortField, i) => {
      acc[sortField.field] = {
        index: i,
        field: sortField.field,
        order: sortField.order > 0 ? TABLE_SORT_ORDER.ASC : TABLE_SORT_ORDER.DESC
      };
      return acc;
    }, {});
  }

  get tableSortFields() {
    return this._tableSortFields;
  }

  @Input() tableSortOrder: TableSortOrderEnum;
  @Input() minimizedView: boolean;
  protected prevSelected: any;

  @Input() set split(size: number) {
    this.table?.resize();
  }


  @Output() filterChanged = new EventEmitter() as EventEmitter<{ col: ISmCol; value: any; andFilter?: boolean }>;
  @Output() columnsReordered = new EventEmitter<string[]>();
  @ViewChildren(TableComponent) tables: QueryList<TableComponent>;

  ngAfterViewInit(): void {
    this.tables.changes
      .pipe(filter((comps: QueryList<TableComponent>) => !!comps.first), take(1))
      .subscribe((comps: QueryList<TableComponent>) => {
        this.table = comps.first;
        window.setTimeout(() => this.table?.focusSelected());
        this.afterTableInit();
      });
    this.tables.forEach(item => this.table = item);
  }

  updateSelectionState() {
    this.selectionState = allItemsAreSelected(this[this.entitiesKey], this[this.selectedEntitiesKey]) ? 'All' : this[this.selectedEntitiesKey].length > 0 ? 'Partial' : 'None';
  }

  headerCheckboxClicked() {
    let selectionUnion;
    if (this.selectionState === 'None') {
      selectionUnion = unionBy('id', this[this.entitiesKey], this[this.selectedEntitiesKey]);
    } else {
      selectionUnion = [];
    }
    this.emitSelection(selectionUnion);
  }

  isRowSelected(entity: { id: any }) {
    if (!entity || this[this.selectedEntitiesKey] === undefined) {
      return false;
    }

    return this[this.selectedEntitiesKey].length > 0 &&
      (this[this.selectedEntitiesKey].some((selectedEntity: { id: any }) => selectedEntity.id === entity.id));
  }

  setContextMenuStatus(menuStatus: boolean) {
    this.contextMenuActive = menuStatus;
  }

  getSelectionRange<T>(change: { field: string; value: boolean; event: Event }, entity: T): T[] {
    let addList = [entity];
    if ((change.event as MouseEvent).shiftKey && this.prevSelected) {
      let index1 = this[this.entitiesKey].indexOf(this.prevSelected);
      let index2 = this[this.entitiesKey].indexOf(entity);
      if (index1 > index2) {
        [index1, index2] = [index2, index1];
      }
      addList = this[this.entitiesKey].slice(index1 + 1, index2 + 1);
    }
    this.prevSelected = entity;
    return addList;
  }

  tableFilterChanged(col: ISmCol, event) {
    this.filterChanged.emit({col, value: event.value, andFilter: event.andFilter});
    this.scrollTableToTop();
  }

  sortOptionsList(columnId: string) {
    this.filtersOptions[columnId]
      .sort((a, b) => sortByArr(a.value, b.value, [null, ...(this.filtersValues[columnId] || [])]));
    this.filtersOptions = {...this.filtersOptions, [columnId]: [...this.filtersOptions[columnId]]};
  }
  searchValueChanged($event: string, colId: string) {
    this.searchValues[colId] = $event;
    this.sortOptionsList(colId);
  }
  columnFilterClosed(col: ISmCol) {
    window.setTimeout(() => this.sortOptionsList(col.id));
  }

  tableAllFiltersChanged(event: {col: string; value: unknown; matchMode?: string}) {
    this.filterChanged.emit({col: {id: event.col}, value: event.value, andFilter: event.matchMode === 'AND'});
    this.scrollTableToTop();
  }

  scrollTableToTop() {
    this.table?.table.scrollTo({top: 0});
  }

  afterTableInit() {
    const key = this.selectedEntitiesKey.slice(0, -1);
    if (this[key]) {
      window.setTimeout(() => this.table.scrollToElement(this[key]), 200);
    }
  }

  abstract emitSelection(selection: any[]);

  ngOnDestroy(): void {
    this.table = null;
  }
}
