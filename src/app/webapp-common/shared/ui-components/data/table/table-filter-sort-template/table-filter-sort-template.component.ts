import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ISmCol, TABLE_SORT_ORDER, TableSortOrderEnum} from '../table.consts';
import {addOrRemoveFromArray} from '../../../../utils/shared-utils';

@Component({
  selector   : 'sm-table-filter-sort-template',
  templateUrl: './table-filter-sort-template.component.html',
  styleUrls  : ['./table-filter-sort-template.component.scss']
})
export class TableFilterSortTemplateComponent {

  public readonly TABLE_SORT_ORDER = TABLE_SORT_ORDER;

  private _value: Array<string>;
  public formControl = new FormControl();
  header;
  enableSort = true;
  enableSearch = false;

  @Input() sortOrder: TableSortOrderEnum | boolean;
  @Input() set column(col: ISmCol) {
    this.header = col.header;
    this.enableSort = col.sortable;
    this.enableSearch= col.searchableFilter;
  }
  @Input() searchValue;
  @Input() fixedOptionsSubheader;
  @Input() enableTooltip: boolean;

  @Input() set value(value: Array<string>) {
    this.formControl.setValue(value);
    this._value = value;
  }

  get value() {
    return this._value;
  }

  @Input() subValue: string[] = [];

  @Input() options: Array<{ label: string; value: string; tooltip?: string }>;
  @Input() subOptions: Array<{ label: string; value: string }>;
  @Output() filterChanged = new EventEmitter();
  @Output() subFilterChanged = new EventEmitter();
  @Output() menuClosed = new EventEmitter();
  @Output() menuOpened = new EventEmitter();
  @Output() sortOrderChanged = new EventEmitter<TableSortOrderEnum>();
  @Output() searchValueChanged = new EventEmitter<string>();

  switchSortOrder() {
    const newSortOrder = this.toggleSortOrder(this.sortOrder);
    this.sortOrderChanged.emit(newSortOrder);
  }

  private toggleSortOrder(sortOrder: TableSortOrderEnum | boolean) {
    if (sortOrder === this.TABLE_SORT_ORDER.ASC) {
      return this.TABLE_SORT_ORDER.DESC;
    }

    return this.TABLE_SORT_ORDER.ASC;
  }

  onFilterChanged(val) {
    if (val) {
      const newValues = addOrRemoveFromArray(this.value, val.itemValue);
      this.filterChanged.emit({value: newValues});
    }
  }

  onSubFilterChanged(val) {
    if (val) {
      const newValues = addOrRemoveFromArray(this.subValue, val.itemValue);
      this.subFilterChanged.emit({value: newValues});
    }
  }

  isFiltered() {
    const filtered = (this.value && this.value.length > 0) || (this.subValue && this.subValue.length > 0);
    return filtered;
  }

  sortedClass() {
    switch (this.sortOrder) {
      case TABLE_SORT_ORDER.DESC:
        return 'i-sort-on-up';
      case  TABLE_SORT_ORDER.ASC:
        return 'i-sort-on-down';
      default:
        return 'i-sort-off';
    }
  }


  mainMenuClosed() {
    this.menuClosed.emit();

  }
}
