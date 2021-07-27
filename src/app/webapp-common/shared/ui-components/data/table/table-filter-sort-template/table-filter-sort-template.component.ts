import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ColHeaderFilterTypeEnum, ISmCol, TABLE_SORT_ORDER, TableSortOrderEnum} from '../table.consts';
import {addOrRemoveFromArray} from '../../../../utils/shared-utils';

@Component({
  selector: 'sm-table-filter-sort-template',
  templateUrl: './table-filter-sort-template.component.html',
  styleUrls: ['./table-filter-sort-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableFilterSortTemplateComponent {

  public readonly TABLE_SORT_ORDER = TABLE_SORT_ORDER;

  public formControl = new FormControl();
  header;
  enableSort = true;
  enableFilter: boolean;
  enableSearch = false;
  isSorted: boolean;
  filterType: ColHeaderFilterTypeEnum;
  supportAndFilter: boolean;
  private _value: string[];

  FILTER_TYPE = ColHeaderFilterTypeEnum;
  @Input() sortOrder: { index: number; field: string; order: TableSortOrderEnum };

  @Input() set column(col: ISmCol) {
    this.header = col.header;
    this.enableSort = col.sortable;
    this.enableFilter = col.filterable;
    this.enableSearch = col.searchableFilter;
    this.filterType = col.filterType;
    this.supportAndFilter = col.andFilter;
  }

  @Input() searchValue;
  @Input() fixedOptionsSubheader;

  @Input() set value(value: Array<string>) {
    if (Array.isArray(value)) {
      this.formControl.setValue(value);
      this._value = value;
    }
  }

  get value() {
    return this._value;
  }

  @Input() subValue: string[] = [];
  @Input() andFilter: boolean = null;

  @Input() options: Array<{ label: string; value: string; tooltip?: string }>;
  @Input() subOptions: Array<{ label: string; value: string }>;
  @Input() tooltip: boolean = false;
  @Output() filterChanged = new EventEmitter();
  @Output() subFilterChanged = new EventEmitter();
  @Output() menuClosed = new EventEmitter();
  @Output() menuOpened = new EventEmitter();
  @Output() sortOrderChanged = new EventEmitter<boolean>();
  @Output() searchValueChanged = new EventEmitter<string>();

  trackByLabel = (index: number, item) => item.label;
  trackByValFn = (index, item) => item.value;

  switchSortOrder($event: MouseEvent) {
    this.sortOrderChanged.emit($event.shiftKey);
  }

  onFilterChanged(val) {
    if (val) {
      const newValues = addOrRemoveFromArray(this.value, val.itemValue);
      this.filterChanged.emit({value: newValues, andFilter: this.andFilter});
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
    switch (this.sortOrder?.order) {
      case TABLE_SORT_ORDER.DESC:
        this.isSorted = true;
        return 'i-sort-on-down';
      case  TABLE_SORT_ORDER.ASC:
        this.isSorted = true;
        return 'i-sort-on-up';
      default:
        this.isSorted = false;
        return 'i-sort-off';
    }
  }

  toggleCombination() {
    this.andFilter = !this.andFilter;
    if (this.value?.length > 1) {
      this.filterChanged.emit({value: this.value, andFilter: this.andFilter});
    }
  }
}
