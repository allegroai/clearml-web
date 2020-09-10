import {TableSelectionState} from '../../../../constants';
import {allItemsAreSelected} from '../../../utils/shared-utils';
import {differenceBy, get, unionBy} from 'lodash/fp';
import {AfterViewInit, EventEmitter, Input, Output, QueryList, ViewChildren} from '@angular/core';
import {TableSortOrderEnum} from './table.consts';
import {filter, take} from 'rxjs/operators';
import {TableComponent} from './table.component';

export abstract class BaseTableView  implements AfterViewInit {
  public selectionState: TableSelectionState;
  protected entitiesKey: string;
  public selectedEntitiesKey: string;
  public contextMenuActive: boolean;
  public table: TableComponent;

  @Input() selectionMode: 'multiple' | 'single' | null = 'single';
  @Input() colsOrder: string[];
  @Input() tableSortField: string;
  @Input() tableSortOrder: TableSortOrderEnum;
  @Input() minimizedView: boolean;

  @Output() onColumnsReordered = new EventEmitter<string[]>();
  @ViewChildren('table') tables: QueryList<TableComponent>;

  ngAfterViewInit(): void {
    this.tables.changes
      .pipe(filter((comps: QueryList<TableComponent>) => !!comps.first), take(1))
      .subscribe((comps: QueryList<TableComponent>) => {
        this.table = comps.first;
        window.setTimeout(() => this.table.focusSelected());
        this.afterTableInit();
      });
  }

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
    if (!entity || this[this.selectedEntitiesKey]===undefined) {
      return false;
    }

    return this[this.selectedEntitiesKey].length > 0 &&
      (this[this.selectedEntitiesKey].some((selectedEntity: { id: any }) => selectedEntity.id === entity.id));
  }
  setContextMenuStatus(menuStatus: boolean) {
    this.contextMenuActive = menuStatus;
  }

  abstract emitSelection(selection: any[]);

  abstract afterTableInit(): void;
}
