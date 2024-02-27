import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Store} from '@ngrx/store';
import {Artifact} from '~/business-logic/model/tasks/artifact';
import {
  PipelineItem,
  StepStatusEnum,
  TreeStep
} from '@common/pipelines-controller/pipeline-controller-info/pipeline-controller-info.component';
import {TaskTypeEnum} from '~/business-logic/model/tasks/taskTypeEnum';
import {addMessage} from '@common/core/actions/layout.actions';
import {fileSizeConfigStorage} from '@common/shared/pipes/filesize.pipe';
import {ICONS, MESSAGES_SEVERITY} from '@common/constants';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';

@Component({
  selector: 'sm-pipeline-step-info',
  templateUrl: './pipeline-step-info.component.html',
  styleUrls: ['./pipeline-step-info.component.scss']
})
export class PipelineStepInfoComponent {
  readonly icons = ICONS;
  //private _entity: IExperimentInfo;
  public controller: boolean;
  public fileSizeConfigStorage = fileSizeConfigStorage;
  private _step;

  /* @Input() set entity(task: IExperimentInfo) {
    this._entity = task;
    this.controller = task?.type === TaskTypeEnum.Controller;
  }
  get entity() {
    return this._entity;
  } */
  @Output() deleteStep = new EventEmitter<unknown>();
  @Input() set step(step) {
    this._step = step ? {...step} : null;
  }

  get step() {
    return this._step;
  }
  @Input() project: string;

  constructor(private store: Store) {
  }

  public deleteClicked() {
    this.deleteStep.emit(this._step);
  }

  trackByFn = (index: number, artifact: Artifact) => artifact.hash || artifact.uri;

  copyToClipboard() {
    this.store.dispatch(addMessage(MESSAGES_SEVERITY.SUCCESS, 'ID copied successfully'));
  }
}
