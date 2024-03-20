import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {compareByFieldFunc} from '@common/tasks/tasks.utils';
import {SearchComponent} from '@common/shared/ui-components/inputs/search/search.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {KeyValuePipe, NgForOf, NgIf} from '@angular/common';
import {AdvancedFilterPipe} from '@common/shared/pipes/advanced-filter.pipe';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {FilterPipe} from '@common/shared/pipes/filter.pipe';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {
  ShowTooltipIfEllipsisDirective
} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';

export type HyperParams<T> = ReadonlyMap<string, T[]>;

@Component({
  selector: 'sm-grouped-checked-filter-list',
  templateUrl: './grouped-checked-filter-list.component.html',
  styleUrls: ['./grouped-checked-filter-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    SearchComponent,
    MatExpansionModule,
    NgForOf,
    KeyValuePipe,
    AdvancedFilterPipe,
    TooltipDirective,
    FilterPipe,
    MatCheckboxModule,
    MatRadioModule,
    NgIf,
    ClickStopPropagationDirective,
    ShowTooltipIfEllipsisDirective,
  ]
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
  @Input() single = false;

  @Input() selectedItemsListMapper = (data) => decodeURIComponent(data.id);
  @Input() selectedItemsListPrefix = 'hyperparams.';
  private _itemsList;
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

  @Input() set itemsList(itemsList: { [section: string]: any }) {
    this._itemsList = itemsList;
    if (this.selectedItemsList && itemsList) {
      this.itemsObjectList = this.getItemsObjectList(itemsList);
    }
  }

  get itemsList() {
    return this._itemsList;
  }

  private getItemsObjectList = (itemsList: { [section: string]: any }) =>
    Object.entries(itemsList).reduce((acc, [section, params]) => {
      acc[section] = Object.entries(params).map(([paramKey,]) => {
        const search = `${this.selectedItemsListPrefix}${section}.${paramKey}`;
        return {
          value: paramKey,
          checked: this.selectedItemsList.map(this.selectedItemsListMapper).includes(search)
        };
      });
      return acc;

    }, {}) as HyperParams<{ checked: boolean; value: string }>;

  @Output() selectedItems = new EventEmitter<{ param: string; value: any }>();
  @Output() clearSelection = new EventEmitter();
  @Output() hideFilteredItems = new EventEmitter();

  constructor(private changeDetectorRef: ChangeDetectorRef) {
  }

  public toggleParamToDisplay(category: string, param: string, value: boolean) {
    this.selectedItems.emit({value,
      param: `${category.replaceAll('.', '%2E')}.${param?.replaceAll('.', '%2E')}`
    });
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

  protected readonly Object = Object;
}
