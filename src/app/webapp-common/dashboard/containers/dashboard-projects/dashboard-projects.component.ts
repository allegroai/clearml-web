import {Component, OnInit, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {fromEvent, Observable, Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {Project} from '~/business-logic/model/projects/project';
import {selectRecentProjects} from '../../common-dashboard.reducer';
import {getRecentProjects} from '../../common-dashboard.actions';
import {ProjectDialogComponent} from '@common/shared/project-dialog/project-dialog.component';
import {resetSelectedProject, setSelectedProjectId} from '@common/core/actions/projects.actions';
import {selectCurrentUser} from '@common/core/reducers/users-reducer';
import {filter, take, throttleTime} from 'rxjs/operators';
import {isExample} from '@common/shared/utils/shared-utils';
import { CARDS_IN_ROW } from '../../common-dashboard.const';
import {trackById} from '@common/shared/utils/forms-track-by';

@Component({
  selector   : 'sm-dashboard-projects',
  templateUrl: './dashboard-projects.component.html',
  styleUrls  : ['./dashboard-projects.component.scss']
})
export class DashboardProjectsComponent implements OnInit, AfterViewInit, OnDestroy {
  public recentProjectsList$: Observable<Array<Project>>;
  private dialog: MatDialogRef<ProjectDialogComponent>;
  private sub: Subscription;
  readonly cardsInRow = CARDS_IN_ROW;
  overflow: boolean;
  trackById = trackById;

  @Output() width = new EventEmitter<number>();

  constructor(
    private store: Store<any>,
    public router: Router,
    private matDialog: MatDialog
  ) {
    this.recentProjectsList$ = this.store.select(selectRecentProjects);
  }

  @ViewChild('header') header: ElementRef<HTMLDivElement>;

  ngOnInit() {
    this.store.dispatch(resetSelectedProject());
    this.store.select(selectCurrentUser)
      .pipe(filter(user => !!user), take(1))
      .subscribe(() => this.store.dispatch(getRecentProjects()));
  }

  ngAfterViewInit() {
    window.setTimeout(() => this.width.emit(this.header.nativeElement.getBoundingClientRect().width));
    this.sub = fromEvent(window, 'resize')
      .pipe(throttleTime(50))
      .subscribe(() => this.width.emit(this.header.nativeElement.getBoundingClientRect().width));
  }
  public projectCardClicked(project: Project) {
    (project.own_tasks===0 && project.sub_projects.length>0) ? this.router.navigateByUrl(`projects/${project.id}/projects`): this.router.navigateByUrl(`projects/${project.id}`);
    this.store.dispatch(setSelectedProjectId({projectId: project.id, example: isExample(project)}));
  }

  public openCreateProjectDialog() {
    this.dialog = this.matDialog.open(ProjectDialogComponent, {
      data: {
        mode: 'create',
      }
    });
    this.dialog.afterClosed().subscribe(projectHasBeenCreated => {
      if (projectHasBeenCreated) {
        this.store.dispatch(getRecentProjects());
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.header = null;
  }
}
