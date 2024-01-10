import {Component, Input} from '@angular/core';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'sm-table-card',
  templateUrl: './table-card.component.html',
  styleUrls: ['./table-card.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    NgIf
  ]
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

}
