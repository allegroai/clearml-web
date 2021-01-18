import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {Project} from '../../../../business-logic/model/projects/project';
import {selectRecentProjects} from '../../common-dashboard.reducer';
import {GetRecentProjects} from '../../common-dashboard.actions';
import {CARDS_IN_ROW} from '../../common-dashboard.const';
import {ProjectCreateDialogComponent} from '../../../shared/project-create-dialog/project-create-dialog.component';
import {ResetSelectedProject} from '../../../core/actions/projects.actions';
import {selectCurrentUser} from '../../../core/reducers/users-reducer';
import {filter, take} from 'rxjs/operators';

@Component({
  selector   : 'sm-dashboard-projects',
  templateUrl: './dashboard-projects.component.html',
  styleUrls  : ['./dashboard-projects.component.scss']
})
export class DashboardProjectsComponent implements OnInit {
  public recentProjectsList$: Observable<Array<Project>>;
  public CARDS_IN_ROW = CARDS_IN_ROW;
  private dialog: MatDialogRef<ProjectCreateDialogComponent>;

  constructor(private store: Store<any>, public router: Router,
              private matDialog: MatDialog) {
    this.recentProjectsList$ = this.store.select(selectRecentProjects);
  }

  ngOnInit() {
    this.store.dispatch(new ResetSelectedProject());
    this.store.select(selectCurrentUser)
      .pipe(filter(user => !!user), take(1))
      .subscribe(() => this.store.dispatch(new GetRecentProjects()));
  }

  public projectCardClicked(projectId) {
    this.router.navigateByUrl('projects/' + projectId + '/experiments');
  }

  public openCreateProjectDialog() {
    this.dialog = this.matDialog.open(ProjectCreateDialogComponent);
    this.dialog.afterClosed().subscribe(projectHasBeenCreated => {
      if (projectHasBeenCreated) {
        this.store.dispatch(new GetRecentProjects());
      }
    });
  }
}
