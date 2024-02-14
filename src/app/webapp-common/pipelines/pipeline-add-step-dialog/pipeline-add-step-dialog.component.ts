import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {/* getTablesFilterProjectsOptions, */ resetTablesFilterProjectsOptions} from '@common/core/actions/projects.actions';
import {map} from 'rxjs/operators';
import {isReadOnly} from '@common/shared/utils/is-read-only';
import { Task } from '~/business-logic/model/tasks/task';
//import { selectExperimentsList } from '@common/experiments/reducers';
import { globalFilterChanged } from '@common/experiments/actions/common-experiments-view.actions';
import { PipelinesCreateStepsRequest } from '~/business-logic/model/pipelines/pipelinesCreateStepsRequest';
import { selectExperiments } from '../pipelines.reducer';
import { getAllExperiments } from '../pipelines.actions';


@Component({
  selector: 'sm-pipeline-add-step-dialog',
  templateUrl: './pipeline-add-step-dialog.component.html',
  styleUrls: ['./pipeline-add-step-dialog.component.scss']
})
export class PipelineAddStepDialogComponent {
  public experiments$: Observable<Task[]>;
  public readOnlyExperimentsNames$: Observable<string[]>;

  constructor(
    private store: Store,
    private matDialogRef: MatDialogRef<PipelineAddStepDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { defaultExperimentId: string}
  ) {
    this.experiments$ = this.store.select(selectExperiments);
    this.readOnlyExperimentsNames$ = this.store.select(selectExperiments)
      .pipe(map(experiments => experiments?.filter(experiment => isReadOnly(experiment)).map(experiment=> experiment.name)));
    this.store.dispatch(resetTablesFilterProjectsOptions());
  }

  public createStep(pipelineForm) {
    const pipeline = this.convertFormToPipeline(pipelineForm);
    this.matDialogRef.close(pipeline);
  }



  private convertFormToPipeline(stepForm: any): PipelinesCreateStepsRequest {
    return {
      name: stepForm.name,
      description: stepForm.description,
      experiment:stepForm.experiment.value,
      parameters: stepForm.parameters
    };
  }

  filterSearchChanged($event: {value: string; loadMore?: boolean}) {
    !$event.loadMore && this.store.dispatch(getAllExperiments({query: $event.value}));
    this.store.dispatch(getAllExperiments({query: $event.value || '', /* loadMore: $event.loadMore, allowPublic: false */}));
  }
}
