import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';

@Component({
  selector: 'sm-model-header',
  templateUrl: './model-header.component.html',
  styleUrls: ['./model-header.component.scss']
})
export class ModelHeaderComponent {
  private _tableCols: any;
  @Input() minimizedView: boolean;

  @Input() set tableCols(tableCols) {
    this._tableCols = tableCols.filter(col => col.header !== '');
  }

  get tableCols() {
    return this._tableCols;
  }

  @Input() isArchived: boolean;
  @Input() hideArchiveToggle: boolean;
  @Input() hideCreateNewButton: boolean;
  @Input() disableCreateNewButton: boolean;
  @Input() autoRefreshState: boolean;
  @Input() metadataKeys: string[];
  @Input() isLoadingMetadataKeys: any;
  @Input() sharedView: boolean;
  @Input() tableFilters: { [s: string]: FilterMetadata };

  @Output() isArchivedChanged = new EventEmitter<boolean>();
  @Output() addModelClicked = new EventEmitter();
  @Output() refreshListClicked = new EventEmitter();
  @Output() setAutoRefresh = new EventEmitter();
  @Output() selectedTableColsChanged = new EventEmitter();
  @Output() clearTableFilters = new EventEmitter<{ [s: string]: FilterMetadata }>();
  @Output() selectMetadataKeysActiveChanged = new EventEmitter();
  @Output() addOrRemoveMetadataKeyFromColumns = new EventEmitter<{ key: string; show: boolean }>();
  @Output() removeColFromList = new EventEmitter<ISmCol['id']>();


  archivedChanged(value: boolean) {
    this.isArchivedChanged.emit(value);
  }

  onAddModelClicked() {
    this.addModelClicked.emit();
  }

}
