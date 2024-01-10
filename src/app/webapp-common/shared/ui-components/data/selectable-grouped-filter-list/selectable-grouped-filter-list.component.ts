import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {isEqual} from 'lodash-es';
import {GroupedList} from '@common/tasks/tasks.model';
import {MetricVariantResult} from '~/business-logic/model/projects/metricVariantResult';
import {SearchComponent} from '@common/shared/ui-components/inputs/search/search.component';
import {
  GroupedSelectableListComponent
} from '@common/shared/ui-components/data/grouped-selectable-list/grouped-selectable-list.component';


export const buildMetricsList = (metrics: MetricVariantResult[]): GroupedList => {
  return metrics.reduce((acc, curr) => {
    const currMetric = curr.metric;
    if (acc[currMetric]) {
      acc[currMetric][curr.variant] = {};
    } else {
      acc[currMetric] = {[curr.variant]: {}};
    }
    return acc;
  }, {} as {[metric: string]: {[variant: string]: any}});

}

@Component({
  selector: 'sm-selectable-grouped-filter-list',
  templateUrl: './selectable-grouped-filter-list.component.html',
  styleUrls: ['./selectable-grouped-filter-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    SearchComponent,
    GroupedSelectableListComponent
  ]
})
export class SelectableGroupedFilterListComponent {
  private _searchTerm: string;
  private _list: GroupedList;
  public filteredList: GroupedList;
  public searchText: string;

  @Input() set list(list: GroupedList) {
    if (!isEqual(this._list, list)) {
      this.hideChildrenForHiddenParent(list);
    }
    this._list = list;
    this.filteredList = this.filterList(list, this.searchTerm);
  }

  get list() {
    return this._list;
  }

  @Input() set searchTerm(searchTerm: string) {
    this.filteredList = this.list ? this.filterList(this.list, searchTerm) : [];
    this._searchTerm = searchTerm;
  }

  get searchTerm() {
    return this._searchTerm;
  }

  @Input() checkedList: Array<any> = [];
  @Input() titleLabel: string;
  @Input() checkAllIcon: string;
  @Output() itemSelect = new EventEmitter<string>();
  @Output() hiddenChanged = new EventEmitter<string[]>();
  @Output() searchTermChanged = new EventEmitter<string>();


  filterList(list, searchTerm) {
    if (!searchTerm || searchTerm === '') {
      return list;
    } else {
      const filtered = {};
      Object.keys(list).forEach(key => {
        if (key.toLowerCase().includes(searchTerm.toLowerCase())) {
          filtered[key] = list[key];
        } else {
          const subFiltered = {};
          Object.keys(list[key]).forEach(subKey => {
            if (subKey.toLowerCase().includes((searchTerm).toLowerCase())) {
              subFiltered[subKey] = list[key][subKey];
            }
          });
          if (Object.keys(subFiltered).length > 0) {
            filtered[key] = subFiltered;
          }
        }
      });
      return filtered;
    }
  }

  private hideChildrenForHiddenParent(list: GroupedList) {
    const newHiddenList = this.checkedList ? [...this.checkedList] : [];
    let hiddenListChanged = false;
    Object.entries(list).forEach(([parent, children]) => {
      if (this.checkedList?.includes(parent) && Object.keys(children).length > 0) {
        hiddenListChanged = true;
        Array.prototype.push.apply(newHiddenList, (Object.keys(children).map(child => parent + child)));
      }
    });
    if (hiddenListChanged) {
      this.hiddenChanged.emit(Array.from(new Set(newHiddenList)));
    }
  }

  onSearchTermChanged(value: string) {
    this.searchText = value;
    this.searchTermChanged.emit(value);
  }

  public toggleHide({pathString, parent}) {
    let newHiddenList = this.checkedList.includes(pathString) ? this.checkedList.filter(i => i !== pathString) : [...this.checkedList, pathString];
    newHiddenList = this.AreAllChildrenHidden(parent, newHiddenList) ? [...newHiddenList, parent] : newHiddenList.filter(i => i !== parent);
    this.hiddenChanged.emit(newHiddenList);
  }

  private AreAllChildrenHidden(parent, newHiddenList: any[]) {
    return Object.keys(this.list[parent]).every(item => newHiddenList.includes(parent + item));
  }

  toggleHideAll() {
    if (Object.keys(this.checkedList).length > 0) {
      this.hiddenChanged.emit([]);
    } else {
      const allValues = [];
      Object.keys(this.list).forEach(key => {
        allValues.push(key);
        Object.keys(this.list[key]).forEach(itemKey => {
          allValues.push(key + itemKey);
        });
      });
      this.hiddenChanged.emit(allValues);
    }
  }

  toggleHideGroup(event) {
    const key = event.key;
    let allValues = [...this.checkedList];
    if (event.hide) {
      allValues = !allValues.includes(key) ? [...allValues, key] : allValues;
      Object.keys(this.list[key]).forEach(itemKey => {
        const keyItemKey = key + itemKey;
        if (!allValues.includes(keyItemKey)) {
          allValues.push(keyItemKey);
        }
      });
    } else {
      allValues = allValues.filter(i => !i.startsWith(key));
      Object.keys(this.list[key]).forEach(itemKey => {
        const keyItemKey = key + itemKey;
        if (allValues.includes(keyItemKey)) {
          allValues = allValues.filter(longKey => longKey !== (keyItemKey));
        }
      });
    }
    this.hiddenChanged.emit(allValues);
  }
}
