import {Component, Input} from '@angular/core';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';

@Component({
  selector   : 'sm-table-card',
  templateUrl: './table-card.component.html',
  styleUrls  : ['./table-card.component.scss']
})
export class TableCardComponent {

  public hasTypeIcon: boolean;

  @Input() columns;
  @Input() cardName;
  @Input() rowData;
  @Input() activeContextRow;
  @Input() contextMenuOpen;
  @Input() set entityType(entityType: EntityTypeEnum) {
    this.hasTypeIcon = entityType === EntityTypeEnum.experiment;
  }

  @Input() selected;
  @Input() checked: boolean;

  constructor() {
  }

}
