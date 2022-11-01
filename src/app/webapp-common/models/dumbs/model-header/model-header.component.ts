import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {BaseEntityHeaderComponent} from '@common/shared/entity-page/base-entity-header/base-entity-header.component';

@Component({
  selector   : 'sm-model-header',
  templateUrl: './model-header.component.html',
  styleUrls  : ['./model-header.component.scss']
})
export class ModelHeaderComponent extends BaseEntityHeaderComponent {
  private _tableCols: ISmCol[];

  @Input() minimizedView: boolean;
  @Input() tableFilters: { [s: string]: FilterMetadata };
  @Input() set tableCols(tableCols: ISmCol[]) {
    this._tableCols = tableCols?.filter(col => col.header !== '');
  }

  get tableCols() {
    return this._tableCols;
  }
  @Input() sharedView: boolean = false;
  @Input() isArchived: boolean;
  @Input() hideArchiveToggle: boolean;
  @Input() hideCreateNewButton: boolean;
  @Input() disableCreateNewButton: boolean;
  @Input() metadataKeys: string[];
  @Input() isLoadingMetadataKeys: any;
  @Input() tableMode: string;
  @Input() rippleEffect: boolean;
  @Output() isArchivedChanged = new EventEmitter<boolean>();
  @Output() addModelClicked   = new EventEmitter();
  @Output() refreshListClicked       = new EventEmitter();
  @Output() setAutoRefresh           = new EventEmitter();
  @Output() selectedTableColsChanged = new EventEmitter();
  @Output() selectMetadataKeysActiveChanged = new EventEmitter();
  @Output() clearTableFilters        = new EventEmitter<{ [s: string]: FilterMetadata }>();
  @Output() addOrRemoveMetadataKeyFromColumns = new EventEmitter<{key: string; show: boolean}>();
  @Output() tableModeChanged = new EventEmitter<'table' | 'info'>();
  @Output() removeColFromList = new EventEmitter<ISmCol['id']>();

  onIsArchivedChanged(value: boolean) {
    this.isArchivedChanged.emit(value);
  }
}
