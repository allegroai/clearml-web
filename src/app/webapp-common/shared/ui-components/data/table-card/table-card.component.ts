import {Component, Input} from '@angular/core';
import {get} from 'lodash/fp';

@Component({
  selector   : 'sm-table-card',
  templateUrl: './table-card.component.html',
  styleUrls  : ['./table-card.component.scss']
})
export class TableCardComponent {
  public odd: boolean;
  @Input() columns;
  @Input() cardName;
  @Input() rowData;
  @Input() activeContextRow;
  @Input() contextMenuOpen;


  @Input() set rowNumber(rowNumber) {
    this.odd = rowNumber % 2 === 1;
  }

  @Input() selected;
  @Input() checked: boolean;

  constructor() {
  }

  _get(selector, obj) {
    return get(selector, obj);
  }

  getValueFromRow(row) {
    return get(row.id, this.rowData);
  }
}
