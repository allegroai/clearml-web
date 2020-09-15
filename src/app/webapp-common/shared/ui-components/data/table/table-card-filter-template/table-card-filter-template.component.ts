import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ISmCol, TABLE_SORT_ORDER} from '../table.consts';
import {addOrRemoveFromArray} from '../../../../utils/shared-utils';
import {MatMenuTrigger} from '@angular/material/menu';

@Component({
  selector   : 'sm-table-card-filter-template',
  templateUrl: './table-card-filter-template.component.html',
  styleUrls  : ['./table-card-filter-template.component.scss']
})
export class TableCardFilterTemplateComponent {

  public readonly TABLE_SORT_ORDER = TABLE_SORT_ORDER;

  private _value: Array<string>;
  public searchTerms = {};

  @Input() set value(value: any) {
    this._value = value;
  }

  get value() {
    return this._value;
  }

  @Input() fixedOptionsSubheader;
  @Input() subValue: string[] = [];
  @Input() subOptions: {label: string; value: string}[];
  @Input() options: { [col: string]: { label: string; value: string }[] };
  @Input() columns: ISmCol[];
  @Output() subFilterChanged = new EventEmitter();
  @Output() filterChanged = new EventEmitter();
  @Output() menuClosed = new EventEmitter();
  @Output() menuOpened = new EventEmitter();
  @Output() searchValueChanged = new EventEmitter();

  @ViewChild(MatMenuTrigger, {static: true}) trigger: MatMenuTrigger;

  onFilterChanged(col, val) {
    if (val) {
      const newValues = addOrRemoveFromArray(this.value[col], val.itemValue);
      this.filterChanged.emit({col: col, value: newValues});
    }
  }

  onSubFilterChanged(col, val) {
    if (val) {
      const newValues = addOrRemoveFromArray(this.subValue, val.itemValue);
      this.subFilterChanged.emit({col: col, value: newValues});
    }
  }

  isFiltered() {
    return ((this.value && Object.keys(this.value).filter(col => this.value[col].length > 0).length > 0) || (this.subValue && this.subValue.length > 0));
  }


  isOptionFiltered(key: string) {
    return this.value && this.value[key]?.length > 0;
  }


  setSearchTerm($event, key: string) {
    this.searchTerms[key] = $event.target.value;
  }

  closeMenu() {
    this.searchTerms = {};
    this.menuClosed.emit();
  }

  clearSearch(key: string) {
    this.searchTerms[key]='';
    this.setSearchTerm({target:{value:''}}, key)
  }

  getColName(id: string) {
    return this.columns.find(col => col.id === id)?.header || id;
  }
}
