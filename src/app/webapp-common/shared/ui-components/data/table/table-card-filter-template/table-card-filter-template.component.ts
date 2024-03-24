import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ISmCol} from '../table.consts';
import {addOrRemoveFromArray} from '../../../../utils/shared-utils';
import {MatMenuModule, MatMenuTrigger} from '@angular/material/menu';
import { NgTemplateOutlet } from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {
  CheckboxThreeStateListComponent
} from '@common/shared/ui-components/panel/checkbox-three-state-list/checkbox-three-state-list.component';
import {filter} from 'rxjs/operators';
import {MatListModule} from '@angular/material/list';
import {MenuItemComponent} from '@common/shared/ui-components/panel/menu-item/menu-item.component';
import {FilterPipe} from '@common/shared/pipes/filter.pipe';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';

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
    FormsModule,
    CheckboxThreeStateListComponent,
    MatListModule,
    MenuItemComponent,
    FilterPipe,
    ClickStopPropagationDirective
]
})
export class TableCardFilterTemplateComponent {

  private _value: Array<string>;
  public searchTerms = {};
  public optionsFiltered: {key: string; value: any}[];
  private _columns: ISmCol[];
  private _options: { [p: string]: { label: string; value: string; tooltip?: string }[] };
  public isFiltering: boolean;

  @Input() set value(value: any) {
    this._value = value;
    this.isFiltering = value && this.isFiltered();
  }

  get value() {
    return this._value;
  }

  @Input() fixedOptionsSubheader;
  @Input() subValue: string[] = [];
  @Input() subOptions: { label: string; value: string }[];

  @Input() set columns(columns: ISmCol[]) {
    this._columns = columns;
    this.updateFilterFields();
  }

  get columns() {
    return this._columns;
  }

  @Input() set options(options: { [col: string]: { label: string; value: string; tooltip?: string }[] }) {
    this._options = options;
    this.updateFilterFields();
  }

  get options() {
    return this._options;
  }

  @Input() filterMatch: { [colId: string]: string };
  @Output() subFilterChanged = new EventEmitter();
  @Output() filterChanged = new EventEmitter<{ col: string; value: unknown; matchMode?: string }>();
  @Output() menuClosed = new EventEmitter<ISmCol>();
  @Output() menuOpened = new EventEmitter<ISmCol>();
  @Output() clearAll = new EventEmitter();

  @ViewChild(MatMenuTrigger, {static: true}) trigger: MatMenuTrigger;

  trackByLabel = (index: number, item) => item.label;

  onFilterChanged(colId: string, val) {
    if (val) {
      const newValues = addOrRemoveFromArray(this.value[colId], val.itemValue);
      this.filterChanged.emit({col: colId, value: newValues, matchMode: this.filterMatch?.[colId]});
    }
  }

  emitFilterChangedCheckBox(colId: string, values: string[]) {
    this.filterChanged.emit({col: colId, value: values, matchMode: this.filterMatch?.[colId]});
  }

  onSubFilterChanged(col, val) {
    if (val) {
      const newValues = addOrRemoveFromArray(this.subValue, val.itemValue);
      this.subFilterChanged.emit({col, value: newValues});
    }
  }

  isFiltered() {
    return (this.value && Object.keys(this.value).some(col => this.value[col]?.length > 0)) ||
      this.subValue?.length > 0;
  }


  isOptionFiltered(key: string) {
    return this.value && this.value[key]?.length > 0;
  }


  setSearchTerm($event, key: string) {
    this.searchTerms[key] = $event.target.value;
  }

  closeMenu(col: ISmCol) {
    this.searchTerms = {};
    this.menuClosed.emit(col);
  }

  clearSearch(key: string) {
    this.searchTerms[key] = '';
    this.setSearchTerm({target: {value: ''}}, key);
  }

  toggleCombination(colId: string) {
    this.filterMatch[colId] = this.filterMatch[colId] === 'AND' ? '' : 'AND';
    if (this.value?.[colId]?.length > 1) {
      this.filterChanged.emit({col: colId, value: this.value[colId], matchMode: this.filterMatch[colId]});
    }
  }

  getColumnByOption(option: {key: string}) {
    return this.columns.find(col => col.id === option.key);
  }

  private updateFilterFields() {
    if (this.options && this.columns) {
      this.optionsFiltered = this.columns
        .filter(column => column.showInCardFilters)
        .map(column => ({key: column.id, value: this.options[column.id]}));
    }
  }

  protected readonly filter = filter;
}
