import { Component} from '@angular/core';
import {
  PipelineControllerStepComponent
} from '@common/pipelines-controller/pipeline-controller-step/pipeline-controller-step.component';
import { fileSizeConfigStorage } from '@common/shared/pipes/filesize.pipe';

@Component({
  selector: 'sm-dataset-version-step',
  templateUrl: './dataset-version-step.component.html',
  styleUrls: ['../../pipelines-controller/pipeline-controller-step/pipeline-controller-step.component.scss', './dataset-version-step.component.scss']
})
export class DatasetVersionStepComponent extends PipelineControllerStepComponent{
  fileSizeConfigStorage = fileSizeConfigStorage;
}
