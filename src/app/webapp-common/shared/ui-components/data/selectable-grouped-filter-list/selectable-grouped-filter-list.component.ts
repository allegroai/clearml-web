import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {SelectableListItem} from '../selectable-list/selectable-list.model';


@Component({
  selector       : 'sm-selectable-grouped-filter-list',
  templateUrl    : './selectable-grouped-filter-list.component.html',
  styleUrls      : ['./selectable-grouped-filter-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectableGroupedFilterListComponent {
  private _searchTerm: string;
  private _list: Array<SelectableListItem>;
  public filteredList: SelectableListItem[];

  @Input() set list(list: Array<any>) {
    this._list        = list;
    this.filteredList = this.filterList(list, this.searchTerm);
  }

  get list() {
    return this._list;
  }

  @Input() set searchTerm(searchTerm: string) {
    this.filteredList = this.list ? this.filterList(this.list, searchTerm) : [];
    this._searchTerm  = searchTerm;
  }

  get searchTerm() {
    return this._searchTerm;
  }

  @Input() checkedList: Array<any> = [];
  @Input() selected: string;
  @Input() titleLabel: string;
  @Input() checkAllIcon: string;
  @Output() itemSelect             = new EventEmitter<SelectableListItem>();
  @Output() hiddenChanged          = new EventEmitter<any>();
  @Output() searchTermChanged      = new EventEmitter<string>();


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

  onSearchTermChanged(searchTerm) {
    this.searchTermChanged.emit(searchTerm);
  }

  public toggleHide(pathString) {
    const newHiddenList = this.checkedList.includes(pathString) ? this.checkedList.filter(i => i !== pathString) : [...this.checkedList, pathString];
    this.hiddenChanged.emit(newHiddenList);
  }

  toggleHideAll() {
    if (Object.keys(this.checkedList).length > 0) {
      this.hiddenChanged.emit([]);
    } else {
      const allValues = [];
      Object.keys(this.list).forEach(key => {
        Object.keys(this.list[key]).forEach(itemKey => {
          allValues.push(key + itemKey);
        });
      });
      this.hiddenChanged.emit(allValues);
    }
  }

  toggleHideGroup(event) {
    const key     = event.key;
    let allValues = [...this.checkedList];
    if (event.hide) {
      Object.keys(this.list[key]).forEach(itemKey => {
        const keyItemKey = key + itemKey;
        if (!allValues.includes(keyItemKey)) {
          allValues.push(keyItemKey);
        }
      });
    } else {
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
