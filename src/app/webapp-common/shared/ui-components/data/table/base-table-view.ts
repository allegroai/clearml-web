import {TableSelectionState} from '../../../../constants';
import {allItemsAreSelected} from '../../../utils/shared-utils';
import {differenceBy, get, unionBy} from 'lodash/fp';
import {EventEmitter, Input, Output} from '@angular/core';
import {TableSortOrderEnum} from './table.consts';

export abstract class BaseTableView {
  public selectionState: TableSelectionState;
  protected entitiesKey: string;
  protected selectedEntitiesKey: string;
  @Input() selectionMode: 'multiple' | 'single' | null = 'single';
  @Input() colsOrder: string[];
  @Input() tableSortField: string;
  @Input() tableSortOrder: TableSortOrderEnum;
  @Input() minimizedView: boolean;

  @Output() onColumnsReordered = new EventEmitter<string[]>();


  updateSelectionState() {
    this.selectionState = allItemsAreSelected(this[this.entitiesKey], this[this.selectedEntitiesKey]) ? 'All' : this[this.selectedEntitiesKey].length > 0 ? 'Partial' : 'None';
  }

  columnsReordered($event: string[]) {
    this.onColumnsReordered.emit($event);
  }


  headerCheckboxClicked() {
    let selectionUnion;
    if (this.selectionState === 'None') {
      selectionUnion = unionBy('id', this[this.entitiesKey], this[this.selectedEntitiesKey]);
    } else {
      selectionUnion = differenceBy('id', this[this.selectedEntitiesKey], this[this.entitiesKey]);
    }
    this.emitSelection(selectionUnion);
  }

  isRowSelected(entity: { id: any }) {
    if (!entity) {
      return false;
    }

    return this[this.selectedEntitiesKey].length > 0 &&
      (this[this.selectedEntitiesKey].some((selectedEntity: { id: any }) => selectedEntity.id === entity.id));
  }

  abstract emitSelection(selection: any[]);
}
