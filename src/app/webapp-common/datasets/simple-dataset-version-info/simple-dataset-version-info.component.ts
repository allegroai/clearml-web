import {Component} from '@angular/core';
import {
  PipelineControllerInfoComponent, PipelineItem, StatusOption
} from '@common/pipelines-controller/pipeline-controller-info/pipeline-controller-info.component';
import {DagManagerUnsortedService} from '@common/shared/services/dag-manager-unsorted.service';
import {
  getSelectedPipelineStep,
  setSelectedPipelineStep
} from '@common/experiments/actions/common-experiments-info.actions';
import {last} from 'lodash/fp';

@Component({
  selector: 'sm-simple-dataset-version-info',
  templateUrl: './simple-dataset-version-info.component.html',
  styleUrls: [
    './simple-dataset-version-info.component.scss',
    '../../pipelines-controller/pipeline-controller-info/pipeline-controller-info.component.scss'
  ],
  providers: [DagManagerUnsortedService]
})
export class SimpleDatasetVersionInfoComponent extends PipelineControllerInfoComponent {
  detailsPanelMode = StatusOption.content;
  defaultDetailsMode = StatusOption.content;
  public maximizeResults: boolean;

  convertPipelineToDagModel(pipeline): PipelineItem[] {
    const res = super.convertPipelineToDagModel(pipeline);
    if (res?.length > 0) {
      window.setTimeout(() => this.selectStep(last(res)), 1000);
    }
    return res;
  }

  getEntityId(params) {
    return params?.versionId;
  }

  protected getTreeObject(task) {
    return task?.configuration?.['Dataset Struct']?.value;
  }

  toggleResultSize() {
    this.maximizeResults = ! this.maximizeResults;
  }

  selectStep(step?: PipelineItem) {
    if (step) {
      const id = step?.data?.job_id;
      if (id) {
        this.store.dispatch(getSelectedPipelineStep({id}));
      } else {
        this.store.dispatch(setSelectedPipelineStep({step: {id, type: step.data.job_type, status: step.data.status, name: step.name}}));
        this.showLog = false;
      }
      this.selectedEntity = step;
      this.highlightArrows();
    }
  }

  toggleDetails() {
    this.showLog = !this.showLog;
  }

  protected getPanelMode() {
    return this.detailsPanelMode;
  }

  protected resetUninitializedRunningFields() {}
}
