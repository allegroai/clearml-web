import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {selectRootProjects} from '@common/core/reducers/projects.reducer';
import {getAllSystemProjects} from '@common/core/actions/projects.actions';
import { ReportsCreateRequest } from '~/business-logic/model/reports/models';
import {map} from 'rxjs/operators';
import { Project } from '~/business-logic/model/projects/project';
import {isReadOnly} from '@common/shared/utils/is-read-only';

@Component({
  selector: 'sm-report-dialog',
  templateUrl: './report-dialog.component.html',
  styleUrls: ['./report-dialog.component.scss']
})
export class ReportDialogComponent implements OnInit, OnDestroy {
  public projects$: Observable<Project[]>;
  // private creationStatusSubscription: Subscription;
  public readOnlyProjectsNames$: Observable<string[]>;


  constructor(private store: Store<any>, private matDialogRef: MatDialogRef<ReportDialogComponent>) {
    this.projects$ = this.store.select(selectRootProjects);
    this.readOnlyProjectsNames$ = this.store.select(selectRootProjects)
      .pipe(map(projects => projects?.filter(project => isReadOnly(project)).map(project=> project.name)));
  }

  ngOnInit(): void {
    this.store.dispatch(getAllSystemProjects());
    // this.creationStatusSubscription = this.store.select(createReportSelectors.selectCreationStatus).subscribe(status => {
    //   if (status === CREATION_STATUS.SUCCESS) {
    //     return this.matDialogRef.close(true);
    //   }
    // });
  }

  ngOnDestroy(): void {
    // this.store.dispatch(new ResetState());
    // this.creationStatusSubscription.unsubscribe();
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
}
