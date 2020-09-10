import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CustomColumnMode} from '../../shared/common-experiments.const';

@Component({
  selector: 'sm-experiment-custom-cols-menu',
  templateUrl: './experiment-custom-cols-menu.component.html',
  styleUrls: ['./experiment-custom-cols-menu.component.scss']
})
export class ExperimentCustomColsMenuComponent {


  public hasHyperParams: boolean;
  private _hyperParams: { [section: string]: any[] };

  @Input() metricVariants;
  @Input() customColumnMode: CustomColumnMode;
  @Input() tableCols;

  @Input() set hyperParams(hyperParams: { [section: string]: any[] }) {
    this._hyperParams = hyperParams;
    this.hasHyperParams = Object.values(hyperParams).some(section =>  Object.keys(section).length > 0);
  }
  get hyperParams() {
    return this._hyperParams;
  }

  @Input() isLoading: boolean;

  @Output() selectMetricActiveChanged = new EventEmitter<CustomColumnMode>();
  @Output() getMetricsToDisplay = new EventEmitter();
  @Output() removeColFromList = new EventEmitter();
  @Output() selectedTableColsChanged = new EventEmitter();
  @Output() selectedMetricToShow = new EventEmitter();
  @Output() selectedHyperParamToShow = new EventEmitter();
  @Output() addCustomColClicked = new EventEmitter();
  @Output() clearSelection = new EventEmitter();

  public CustomColumnMode = CustomColumnMode;
}
