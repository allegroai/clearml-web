import {Component, EventEmitter, Input, Output} from '@angular/core';
import {EXPERIMENTS_STATUS_LABELS} from '../../../features/experiments/shared/experiments.const';

@Component({
  selector   : 'sm-experiment-info-header-status-icon-label',
  templateUrl: './experiment-info-header-status-icon-label.component.html',
  styleUrls  : ['./experiment-info-header-status-icon-label.component.scss']
})
export class ExperimentInfoHeaderStatusIconLabelComponent {
  @Input() showLabel               = true;
  @Input() status                  = '';
  @Input() viewOnly                = false;
  @Input() development             = false;
  @Input() showMaximize: boolean;
  @Output() closeInfoClicked       = new EventEmitter();
  @Output() maximizedClicked       = new EventEmitter();

  public EXPERIMENTS_STATUS_LABELS = EXPERIMENTS_STATUS_LABELS;

  constructor() {}
}
