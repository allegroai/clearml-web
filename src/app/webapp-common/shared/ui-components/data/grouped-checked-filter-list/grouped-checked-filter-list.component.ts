import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';

export interface HyperParams<T> {
  [section: string]: any;
}

@Component({
  selector: 'sm-grouped-checked-filter-list',
  templateUrl: './grouped-checked-filter-list.component.html',
  styleUrls: ['./grouped-checked-filter-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupedCheckedFilterListComponent {

  RENAME_MAP = {'_legacy': 'General'};

  public expanded = {};
  public searchText: string;
  public itemsObjectList: HyperParams<{ checked: boolean; value: string }>;
  public selectionLimitReached: boolean;

  @Input() limitSelection = 9999;
  @Input() titleText: string;
  @Input() placeholderText: string;
  private _itemsList: HyperParams<any>;
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

  private getItemsObjectList(itemsList: { [section: string]: { [key: string]: string } }) {
    return Object.entries(itemsList).reduce((acc, [section, params]) => {
      acc[section] = Object.entries(params).map(([paramKey, paramVal]) => ({value: paramKey, checked: this.selectedItemsList.map(item=> item.id).includes(`hyperparams.${section}.${paramKey}`) || false}));
      return acc;
    }, {});
  }

  get itemsList() {
    return this._itemsList;
  }

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

  trackByKeyFn(index, item) {
    return item.key;
  }
  trackByValFn(index, item) {
    return item.value;
  }

  toggleExpand(name) {
    this.expanded[name] = !this.expanded[name];
  }
}
