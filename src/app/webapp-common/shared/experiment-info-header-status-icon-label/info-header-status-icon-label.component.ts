import {Component, Input} from '@angular/core';
import {EXPERIMENTS_STATUS_LABELS} from '~/features/experiments/shared/experiments.const';
import {NgIf, UpperCasePipe} from '@angular/common';

@Component({
  selector: 'sm-info-header-status-icon-label',
  templateUrl: './info-header-status-icon-label.component.html',
  styleUrls: ['./info-header-status-icon-label.component.scss'],
  imports: [
    UpperCasePipe,
    NgIf
  ],
  standalone: true
})
export class InfoHeaderStatusIconLabelComponent {
  @Input() showLabel               = true;
  @Input() status                  = '';

  public experimentsStatusLabels = EXPERIMENTS_STATUS_LABELS;

  constructor() {}
}
