import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {CustomColumnMode} from '../../shared/common-experiments.const';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {MetricVariantResult} from '~/business-logic/model/projects/metricVariantResult';
import {MetricValueType} from '@common/experiments-compare/reducers/experiments-compare-charts.reducer';

@Component({
  selector: 'sm-experiment-custom-cols-menu',
  templateUrl: './experiment-custom-cols-menu.component.html',
  styleUrls: ['./experiment-custom-cols-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentCustomColsMenuComponent {
  public hasHyperParams: boolean;
  private _hyperParams: { [section: string]: any[] };

  @Input() metricVariants;
  @Input() tableCols;
  @Input() disabled: boolean;

  @Input() set hyperParams(hyperParams: { [section: string]: any[] }) {
    this._hyperParams = hyperParams;
    this.hasHyperParams = Object.values(hyperParams).some(section =>  Object.keys(section).length > 0);
  }
  get hyperParams() {
    return this._hyperParams;
  }

  @Input() isLoading: boolean;

  @Output() getMetricsToDisplay = new EventEmitter();
  @Output() removeColFromList = new EventEmitter<ISmCol['id']>();
  @Output() selectedTableColsChanged = new EventEmitter<ISmCol>();
  @Output() selectedMetricToShow = new EventEmitter<{
    variant: MetricVariantResult;
    addCol: boolean;
    valueType: MetricValueType;
  }>();
  @Output() selectedHyperParamToShow = new EventEmitter<{param: string; addCol: boolean}>();
  @Output() clearSelection = new EventEmitter();

  customColumnMode = CustomColumnMode.Standard as CustomColumnMode;
  public CustomColumnMode = CustomColumnMode;

  setMode(mode: CustomColumnMode) {
    this.customColumnMode = mode;
  }
}
