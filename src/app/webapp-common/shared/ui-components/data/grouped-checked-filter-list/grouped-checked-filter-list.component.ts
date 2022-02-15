import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {compareByFieldFunc} from '@common/tasks/tasks.utils';

export type HyperParams<T> = ReadonlyMap<string, T[]>;

@Component({
  selector: 'sm-grouped-checked-filter-list',
  templateUrl: './grouped-checked-filter-list.component.html',
  styleUrls: ['./grouped-checked-filter-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupedCheckedFilterListComponent {

  renameMap = {_legacy: 'General'};

  public expanded = {};
  public searchText: string;
  public itemsObjectList: HyperParams<{ checked: boolean; value: string }>;
  public selectionLimitReached: boolean;

  @Input() limitSelection = 9999;
  @Input() titleText: string;
  @Input() placeholderText: string;
  @Input() selectedItemsListMapper = (data) => data.id;
  @Input() selectedItemsListPrefix = 'hyperparams.';
  private _itemsList: { [section: string]: { [key: string]: any } };
  private _selectedItemsList: string[];

  @Input() set selectedItemsList(selectedItemsList: any[]) {
    this._selectedItemsList = selectedItemsList;
    if (selectedItemsList && this.itemsList) {
      this.itemsObjectList = this.getItemsObjectList(this.itemsList);
    }
    this.selectionLimitReached = selectedItemsList && (Object.values(selectedItemsList) as any).flat().length >= this.limitSelection;
  }

  get selectedItemsList() {
    return this._selectedItemsList;
  }

  @Input() filterItemsLabel: string;
  @Input() selectFilteredItems: boolean;

  @Input() set itemsList(itemsList: { [section: string]: { [key: string]: any } }) {
    this._itemsList = itemsList;
    if (this.selectedItemsList && itemsList) {
      this.itemsObjectList = this.getItemsObjectList(itemsList);
    }
  }

  get itemsList() {
    return this._itemsList;
  }

  private getItemsObjectList = (itemsList: { [section: string]: { [key: string]: string } }) =>
    Object.entries(itemsList).reduce((acc, [section, params]) => ({
          ...acc,
          [section]: Object.entries(params).map(([paramKey,]) => ({
              value: paramKey,
              checked: this.selectedItemsList.map(this.selectedItemsListMapper).includes(`${this.selectedItemsListPrefix}${section}.${paramKey}`)
            }))
        })
      , {}) as HyperParams<{ checked: boolean; value: string }>;

  @Output() selectedItems = new EventEmitter<{ param: string; value: any }>();
  @Output() clearSelection = new EventEmitter();
  @Output() hideFilteredItems = new EventEmitter();

  constructor(private changeDetectorRef: ChangeDetectorRef) {
  }

  public toggleParamToDisplay(param, value) {
    this.selectedItems.emit({param, value});
  }

  public searchQ(value) {
    this.searchText = value;
    this.changeDetectorRef.detectChanges();

  }

  onClearSelection() {
    this.clearSelection.emit();
  }

  trackByKeyFn = (index, item) => item.key;

  trackByValFn = (index, item) => item.value;

  compareByKey = compareByFieldFunc('key');

  toggleExpand(name) {
    this.expanded[name] = !this.expanded[name];
  }
}
