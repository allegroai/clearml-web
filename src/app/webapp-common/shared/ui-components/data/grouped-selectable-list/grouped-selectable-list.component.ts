import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {SelectableListItem} from './grouped-selectable-list.model';
import {GroupedList} from '../selectable-grouped-filter-list/selectable-grouped-filter-list.component';
import {MatExpansionPanelHeader} from '@angular/material/expansion';


interface GroupItem {
  data: GroupedVisibleList;
  visible: boolean;
  hasChildren: boolean;
}

export interface GroupedVisibleList {
  [metric: string]: GroupItem;
}

@Component({
  selector: 'sm-grouped-selectable-list',
  templateUrl: './grouped-selectable-list.component.html',
  styleUrls: ['./grouped-selectable-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupedSelectableListComponent implements OnChanges {
  private _list: GroupedList;
  public showList: GroupedVisibleList;
  expanded = {};

  checkIcon: string[] = ['fa-eye', 'fa-eye-slash'];
  @Input() searchTerm: string;

  @Input() set list(list) {
    this._list = list;
    if (!this.searchTerm || this.isFlatList()) {
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
  // @Input() checkIcon: string[] = ['fa-eye', 'fa-eye-slash'];
  @Output() onItemSelect = new EventEmitter<string>();
  @Output() onItemCheck = new EventEmitter<{ pathString: string; parent: string }>();
  @Output() onGroupCheck = new EventEmitter<any>();

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.list || changes.checkedList && this.list && this.checkedList)) {
      this.showList = this.buildingNestedList();
      this.cdr.detectChanges();
    }
  }

  private buildingNestedList() {
    return Object.entries(this.list).reduce((acc, [parent, children]) => {
      acc[parent] = {
        data: Object.keys(children).reduce((acc2, child) => {
          acc2[child] = {data: children[child], visible: this.checkedList.includes(parent + child)};
          return acc2;
        }, {}),
        visible: this.checkedList.includes(parent),
        hasChildren: Object.keys(children).length > 0
      };
      return acc;
    }, {}) as GroupedVisibleList;
  }

  public toggleExpandedAll(open) {
    Object.keys(this.list).forEach(key => {
      this.expanded[key] = open;
    });
  }

  isHideAllMode(parent: GroupItem) {
    const children = Object.values(parent.data);
    return parent.hasChildren ? children.every(itemKey => itemKey.visible) : parent.visible;
  }

  trackByFn(index, item: {key: string; value: GroupItem}) {
    return index + item.key + item.value.hasChildren;
  }

  groupCheck(item: { key: string; value: GroupItem}) {
    this.onGroupCheck.emit({key: item.key, hide: !this.isHideAllMode(item.value)});
  }

  selectedItem(item: { key: string; value: GroupItem}, panelH: MatExpansionPanelHeader) {
    if (!item.value.hasChildren) {
      this.onItemSelect.emit(item.key);
      panelH._toggle();
    }
  }

  private isFlatList() {
    return Object.values(this.showList).every(item => !item.hasChildren);
  }
}
