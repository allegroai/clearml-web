import {ChangeDetectorRef, Component, NgZone} from '@angular/core';
import {PipelineControllerInfoComponent, PipelineItem, StatusOption} from '@common/pipelines-controller/pipeline-controller-info/pipeline-controller-info.component';
import {DagManagerUnsortedService} from '@common/shared/services/dag-manager-unsorted.service';
import {experimentDetailsUpdated, getSelectedPipelineStep, setSelectedPipelineStep} from '@common/experiments/actions/common-experiments-info.actions';
import {last} from 'lodash/fp';
import {Store} from '@ngrx/store';
import {MatDialog} from '@angular/material/dialog';
import {EditJsonComponent} from '@common/shared/ui-components/overlay/edit-json/edit-json.component';
import {Task} from '~/business-logic/model/tasks/task';
import {CommonExperimentsInfoEffects} from '@common/experiments/effects/common-experiments-info.effects';
import {tap} from 'rxjs/operators';

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

  constructor(
    protected _dagManager: DagManagerUnsortedService<PipelineItem>,
    protected store: Store<any>,
    protected cdr: ChangeDetectorRef,
    protected zone: NgZone,
    private dialog: MatDialog,
    private commonExperimentsInfoEffects: CommonExperimentsInfoEffects
  ) {
    super(_dagManager, store, cdr, zone);
  }

  convertPipelineToDagModel(pipeline): PipelineItem[] {
    const res = super.convertPipelineToDagModel(pipeline);
    if (res?.length > 0) {
      window.setTimeout(() => this.selectStep(last(res)), 1000);
    } else if (this.infoData?.id){
      this.store.dispatch(getSelectedPipelineStep({id: this.infoData.id}));
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
    if (this.detailsPanelMode === StatusOption.content) {
      this.detailsPanelMode = null;
      window.setTimeout(() => {
        this.detailsPanelMode = StatusOption.content;
        this.cdr.detectChanges();
      }, 450);
    }
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

  editDescription(dataset: Task) {
    const editJsonComponent = this.dialog.open(EditJsonComponent, {
      data: {
        textData: dataset.comment,
        title: 'EDIT DESCRIPTION',
        typeJson: false,
      }
    });
    editJsonComponent.afterClosed().subscribe(res => {
      if (res !== undefined) {
        this.store.dispatch(experimentDetailsUpdated({id: dataset.id, changes: {comment: res}}));
        this.commonExperimentsInfoEffects.getExperimentInfo$
          .pipe(tap(() => this.store.dispatch(getSelectedPipelineStep({id: dataset.id}))));
      }
    });
  }
}
