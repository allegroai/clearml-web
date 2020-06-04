import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CustomColumnMode} from '../../shared/common-experiments.const';

@Component({
  selector   : 'sm-experiment-custom-cols-menu',
  templateUrl: './experiment-custom-cols-menu.component.html',
  styleUrls  : ['./experiment-custom-cols-menu.component.scss']
})
export class ExperimentCustomColsMenuComponent {


  @Input() customColumnMode: CustomColumnMode;
  @Input() tableCols;
  @Input() metricVariants;
  @Input() hyperParams;
  @Input() isLoading: boolean;

  @Output() selectMetricActiveChanged = new EventEmitter<CustomColumnMode>();
  @Output() getMetricsToDisplay       = new EventEmitter();
  @Output() removeColFromList         = new EventEmitter();
  @Output() selectedTableColsChanged  = new EventEmitter();
  @Output() selectedMetricToShow      = new EventEmitter();
  @Output() selectedHyperParamToShow  = new EventEmitter();
  @Output() addCustomColClicked       = new EventEmitter();
  @Output() clearSelection       = new EventEmitter();

  public menuFooterHover;
  public CustomColumnMode = CustomColumnMode;
}
