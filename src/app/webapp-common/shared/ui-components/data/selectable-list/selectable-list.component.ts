import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {SelectableListItem} from './selectable-list.model';

@Component({
  selector       : 'sm-selectable-list',
  templateUrl    : './selectable-list.component.html',
  styleUrls      : ['./selectable-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectableListComponent {
  @Input() list: Array<SelectableListItem> = [];
  @Input() checkedList: Array<SelectableListItem>;
  @Input() selected: SelectableListItem['value'];
  @Input() checkIcon: string               = 'fa-eye';
  @Output() onItemSelect                   = new EventEmitter<string>();
  @Output() onItemCheck                    = new EventEmitter<string>();

}
