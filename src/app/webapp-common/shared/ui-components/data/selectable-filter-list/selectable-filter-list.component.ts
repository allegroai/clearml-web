import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {SelectableListItem} from '../selectable-list/selectable-list.model';

@Component({
  selector       : 'sm-selectable-filter-list',
  templateUrl    : './selectable-filter-list.component.html',
  styleUrls      : ['./selectable-filter-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectableFilterListComponent {
  private _searchTerm: string;
  private _list: Array<SelectableListItem>;
  public filteredList: SelectableListItem[];
  public searchText: string;

  @Input() set searchTerm(searchTerm: string) {
    this.filteredList = this.list ? this.filterList(this.list, searchTerm) : [];
    this._searchTerm  = searchTerm;
  }

  get searchTerm() {
    return this._searchTerm;
  }

  @Input() checkedList: Array<any> = [];
  @Input() selected: string;
  @Input() placeholder: string = 'Search';
  @Input() titleLabel: string;
  @Input() checkAllIcon: string;
  @Output() itemSelect             = new EventEmitter<string>();
  @Output() hiddenChanged          = new EventEmitter<Array<SelectableListItem['value']>>();
  @Output() searchTermChanged      = new EventEmitter<string>();

  @Input() set list(list: Array<SelectableListItem>) {
    this._list        = list;
    this.filteredList = this.filterList(list, this.searchTerm);
  }

  get list() {
    return this._list;
  }

  filterList(list, searchTerm): Array<SelectableListItem> {
    if (!searchTerm || searchTerm === '') {
      return list.slice();
    } else {
      return list.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
  }

  onSearchTermChanged(value: string) {
    this.searchText = value;
    this.searchTermChanged.emit(value);
  }

  public toggleHide(id) {
    const newHiddenList = this.checkedList.includes(id) ? this.checkedList.filter(i => i !== id) : [...this.checkedList, id];
    this.hiddenChanged.emit(newHiddenList);
  }

  toggleHideAll() {
    if (this.checkedList.length > 0) {
      this.hiddenChanged.emit([]);

    } else {
      const allValues = this.list.map((i) => i.value);
      this.hiddenChanged.emit(allValues);
    }
  }

}
