import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {EXPERIMENTS_STATUS_LABELS} from '../../../features/experiments/shared/experiments.const';

@Component({
  selector   : 'sm-experiment-info-header-status-progress-bar',
  templateUrl: './experiment-info-header-status-progress-bar.component.html',
  styleUrls  : ['./experiment-info-header-status-progress-bar.component.scss']
})
export class ExperimentInfoHeaderStatusProgressBarComponent implements OnInit {
  @Input() status;
  @Input() editable          = true;
  @Input() development        = false;
  @Input() showMaximize: boolean;
  @Output() closeInfoClicked = new EventEmitter();
  @Output() maximizedClicked = new EventEmitter();

  readonly EXPERIMENTS_STATUS_LABELS = EXPERIMENTS_STATUS_LABELS;

  constructor() {
  }

  ngOnInit() {
  }

}
