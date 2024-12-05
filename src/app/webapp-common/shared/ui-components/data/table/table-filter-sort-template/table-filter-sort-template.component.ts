import {
  ChangeDetectionStrategy,
  Component, computed, effect,
  EventEmitter, input,
  Input,
  Output, signal
} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';
import {ColHeaderFilterTypeEnum, ISmCol, TABLE_SORT_ORDER, TableSortOrderEnum} from '../table.consts';
import {addOrRemoveFromArray} from '../../../../utils/shared-utils';
import {
  CheckboxThreeStateListComponent
} from '@common/shared/ui-components/panel/checkbox-three-state-list/checkbox-three-state-list.component';

import {
  TableFilterDurationNumericComponent
} from '@common/shared/ui-components/data/table/table-duration-sort-template/table-filter-duration-numeric/table-filter-duration-numeric.component';
import {
  TableFilterDurationComponent
} from '@common/shared/ui-components/data/table/table-duration-sort-template/table-filter-duration/table-filter-duration.component';
import {MenuComponent} from '@common/shared/ui-components/panel/menu/menu.component';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {MenuItemComponent} from '@common/shared/ui-components/panel/menu-item/menu-item.component';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {
  TableFilterDurationDateTimeComponent
} from '@common/shared/ui-components/data/table/table-duration-sort-template/table-filter-duration-date-time/table-filter-duration-date-time.component';
import {ScrollEndDirective} from '@common/shared/ui-components/directives/scroll-end.directive';
import {DotsLoadMoreComponent} from '@common/shared/ui-components/indicators/dots-load-more/dots-load-more.component';

@Component({
  selector: 'sm-table-filter-sort-template',
  templateUrl: './table-filter-sort-template.component.html',
  styleUrls: ['./table-filter-sort-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CheckboxThreeStateListComponent,
    TableFilterDurationNumericComponent,
    TableFilterDurationComponent,
    MenuComponent,
    TooltipDirective,
    MenuItemComponent,
    ClickStopPropagationDirective,
    TableFilterDurationDateTimeComponent,
    ScrollEndDirective,
    DotsLoadMoreComponent
  ]
})
export class TableFilterSortTemplateComponent {

  public readonly TABLE_SORT_ORDER = TABLE_SORT_ORDER;

  public formControl = new UntypedFormControl();
  isSorted: boolean;
  searching = true;
  private _value: string[];
  public loading: boolean;

  FILTER_TYPE = ColHeaderFilterTypeEnum;
  @Input() sortOrder: { index: number; field: string; order: TableSortOrderEnum };
  public previousLength: number | undefined;
  private previousSearchValue: string;
  private isOpen: boolean;
  private pageNumber = signal(1);

  @Input() fixedOptionsSubheader;

  @Input() set value(filters: string[]) {
    this.loading = false;
    if (Array.isArray(filters)) {
      this.formControl.setValue(filters);
      this._value = filters;
    } else {
      this.formControl.setValue([]);
      this._value = [];
    }
  }

  get value() {
    return this._value;
  }

  @Input() subValue: string[] = [];
  @Input() andFilter: boolean = null;

  column = input<ISmCol>();
  searchValue = input<string>();
  options = input<{ label: string; value: string; tooltip?: string}[]>();
  protected paginatedOptions = computed(() => this.column().paginatedFilterPageSize ?
    this.options()?.slice(0, this.column().paginatedFilterPageSize * this.pageNumber()) : this.options()
  );
  protected noMoreOptions = computed(() => this.column().asyncFilter ?
    this.options()?.length < this.column().paginatedFilterPageSize || this.options()?.length === this.previousLength && this.searchValue() === this.previousSearchValue :
  this.paginatedOptions()?.length === this.options()?.length);

  @Input() subOptions: { label: string; value: string }[];
  @Input() tooltip = false;
  @Output() filterChanged = new EventEmitter();
  @Output() subFilterChanged = new EventEmitter();
  @Output() menuClosed = new EventEmitter();
  @Output() menuOpened = new EventEmitter();
  @Output() sortOrderChanged = new EventEmitter<boolean>();
  @Output() searchValueChanged = new EventEmitter<{ value: string; loadMore?: boolean }>();

  constructor() {
    effect(() => {
      if (this.options() && this.isOpen) {
        this.previousLength = this.options()?.length;
        this.searching = false;
        this.loading = false;
      }
    }, );

    effect(() => {
      if (this.searchValue() && this.previousSearchValue !== this.searchValue()) {
        this.pageNumber.set(1);
      }
      this.previousSearchValue = this.searchValue();
    }, {allowSignalWrites: true});
  }

  switchSortOrder($event: MouseEvent) {
    this.sortOrderChanged.emit($event.shiftKey);
  }

  onSubFilterChanged(val) {
    if (val) {
      const newValues = addOrRemoveFromArray(this.subValue, val.itemValue);
      this.subFilterChanged.emit({value: newValues});
    }
  }

  isFiltered() {
    return (this.value && this.value.length > 0) || (this.subValue && this.subValue.length > 0);
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
    this.emitFilterChanged();
  }

  emitFilterChanged(value?: string[]) {
    this.filterChanged.emit({
      value: value || this.value,
      andFilter: this.andFilter
    });
  }

  loadMore() {
    this.loading = true;
    this.pageNumber.update(num => num + 1);
    if (!this.column().asyncFilter) {
      window.setTimeout(() => this.loading = false, 300);
    }
    this.searchValueChanged.emit({value: this.searchValue() || '', loadMore: true});
  }

  onMenuClose() {
    if (!this.noMoreOptions()) {
      this.previousLength = 0;
    }
    this.pageNumber.set(1);
    this.menuClosed.emit();
    this.isOpen = false;
  }

  onMenuOpen() {
    this.isOpen = true;
    this.menuOpened.emit();
  }

  searchChanged(value: string) {
    this.searching = true;
    this.searchValueChanged.emit({value});
  }
}
