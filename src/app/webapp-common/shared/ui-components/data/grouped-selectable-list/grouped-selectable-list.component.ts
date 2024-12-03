import {ChangeDetectionStrategy, Component, effect, EventEmitter, input, Output} from '@angular/core';

import {GroupedList} from '@common/tasks/tasks.model';
import {JsonPipe, KeyValuePipe, NgForOf} from '@angular/common';
import {SortPipe} from '@common/shared/pipes/sort.pipe';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';
import {MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule} from '@angular/material/tree';
import {FlatTreeControl} from '@angular/cdk/tree';
import {ArrayIncludedInArrayPipe} from '@common/shared/pipes/array-starts-with-in-array.pipe';
import {StringIncludedInArrayPipe} from '@common/shared/pipes/string-included-in-array.pipe';
import {StringStartsWithInArrayPipe} from '@common/shared/pipes/string-starts-with-in-array.pipe';


interface GroupItem {
  data: GroupItem;
  name: string;
  hasChildren: boolean;
  children: string[];
  parent: string;
  lastChild: boolean;
}

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  parent: string;
  level: number;
  lastChild: boolean;
  children: string[];
}


@Component({
  selector: 'sm-grouped-selectable-list',
  templateUrl: './grouped-selectable-list.component.html',
  styleUrls: ['./grouped-selectable-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgForOf,
    KeyValuePipe,
    SortPipe,
    TooltipDirective,
    ShowTooltipIfEllipsisDirective,
    MatTreeModule,
    JsonPipe,
    ArrayIncludedInArrayPipe,
    StringIncludedInArrayPipe,
    StringStartsWithInArrayPipe
  ]
})
export class GroupedSelectableListComponent {

  checkIcon: string[] = ['al-ico-show', 'al-ico-hide'];
  searchTerm = input<string>();
  list = input<GroupedList>();
  checkedList = input<string[]>();

  @Output() itemSelect = new EventEmitter<string>();
  @Output() itemCheck = new EventEmitter<{ pathString: string; parent: string }>();
  @Output() groupChecked = new EventEmitter<{ key: string; hide: boolean }>();

  private _transformer = (node: GroupItem, level: number) => {
    return {
      expandable: node.hasChildren,
      name: node.name,
      parent: node.parent,
      children: node.children,
      lastChild: node.lastChild,
      level: level,
    };
  };

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => Object.values(node.data)
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  constructor() {
    effect(() => {
      if (this.list()) {
        this.dataSource.data = this.buildingNestedList();
      }
    });

    effect(() => {
      if (this.searchTerm()) {
        this.treeControl.expandAll();
      } else {
        this.treeControl.collapseAll();
      }
    });
  }

  private buildingNestedList() {
    return Object.entries(this.list()).map(([parent, children]) => ({
      data: Object.keys(children).reduce((acc, child, i) => {
        acc[child] = {
          name: child,
          parent,
          data: children[child],
          hasChildren: false,
          lastChild: Object.keys(children).length - 1 === i,
          children: []
        };
        return acc;
      }, {} as GroupItem),
      name: parent,
      parent: '',
      hasChildren: Object.keys(children).length > 0,
      children: [parent, ...Object.keys(children).map(child => parent + child)]
    }) as GroupItem);
  }

  isHideAllMode(parent: ExampleFlatNode) {
    const children = this.treeControl.dataNodes.filter(a => a.parent === parent.name);
    return parent.expandable ? children.some(child => this.checkedList().includes(parent.name + child.name)) : this.checkedList().includes(parent.name);
  }

  groupCheck(node: ExampleFlatNode) {
    this.groupChecked.emit({key: node.name, hide: !this.isHideAllMode(node)});
  }
}
