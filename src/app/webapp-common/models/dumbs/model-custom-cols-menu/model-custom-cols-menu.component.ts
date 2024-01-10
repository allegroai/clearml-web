import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {CustomColumnMode} from '@common/experiments/shared/common-experiments.const';
import {
  SelectionEvent
} from '@common/experiments/dumb/select-metric-for-custom-col/select-metric-for-custom-col.component';

@Component({
  selector: 'sm-model-custom-cols-menu',
  templateUrl: './model-custom-cols-menu.component.html',
  styleUrls: ['./model-custom-cols-menu.component.scss']
})
export class ModelCustomColsMenuComponent {
  protected readonly customColumnModeEnum = CustomColumnMode;
  public customColumnMode: CustomColumnMode = CustomColumnMode.Standard;

  @Input() tableCols: ISmCol[];
  @Input() isLoading: boolean;
  @Input() disabled: boolean;
  @Input() metadataKeys: string[];
  @Input() metricVariants;
  @Input() skipValueType = false;
  @Output() removeColFromList = new EventEmitter<ISmCol['id']>();
  @Output() selectedTableColsChanged = new EventEmitter();
  @Output() selectMetadataKeysActiveChanged = new EventEmitter<{ customMode: CustomColumnMode }>();
  @Output() addOrRemoveMetadataKeyFromColumns = new EventEmitter<{ key: string; show: boolean }>();
  @Output() selectedMetricToShow = new EventEmitter<SelectionEvent>();

  selectMetadataKeys(mode: CustomColumnMode) {
    this.selectMetadataKeysActiveChanged.emit({customMode: mode});
    this.customColumnMode = mode;
  }

  setCustomColumnMode(param) {
    this.customColumnMode = param;
  }
}
