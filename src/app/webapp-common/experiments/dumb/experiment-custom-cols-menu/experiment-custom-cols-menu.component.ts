import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {CustomColumnMode} from '../../shared/common-experiments.const';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {
  SelectionEvent
} from '@common/experiments/dumb/select-metric-for-custom-col/select-metric-for-custom-col.component';

@Component({
  selector: 'sm-experiment-custom-cols-menu',
  templateUrl: './experiment-custom-cols-menu.component.html',
  styleUrls: ['./experiment-custom-cols-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentCustomColsMenuComponent {
  public hasHyperParams: boolean;
  private _hyperParams: any[];

  @Input() metricVariants;
  @Input() skipValueType;
  @Input() tableCols;
  @Input() disabled: boolean;

  @Input() set hyperParams(hyperParams) {
    this._hyperParams = hyperParams;
    this.hasHyperParams = Object.values(hyperParams ?? {}).some(section =>  Object.keys(section).length > 0);
  }
  get hyperParams() {
    return this._hyperParams;
  }

  @Input() isLoading: boolean;
  @Input() menuTitle: string;

  @Output() getMetricsToDisplay = new EventEmitter();
  @Output() removeColFromList = new EventEmitter<ISmCol['id']>();
  @Output() selectedTableColsChanged = new EventEmitter<ISmCol>();
  @Output() selectedMetricToShow = new EventEmitter<SelectionEvent>();
  @Output() selectedHyperParamToShow = new EventEmitter<{param: string; addCol: boolean}>();
  @Output() clearSelection = new EventEmitter();

  customColumnMode = CustomColumnMode.Standard as CustomColumnMode;
  public customColumnModeEnum = CustomColumnMode;

  setMode(mode: CustomColumnMode) {
    this.customColumnMode = mode;
  }
}
