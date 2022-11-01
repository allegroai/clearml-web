import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';

@Component({
  selector: 'sm-model-custom-cols-menu',
  templateUrl: './model-custom-cols-menu.component.html',
  styleUrls: ['./model-custom-cols-menu.component.scss']
})
export class ModelCustomColsMenuComponent{
  @Input() tableCols: ISmCol[];
  @Input() isLoading: boolean;
  @Input() disabled: boolean;
  @Input() metadataKeys: string[];
  @Output() removeColFromList = new EventEmitter<ISmCol['id']>();
  @Output() selectedTableColsChanged = new EventEmitter();
  @Output() selectMetadataKeysActiveChanged = new EventEmitter();
  @Output() addOrRemoveMetadataKeyFromColumns = new EventEmitter<{key: string; show: boolean }>();

  customColumnMode: string;

  selectMetadataKeys(metadata: string) {
    this.selectMetadataKeysActiveChanged.emit();
    this.customColumnMode = metadata;
  }

  setCustomColumnMode(param) {
    this.customColumnMode = param;
  }


}
