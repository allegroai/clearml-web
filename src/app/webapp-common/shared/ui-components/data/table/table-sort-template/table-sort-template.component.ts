import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TableSortOrderEnum, TABLE_SORT_ORDER} from '../table.consts';

@Component({
  selector: 'sm-table-sort-template',
  templateUrl: './table-sort-template.component.html',
  styleUrls: ['./table-sort-template.component.scss']
})
export class TableSortTemplateComponent implements OnInit {

  public readonly TABLE_SORT_ORDER = TABLE_SORT_ORDER;

  @Input() sortOrder: TableSortOrderEnum | boolean;
  @Input() header: string;
  @Input() tooltip: boolean;
  @Output() sortOrderChanged = new EventEmitter<TableSortOrderEnum>();

  constructor() { }

  ngOnInit() {
  }

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
}
