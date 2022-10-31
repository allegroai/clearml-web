import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ISmCol} from '../../ui-components/data/table/table.consts';

@Component({
  selector: 'sm-select-metadata-keys-custom-cols',
  templateUrl: './select-metadata-keys-custom-cols.component.html',
  styleUrls: ['./select-metadata-keys-custom-cols.component.scss']
})
export class SelectMetadataKeysCustomColsComponent {
  searchText: string;
  @Input() metadataKeys: string[];
  metadataColsIds: string[];

  @Input() set tableCols(cols: ISmCol[]) {
    this.metadataColsIds = cols.filter(col => col.type === 'metadata' || col.type==='hdmd').map(col => col.key);
  };

  @Output() addOrRemoveMetadataKeyFromColumns = new EventEmitter<{ key: string, show: boolean }>();
  @Output() goBack = new EventEmitter();


  constructor() {
  }

  searchQ(search: string) {
    this.searchText = search;
  }


}
