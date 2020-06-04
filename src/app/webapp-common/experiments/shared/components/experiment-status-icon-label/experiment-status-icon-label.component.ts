import {Component, Input, OnInit} from '@angular/core';
import {EXPERIMENTS_STATUS_LABELS} from '../../../../../features/experiments/shared/experiments.const';

@Component({
  selector   : 'sm-experiment-status-icon-label',
  templateUrl: './experiment-status-icon-label.component.html',
  styleUrls  : ['./experiment-status-icon-label.component.scss']
})
export class ExperimentStatusIconLabelComponent implements OnInit {
  @Input() showLabel               = true;
  @Input() showIcon                = true;
  @Input() status;
  @Input() type;
  public EXPERIMENTS_STATUS_LABELS = EXPERIMENTS_STATUS_LABELS;

  constructor() {
  }

  ngOnInit() {
  }

}
