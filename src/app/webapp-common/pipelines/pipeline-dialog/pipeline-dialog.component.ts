import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {selectTablesFilterProjectsOptions} from '@common/core/reducers/projects.reducer';
import {getTablesFilterProjectsOptions, resetTablesFilterProjectsOptions} from '@common/core/actions/projects.actions';
import {map} from 'rxjs/operators';
import { Project } from '~/business-logic/model/projects/project';
import {isReadOnly} from '@common/shared/utils/is-read-only';
import { PipelinesCreateRequest } from '~/business-logic/model/pipelines/models';

@Component({
  selector: 'sm-pipeline-dialog',
  templateUrl: './pipeline-dialog.component.html',
  styleUrls: ['./pipeline-dialog.component.scss']
})
export class PipelineDialogComponent {
  public projects$: Observable<Project[]>;
  public readOnlyProjectsNames$: Observable<string[]>;

  constructor(
    private store: Store,
    private matDialogRef: MatDialogRef<PipelineDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { defaultProjectId: string}
  ) {
    this.projects$ = this.store.select(selectTablesFilterProjectsOptions);
    this.readOnlyProjectsNames$ = this.store.select(selectTablesFilterProjectsOptions)
      .pipe(map(projects => projects?.filter(project => isReadOnly(project)).map(project=> project.name)));
    this.store.dispatch(resetTablesFilterProjectsOptions());
  }

  public createPipeline(pipelineForm) {
    const pipeline = this.convertFormToPipeline(pipelineForm);
    this.matDialogRef.close(pipeline);
  }



  private convertFormToPipeline(pipelineForm: any): PipelinesCreateRequest {
    return {
      name: pipelineForm.name,
      description: pipelineForm.description,
      project:pipelineForm.project.value,
      tags: pipelineForm.tags,
      parameters: pipelineForm.parameters
    };
  }

  filterSearchChanged($event: {value: string; loadMore?: boolean}) {
    !$event.loadMore && this.store.dispatch(resetTablesFilterProjectsOptions());
    this.store.dispatch(getTablesFilterProjectsOptions({searchString: $event.value || '', loadMore: $event.loadMore, allowPublic: false}));
  }
}
