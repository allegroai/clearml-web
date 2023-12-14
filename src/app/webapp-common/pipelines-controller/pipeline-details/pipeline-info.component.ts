import {Component, Input} from '@angular/core';
import {Store} from '@ngrx/store';
import {Artifact} from '~/business-logic/model/tasks/artifact';
import {Task} from '~/business-logic/model/tasks/task';
import {PipelineItem} from '@common/pipelines-controller/pipeline-controller-info/pipeline-controller-info.component';
import {TaskTypeEnum} from '~/business-logic/model/tasks/taskTypeEnum';
import {addMessage} from '@common/core/actions/layout.actions';
import { fileSizeConfigStorage } from '@common/shared/pipes/filesize.pipe';
import {MESSAGES_SEVERITY} from '@common/constants';

@Component({
  selector: 'sm-pipeline-info',
  templateUrl: './pipeline-info.component.html',
  styleUrls: ['./pipeline-info.component.scss']
})
export class PipelineInfoComponent {
  private _entity: Task;
  public controller: boolean;
  public fileSizeConfigStorage = fileSizeConfigStorage;
  private _step: { branchPath: number; data: any; name: string; stepId: number; parentIds: number[]; id: string };

  @Input() set entity(task: Task) {
    this._entity = task;
    this.controller = task?.type === TaskTypeEnum.Controller;
  }
  get entity() {
    return this._entity;
  }

  @Input() set step(step: PipelineItem) {
    this._step = step ? {...step, data: {...step.data, status: step.data?.status || 'pending'}} : null;
  };

  get step() {
    return this._step;
  }
  @Input() project: string;

  constructor(private store: Store) {
  }

  trackByFn = (index: number, artifact: Artifact) => artifact.hash || artifact.uri;

  copyToClipboard() {
    this.store.dispatch(addMessage(MESSAGES_SEVERITY.SUCCESS, 'ID copied successfully'));
  }
}
