import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {selectTablesFilterProjectsOptions} from '@common/core/reducers/projects.reducer';
import {getTablesFilterProjectsOptions, resetTablesFilterProjectsOptions} from '@common/core/actions/projects.actions';
import { ReportsCreateRequest } from '~/business-logic/model/reports/models';
import {map} from 'rxjs/operators';
import { Project } from '~/business-logic/model/projects/project';
import {isReadOnly} from '@common/shared/utils/is-read-only';

@Component({
  selector: 'sm-report-dialog',
  templateUrl: './report-dialog.component.html',
  styleUrls: ['./report-dialog.component.scss']
})
export class ReportDialogComponent {
  public projects$: Observable<Project[]>;
  public readOnlyProjectsNames$: Observable<string[]>;


  constructor(
    private store: Store,
    private matDialogRef: MatDialogRef<ReportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { defaultProjectId: string}
  ) {
    this.projects$ = this.store.select(selectTablesFilterProjectsOptions);
    this.readOnlyProjectsNames$ = this.store.select(selectTablesFilterProjectsOptions)
      .pipe(map(projects => projects?.filter(project => isReadOnly(project)).map(project=> project.name)));
    this.store.dispatch(resetTablesFilterProjectsOptions());
  }

  public createReport(reportForm) {
    const report = this.convertFormToReport(reportForm);
    this.matDialogRef.close(report);
  }



  private convertFormToReport(reportForm: any): ReportsCreateRequest {
    return {
      name: reportForm.name,
      comment: reportForm.description,
      project:reportForm.project.value
    };
  }

  filterSearchChanged($event: {value: string; loadMore?: boolean}) {
    !$event.loadMore && this.store.dispatch(resetTablesFilterProjectsOptions());
    this.store.dispatch(getTablesFilterProjectsOptions({searchString: $event.value || '', loadMore: $event.loadMore, allowPublic: false}));
  }
}
