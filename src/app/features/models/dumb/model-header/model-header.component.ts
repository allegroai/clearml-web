import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector   : 'sm-model-header',
  templateUrl: './model-header.component.html',
  styleUrls  : ['./model-header.component.scss']
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
  @Input() sharedView: boolean;

  @Output() isArchivedChanged    = new EventEmitter<boolean>();
  @Output() addModelClicked = new EventEmitter();
  @Output() refreshListClicked       = new EventEmitter();
  @Output() setAutoRefresh           = new EventEmitter();
  @Output() selectedTableColsChanged = new EventEmitter();



  archivedChanged(value: boolean) {
    this.isArchivedChanged.emit(value);
  }

  onAddModelClicked() {
    this.addModelClicked.emit();
  }

}
