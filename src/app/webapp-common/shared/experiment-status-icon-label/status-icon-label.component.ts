import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {EXPERIMENTS_STATUS_LABELS} from '~/features/experiments/shared/experiments.const';
import {TASKS_STATUS} from '@common/tasks/tasks.constants';
import {NgIf} from '@angular/common';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'sm-status-icon-label',
  templateUrl: './status-icon-label.component.html',
  styleUrls: ['./status-icon-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    MatProgressSpinnerModule
  ],
  standalone: true
})
export class StatusIconLabelComponent {
  public showSpinner: boolean;
  public experimentsStatusLabels = EXPERIMENTS_STATUS_LABELS;
  private _status: string;

  @Input() showLabel               = true;
  @Input() showIcon                = true;
  @Input() set status(status) {
    this._status = status;
    this.showSpinner = [
      TASKS_STATUS.IN_PROGRESS,
      TASKS_STATUS.FAILED,
      TASKS_STATUS.STOPPED
    ].includes(status);
  }
  get status() {
    return this._status;
  }
  @Input() type;
  @Input() progress;
}
