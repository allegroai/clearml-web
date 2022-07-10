import {Component, Input} from '@angular/core';
import {EXPERIMENTS_STATUS_LABELS} from '~/features/experiments/shared/experiments.const';

@Component({
  selector   : 'sm-experiment-info-header-status-icon-label',
  templateUrl: './experiment-info-header-status-icon-label.component.html',
  styleUrls  : ['./experiment-info-header-status-icon-label.component.scss']
})
export class ExperimentInfoHeaderStatusIconLabelComponent {
  @Input() showLabel               = true;
  @Input() status                  = '';

  public experimentsStatusLabels = EXPERIMENTS_STATUS_LABELS;

  constructor() {}
}
