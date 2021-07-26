import {Component, OnInit, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {fromEvent, Observable, Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {Project} from '../../../../business-logic/model/projects/project';
import {selectRecentProjects} from '../../common-dashboard.reducer';
import {GetRecentProjects} from '../../common-dashboard.actions';
import {ProjectDialogComponent} from '../../../shared/project-dialog/project-dialog.component';
import {ResetSelectedProject, SetSelectedProjectId} from '../../../core/actions/projects.actions';
import {selectCurrentUser} from '../../../core/reducers/users-reducer';
import {filter, take, throttleTime} from 'rxjs/operators';
import {isExample} from '../../../shared/utils/shared-utils';
import { CARDS_IN_ROW } from '../../common-dashboard.const';

@Component({
  selector   : 'sm-dashboard-projects',
  templateUrl: './dashboard-projects.component.html',
  styleUrls  : ['./dashboard-projects.component.scss']
})
export class DashboardProjectsComponent implements OnInit, AfterViewInit, OnDestroy {
  public recentProjectsList$: Observable<Array<Project>>;
  private dialog: MatDialogRef<ProjectDialogComponent>;
  readonly cardsInRow = CARDS_IN_ROW;

  @Output() width = new EventEmitter<number>();
  private sub: Subscription;
  constructor(private store: Store<any>, public router: Router,
              private matDialog: MatDialog) {
    this.recentProjectsList$ = this.store.select(selectRecentProjects);
  }

  @ViewChild('header') header: ElementRef<HTMLDivElement>;

  ngOnInit() {
    this.store.dispatch(new ResetSelectedProject());
    this.store.select(selectCurrentUser)
      .pipe(filter(user => !!user), take(1))
      .subscribe(() => this.store.dispatch(new GetRecentProjects()));
  }

  ngAfterViewInit() {
    window.setTimeout(() => this.width.emit(this.header.nativeElement.getBoundingClientRect().width));
    this.sub = fromEvent(window, 'resize')
      .pipe(throttleTime(50))
      .subscribe(() => this.width.emit(this.header.nativeElement.getBoundingClientRect().width));
  }
  public projectCardClicked(project: Project) {
    this.router.navigateByUrl(`projects/${project.id}`);
    this.store.dispatch(new SetSelectedProjectId(project.id, isExample(project)));
  }

  public openCreateProjectDialog() {
    this.dialog = this.matDialog.open(ProjectDialogComponent, {
      data: {
        mode: 'create',
      }
    });
    this.dialog.afterClosed().subscribe(projectHasBeenCreated => {
      if (projectHasBeenCreated) {
        this.store.dispatch(new GetRecentProjects());
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
