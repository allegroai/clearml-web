import {
  ChangeDetectionStrategy,
  Component, computed,
  effect,
  EventEmitter, input,
  Output,
  signal
} from '@angular/core';
import {ISmCol} from '../table.consts';
import {addOrRemoveFromArray} from '../../../../utils/shared-utils';
import {MatMenuModule} from '@angular/material/menu';
import { NgTemplateOutlet } from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {
  CheckboxThreeStateListComponent
} from '@common/shared/ui-components/panel/checkbox-three-state-list/checkbox-three-state-list.component';
import {MatListModule} from '@angular/material/list';
import {MenuItemComponent} from '@common/shared/ui-components/panel/menu-item/menu-item.component';
import {FilterPipe} from '@common/shared/pipes/filter.pipe';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {DotsLoadMoreComponent} from '@common/shared/ui-components/indicators/dots-load-more/dots-load-more.component';
import {IOption} from '@common/constants';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'sm-table-card-filter-template',
  templateUrl: './table-card-filter-template.component.html',
  styleUrls: ['./table-card-filter-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatMenuModule,
    NgTemplateOutlet,
    MatInputModule,
    CheckboxThreeStateListComponent,
    MatListModule,
    MenuItemComponent,
    FilterPipe,
    ClickStopPropagationDirective,
    DotsLoadMoreComponent,
    FormsModule,
  ]
})
export class TableCardFilterTemplateComponent {

  protected searchTerms = {};
  protected pageNumber = signal(1);
  protected loading = signal<boolean>(false);


  value = input<{[colId: string]: string[]}>({});
  fixedOptionsSubheader = input<string>();
  subValue = input<string[]>( []);
  subOptions = input<IOption[]>([]);
  columns = input.required<ISmCol[]>();
  options = input.required<{[col: string]: IOption[]}>();
  filterMatch = input<{ [colId: string]: string }>();
  protected isFiltering = computed(() =>
    (this.value() && Object.values(this.value()).some(options => options?.length > 0)) ||
    this.subValue()?.length > 0
  );
  protected optionsFiltered = computed(() => {
    if (this.options() && this.columns()) {
      return this.columns()
        .filter(column => column.showInCardFilters && this.options()[column.id])
        .map(column => ({key: column.id, value: this.options()[column.id]}));
    }
    return [];
  });

  @Output() subFilterChanged = new EventEmitter();
  @Output() filterChanged = new EventEmitter<{ col: string; value: unknown; matchMode?: string }>();
  @Output() menuClosed = new EventEmitter<ISmCol>();
  @Output() menuOpened = new EventEmitter<ISmCol>();
  @Output() clearAll = new EventEmitter();

  constructor() {
    effect(() => {
      if(this.loading()) {
        window.setTimeout(() => this.loading.set(false), 300)
      }
    }, {allowSignalWrites: true});
  }

  emitFilterChangedCheckBox(colId: string, values: string[]) {
    this.filterChanged.emit({col: colId, value: values, matchMode: this.filterMatch?.[colId]});
  }

  onSubFilterChanged(col, val) {
    if (val) {
      const newValues = addOrRemoveFromArray(this.subValue(), val.itemValue);
      this.subFilterChanged.emit({col, value: newValues});
    }
  }

  setSearchTerm($event, key: string) {
    this.searchTerms[key] = $event.target.value;
    this.loading.set(true);
    this.pageNumber.set(1);
  }

  closeMenu(col: ISmCol) {
    this.searchTerms = {};
    this.pageNumber.set(1);
    this.menuClosed.emit(col);
  }

  clearSearch(key: string) {
    this.searchTerms[key] = '';
    this.loading.set(true);
    this.pageNumber.set(1);
    this.setSearchTerm({target: {value: ''}}, key);
  }

  toggleCombination(colId: string) {
    this.filterMatch[colId] = this.filterMatch[colId] === 'AND' ? '' : 'AND';
    if (this.value()?.[colId]?.length > 1) {
      this.filterChanged.emit({col: colId, value: this.value()[colId], matchMode: this.filterMatch[colId]});
    }
  }

  getColumnByOption(option: {key: string}) {
    return this.columns().find(col => col.id === option.key);
  }

  loadMore() {
    window.setTimeout(() => this.pageNumber.set(this.pageNumber() + 1), 300);
    this.loading.set(true);
  }
}
