import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'sm-checked-filter-list',
  templateUrl: './checked-filter-list.component.html',
  styleUrls: ['./checked-filter-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckedFilterListComponent {

  public searchText: string;
  public itemsObjectList: { checked: boolean; value: string }[];

  @Input() limitSelection = 9999;
  @Input() titleText: string;
  @Input() placeholderText: string;
  private _selectedItemsList: string[];
  private _itemsList: string[];

  @Input() set selectedItemsList(selectedItemsList: string[]) {
    this._selectedItemsList = selectedItemsList;
    if (selectedItemsList && this.itemsList) {
      this.itemsObjectList = this.itemsList.map(item => ({value: item, checked: selectedItemsList.includes(item)}));
    }
  }

  get selectedItemsList() {
    return this._selectedItemsList;
  }

  @Input() filterItemsLabel: string;
  @Input() selectFilteredItems: boolean;

  @Input() set itemsList(itemsList: string[]) {
    this._itemsList = itemsList;
    if (this.selectedItemsList && itemsList) {
      this.itemsObjectList = itemsList && itemsList.map(item => ({value: item, checked: this.selectedItemsList.includes(item)}));
    }
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

  trackByFn(index: number, item) {
    return item.value;
  }
}
