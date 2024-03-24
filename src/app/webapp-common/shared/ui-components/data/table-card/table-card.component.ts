import {Component, Input, TemplateRef} from '@angular/core';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'sm-table-card',
  templateUrl: './table-card.component.html',
  styleUrls: ['./table-card.component.scss'],
  standalone: true,
  imports: [
    NgTemplateOutlet
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
  @Input() tagsTemplate: TemplateRef<any>;
  @Input() compactColDataTemplate: TemplateRef<any>;

}
