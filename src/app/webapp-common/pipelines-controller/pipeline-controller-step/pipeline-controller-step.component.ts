import {
  ChangeDetectionStrategy,
  Component,
  inject, output, input, effect, computed, signal, DestroyRef
} from '@angular/core';
import {
  PipelineItem,
} from '@common/pipelines-controller/pipeline-controller-info/pipeline-controller-info.component';
import {interval, Subscription} from 'rxjs';
import {StepStatusEnum} from '@common/experiments/actions/common-experiments-info.actions';

@Component({
  selector: 'sm-pipeline-controller-step',
  templateUrl: './pipeline-controller-step.component.html',
  styleUrls: ['./pipeline-controller-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PipelineControllerStepComponent {
  private destroyRef = inject(DestroyRef);
  protected runTime = signal<number>(null);
  private timeSub: Subscription;

  step = input<PipelineItem>();
  selected = input<boolean>();
  openConsole = output();
  protected stepWithStatus = computed(() =>
    ({...this.step(), data: {...this.step().data, status: this. step().data?.status || StepStatusEnum.pending}})
  );

  constructor() {
    effect(() => {
      const step = this.step();
      this.timeSub?.unsubscribe();
      if (step?.data?.job_ended) {
        this.runTime.set(step.data.job_ended - step?.data?.job_started);
      } else if (step?.data?.job_started && step.data.status === 'running') {
        this.timeSub = interval(1000)
          .subscribe(() => this.updateRunningTime())
        this.updateRunningTime();
      } else {
        this.runTime.set(null);
      }
    }, {allowSignalWrites: true});

    this.destroyRef.onDestroy(() => this.timeSub?.unsubscribe());
  }

  updateRunningTime() {
    this.runTime.set((Date.now() / 1000) - this.step().data.job_started);
  }
}
