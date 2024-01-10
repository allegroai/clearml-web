import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {MatExpansionModule, MatExpansionPanelHeader} from '@angular/material/expansion';

import {GroupedList} from '@common/tasks/tasks.model';
import {KeyValuePipe, NgForOf} from '@angular/common';
import {SortPipe} from '@common/shared/pipes/sort.pipe';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';


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
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatExpansionModule,
    NgForOf,
    KeyValuePipe,
    SortPipe,
    TooltipDirective,
    ShowTooltipIfEllipsisDirective
  ]
})
export class GroupedSelectableListComponent implements OnChanges {
  private _list: GroupedList;
  public showList: GroupedVisibleList;
  expanded = {};

  checkIcon: string[] = ['al-ico-show', 'al-ico-hide'];
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

  @Input() checkedList: Array<string>;
  @Output() itemSelect = new EventEmitter<string>();
  @Output() itemCheck = new EventEmitter<{ pathString: string; parent: string }>();
  @Output() groupChecked = new EventEmitter<{key: string; hide: boolean}>();

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (((changes.list || changes.checkedList) && this.list && this.checkedList)) {
      this.showList = this.buildingNestedList();
      this.cdr.markForCheck();
    }
  }

  private buildingNestedList() {
    return Object.entries(this.list).reduce((acc, [parent, children]) => {
      acc[parent] = {
        data: Object.keys(children).reduce((acc2, child) => {
          acc2[child] = {data: children[child], visible: this.checkedList.includes(parent + child)};
          return acc2;
        }, {}),
        visible: this.checkedList.some( item => item.startsWith(parent)),
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
    return parent.hasChildren ? children.some(itemKey => itemKey.visible) : parent.visible;
  }

  trackByFn = (index, item) => index + item.key + item.value.hasChildren;

  groupCheck(item: { key: string; value: GroupItem}) {
    this.groupChecked.emit({key: item.key, hide: !this.isHideAllMode(item.value)});
  }

  selectedItem(item: { key: string; value: GroupItem}, panelH: MatExpansionPanelHeader) {
    if (!item.value.hasChildren) {
      this.itemSelect.emit(item.key);
      panelH._toggle();
    }
  }

  private isFlatList() {
    return Object.values(this.showList).every(item => !item.hasChildren);
  }
}
