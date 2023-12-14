import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PipelineItem} from '@common/pipelines-controller/pipeline-controller-info/pipeline-controller-info.component';
import {TaskStatusEnum} from '~/business-logic/model/tasks/taskStatusEnum';

@Component({
  selector: 'sm-pipeline-controller-step',
  templateUrl: './pipeline-controller-step.component.html',
  styleUrls: ['./pipeline-controller-step.component.scss']
})
export class PipelineControllerStepComponent {
  protected _step: PipelineItem;
  public runTime: number;

  constructor() { }
  @Input() set step(step: PipelineItem) {
    this._step = {...step, data: {...step.data, status: step.data?.status || 'pending'}};
    this.runTime = step?.data?.job_ended ? step?.data?.job_ended - step?.data?.job_started :
      step.data.status === TaskStatusEnum.InProgress ? Date.now() / 1000 - step?.data?.job_started : 0;
  };

  get step() {
    return this._step;
  }
  @Input() selected: boolean;
  @Output() openConsole = new EventEmitter();
}
