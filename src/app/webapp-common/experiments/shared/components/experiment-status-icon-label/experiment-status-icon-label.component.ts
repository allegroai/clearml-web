import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {EXPERIMENTS_STATUS_LABELS} from '~/features/experiments/shared/experiments.const';
import {TASKS_STATUS} from '@common/tasks/tasks.constants';

@Component({
  selector   : 'sm-experiment-status-icon-label',
  templateUrl: './experiment-status-icon-label.component.html',
  styleUrls: ['./experiment-status-icon-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentStatusIconLabelComponent {
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
