import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output
} from '@angular/core';
import {
  PipelineItem,
  StepStatusEnum
} from '@common/pipelines-controller/pipeline-controller-info/pipeline-controller-info.component';
import {interval, Subscription} from 'rxjs';

@Component({
  selector: 'sm-pipeline-controller-step',
  templateUrl: './pipeline-controller-step.component.html',
  styleUrls: ['./pipeline-controller-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PipelineControllerStepComponent implements OnDestroy {
  protected _step: PipelineItem;
  public runTime: number;
  private timeSub: Subscription;

  constructor(private cdr: ChangeDetectorRef) { }

  @Input() set step(step: PipelineItem) {
    this._step = {...step, data: {...step.data, status: step.data?.status || StepStatusEnum.pending}};
    this.timeSub?.unsubscribe();
    if (step?.data?.job_ended) {
      this.runTime = step.data.job_ended - step?.data?.job_started;
    } else if (step?.data?.job_started && step.data.status === 'running') {
      this.timeSub = interval(1000)
        .subscribe(() => this.updateRunningTime())
      this.updateRunningTime();
    } else {
      this.runTime = null;
    }
  }

  get step() {
    return this._step;
  }
  @Input() selected: boolean;
  @Output() openConsole = new EventEmitter();

  updateRunningTime() {
    this.runTime = (Date.now() / 1000) - this.step.data.job_started;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.timeSub?.unsubscribe();
  }
}
