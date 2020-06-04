import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {SelectableListItem} from './grouped-selectable-list.model';

@Component({
  selector       : 'sm-grouped-selectable-list',
  templateUrl    : './grouped-selectable-list.component.html',
  styleUrls      : ['./grouped-selectable-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupedSelectableListComponent {
  private _list: any;
  expanded = {};

  @Input() searchTerm: string;

  @Input() set list(list) {
    this._list = list;
    if (!this.searchTerm) {
      this.toggleExpandedAll(false);
    } else {
      this.toggleExpandedAll(true);
    }
  }

  get list() {
    return this._list;
  }

  @Input() checkedList: Array<any>;
  @Input() selected: SelectableListItem['value'];
  @Input() checkIcon: string = 'fa-eye';
  @Output() onItemSelect     = new EventEmitter<string>();
  @Output() onItemCheck      = new EventEmitter<string>();
  @Output() onGroupCheck     = new EventEmitter<any>();

  public toggleExpandedAll(open) {
    Object.keys(this.list).forEach(key => {
      this.expanded[key] = open;
    });
  }

  isHideAllMode(item: any) {
    return Object.keys(item.value).every(itemKey => {
      return this.checkedList.includes(item.key + itemKey);
    });
  }
}
