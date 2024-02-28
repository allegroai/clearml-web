import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {/* getTablesFilterProjectsOptions, */ resetTablesFilterProjectsOptions} from '@common/core/actions/projects.actions';
import {map} from 'rxjs/operators';
import {isReadOnly} from '@common/shared/utils/is-read-only';
import { Task } from '~/business-logic/model/tasks/task';
//import { selectExperimentsList } from '@common/experiments/reducers';
// import { globalFilterChanged } from '@common/experiments/actions/common-experiments-view.actions';
import { pipelinesSettingsModel } from '~/business-logic/model/pipelines/pipelinesSettingsModel';
import { selectExperiments } from '../pipelines.reducer';
import { getAllExperiments } from '../pipelines.actions';


@Component({
  selector: 'sm-pipeline-setting',
  templateUrl: './pipeline-setting.dialog.component.html',
  styleUrls: ['./pipeline-setting.dialog.component.scss']
})
export class PipelineSettingDialogComponent {
  // public experiments$: Observable<Task[]>;
  public readOnlyIntervalNames$: Observable<string[]>;

  constructor(
    private store: Store,
    private matDialogRef: MatDialogRef<PipelineSettingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { defaultExperimentId: string}
  ) {
    // this.experiments$ = this.store.select(selectExperiments);
    // this.readOnlyIntervalNames$ = this.store.select(selectExperiments)
    //   .pipe(map(experiments => experiments?.filter(experiment => isReadOnly(experiment)).map(experiment=> experiment.name)));
    // this.store.dispatch(resetTablesFilterProjectsOptions());
  }

  public settingsForm(pipelineForm) {
    // eslint-disable-next-line no-console
    console.log("i am form", pipelineForm)
    const pipeline = this.convertFormToPipeline(pipelineForm);
    this.matDialogRef.close(pipeline);
  }



  private convertFormToPipeline(settingsForm)
  : pipelinesSettingsModel {
    return {
      emailList: settingsForm.emailList,
      emailAlert:settingsForm.emailAlert,
      scheduling:settingsForm.scheduling,
      interval: settingsForm.interval,
      expression: settingsForm.expression,
    };
  }

  filterSearchChanged($event: {value: string; loadMore?: boolean}) {
    !$event.loadMore && this.store.dispatch(getAllExperiments({query: $event.value}));
    this.store.dispatch(getAllExperiments({query: $event.value || '', /* loadMore: $event.loadMore, allowPublic: false */}));
  }
}
