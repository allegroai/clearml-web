import {ChangeDetectionStrategy, Component, ElementRef, inject, Input, Renderer2} from '@angular/core';
import {EXPERIMENTS_STATUS_LABELS} from '~/features/experiments/shared/experiments.const';
import {TASKS_STATUS} from '@common/tasks/tasks.constants';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'sm-status-icon-label',
  templateUrl: './status-icon-label.component.html',
  styleUrls: ['./status-icon-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatProgressSpinnerModule
  ],
  standalone: true
})
export class StatusIconLabelComponent {
  public showSpinner: boolean;
  public experimentsStatusLabels = EXPERIMENTS_STATUS_LABELS;
  private _status: string;
  private _showLabel: boolean = true;
  private _enableSpinner: boolean;

  @Input() set showLabel(showLabel: boolean) {
    this._showLabel = showLabel;
    !showLabel === false && this.renderer.addClass(this.ref.nativeElement, 'hide-label');
  }

  get showLabel() {
    return this._showLabel;
  }
  @Input() showIcon                = true;
  @Input() set enableSpinner(enableSpinner: boolean){
    this._enableSpinner = enableSpinner;
    enableSpinner && this.renderer.addClass(this.ref.nativeElement, 'show-spinner');
  }

  get enableSpinner() {
    return this._enableSpinner;
  }
  @Input() set status(status) {
    this.renderer.removeClass(this.ref.nativeElement, this._status);
    this._status = status;
    this.renderer.addClass(this.ref.nativeElement, status);
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

  private renderer = inject(Renderer2);
  private ref = inject(ElementRef);
}
