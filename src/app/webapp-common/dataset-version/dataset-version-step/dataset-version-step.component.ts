import {Component, Input, input, output } from '@angular/core';
import {DagModelItem} from '@ngneat/dag';
import {fileSizeConfigStorage} from '@common/shared/pipes/filesize.pipe';
import {StepStatusEnum} from '@common/experiments/actions/common-experiments-info.actions';

export interface TreeVersion {
  name: string;
  version: string;
  job_id: string;
  status: StepStatusEnum,
  last_update: number,
  parents: string[],
  job_size: number
}

export interface VersionItem extends DagModelItem {
  name: string;
  id: string;
  data: TreeVersion;
}

@Component({
  selector: 'sm-dataset-version-step',
  templateUrl: './dataset-version-step.component.html',
  styleUrls: ['../../pipelines-controller/pipeline-controller-step/pipeline-controller-step.component.scss', './dataset-version-step.component.scss']
})
export class DatasetVersionStepComponent {
  protected _step: VersionItem;
  protected readonly fileSizeConfigStorage = fileSizeConfigStorage;

  @Input() set step(step: VersionItem) {
    this._step = {...step, data: {...step.data, status: step.data?.status || StepStatusEnum.pending}};
  }

  get step() {
    return this._step;
  }
  selected = input<boolean>();
  openConsole = output();
}
