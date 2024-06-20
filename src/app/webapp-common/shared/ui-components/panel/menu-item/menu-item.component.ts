import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TABLE_SORT_ORDER} from '../../data/table/table.consts';
import {CheckboxControlComponent} from '@common/shared/ui-components/forms/checkbox-control/checkbox-control.component';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import { NgClass } from '@angular/common';
import {MatMenuModule} from '@angular/material/menu';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';

@Component({
  selector: 'sm-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss'],
  imports: [
    CheckboxControlComponent,
    TooltipDirective,
    NgClass,
    MatMenuModule,
    ShowTooltipIfEllipsisDirective
],
  standalone: true
})
export class MenuItemComponent {
  @Input() removable: boolean = false;
  @Input() disabled: boolean = false;
  @Input() itemLabel: string;
  @Input() itemValue: string;
  @Input() itemTooltip: string;
  @Input() iconClass: string = '';
  @Input() enableIcon: boolean = true;
  @Input() selectable: boolean = false;
  @Input() checked: boolean = false;
  @Input() sortOrder: number;
  @Input() enableTooltip: boolean;
  @Output() itemClicked = new EventEmitter<{ event?: MouseEvent; itemValue: string }>();
  @Output() removeItemClicked = new EventEmitter();
  @Output() closeMenu = new EventEmitter();

  public TABLE_SORT_ORDER = TABLE_SORT_ORDER;

  itemClickedEvent(event?: MouseEvent) {
    if (!this.disabled) {
      this.itemClicked.emit({event, itemValue: this.itemValue});
    }
  }

  buttonClickedEvent(event: MouseEvent) {
    this.itemClickedEvent(event);
    if (this.selectable) {
      event.stopPropagation();
    }
  }

  removeItem(event: MouseEvent) {
    this.removeItemClicked.emit(this.itemValue);
    event.stopPropagation();
  }

}
