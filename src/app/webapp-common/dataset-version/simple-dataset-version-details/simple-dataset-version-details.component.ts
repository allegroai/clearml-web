import {Component, EventEmitter, Output} from '@angular/core';
import {PipelineInfoComponent} from '@common/pipelines-controller/pipeline-details/pipeline-info.component';
import { fileSizeConfigStorage } from '@common/shared/pipes/filesize.pipe';
import {DATASETS_STATUS_LABEL, EXPERIMENTS_STATUS_LABELS} from '~/features/experiments/shared/experiments.const';
import {Task} from '~/business-logic/model/tasks/task';

@Component({
  selector: 'sm-simple-dataset-version-details',
  templateUrl: './simple-dataset-version-details.component.html',
  styleUrls: ['./simple-dataset-version-details.component.scss', '../../pipelines-controller/pipeline-details/pipeline-info.component.scss']
})
export class SimpleDatasetVersionDetailsComponent extends PipelineInfoComponent {
  public fileSizeConfigStorage = fileSizeConfigStorage;

  public convertStatusMap = DATASETS_STATUS_LABEL;
  public convertStatusMapBase = EXPERIMENTS_STATUS_LABELS;

  @Output() editDescription = new EventEmitter<Task>();
}
