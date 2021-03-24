import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {IProjectReadyForDeletion, selectNoMoreProjects, selectPojectReadyForDeletion, selectProjectsData, selectProjectsOrderBy, selectProjectsSearchQuery, selectProjectsSortOrder} from '../../common-projects.reducer';
import {CheckProjectForDeletion, DeleteProject, GetAllProjects, GetNextProjects, ProjectUpdated, ResetProjectsSearchQuery, ResetReadyToDelete, SetProjectsOrderBy, SetProjectsSearchQuery} from '../../common-projects.actions';
import {Router} from '@angular/router';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ProjectsGetAllResponseSingle} from '../../../../business-logic/model/projects/projectsGetAllResponseSingle';
import {ProjectCreateDialogComponent} from '../../../shared/project-create-dialog/project-create-dialog.component';
import {Observable, Subscription} from 'rxjs';
import {distinctUntilChanged, filter, map, skip} from 'rxjs/operators';
import {ConfirmDialogComponent} from '../../../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {ResetSelectedProject} from '../../../core/actions/projects.actions';
import {InitSearch, ResetSearch} from '../../../common-search/common-search.actions';
import {selectSearchQuery} from '../../../common-search/common-search.reducer';
import {getDeleteProjectPopupBody, isDeletableProject, readyForDeletionFilter} from '../../../../features/projects/projects-page.utils';

@Component({
  selector   : 'sm-common-projects-page',
  templateUrl: './common-projects-page.component.html',
  styleUrls  : ['./common-projects-page.component.scss']
})
export class CommonProjectsPageComponent implements OnInit, OnDestroy {
  public projectsList$: Observable<Array<ProjectsGetAllResponseSingle>>;
  public projectsOrderBy$: Observable<string>;
  public projectsSearchQuery$: Observable<string>;

  public ALL_PROJECTS_CARD: ProjectsGetAllResponseSingle =
           {
             id   : '*',
             name : 'All projects',
             stats: {
               active: {
                 status_count : {queued: '∞' as any, in_progress: '∞' as any, published: '∞' as any},
                 total_runtime: 0
               }
             }
           };
  private createProjectDialog: MatDialogRef<ProjectCreateDialogComponent, any>;
  private searchSubs: Subscription;
  private projectReadyForDeletion$: Observable<IProjectReadyForDeletion>;
  private deleteProjectId: string;
  private projectReadyForDeletionSub: Subscription;
  private searchQuery$: Observable<string>;
  public noMoreProjects$: Observable<boolean>;
  public projectsSortOrder$: Observable<1 | -1>;

  constructor(public store: Store<any>, private router: Router, private dialog: MatDialog) {
    this.searchQuery$             = this.store.select(selectSearchQuery);
    this.projectsOrderBy$         = this.store.select(selectProjectsOrderBy);
    this.projectsSortOrder$       = this.store.select(selectProjectsSortOrder);
    this.projectsSearchQuery$     = this.store.select(selectProjectsSearchQuery);
    this.noMoreProjects$          = this.store.select(selectNoMoreProjects);
    this.projectReadyForDeletion$ = this.store.select(selectPojectReadyForDeletion).pipe(
      distinctUntilChanged(),
      filter(readyForDeletion => readyForDeletionFilter(readyForDeletion)));
    this.projectsList$            = this.store.select(selectProjectsData).pipe(map((projectsList) => [this.ALL_PROJECTS_CARD].concat(projectsList)));
    this.syncAppSearch();
  }

  ngOnInit() {
    this.store.dispatch(new ResetSelectedProject());
    this.store.dispatch(new GetAllProjects());

    this.projectReadyForDeletionSub = this.projectReadyForDeletion$.subscribe(readyForDeletion => {
      let dialogData = {};
      if (isDeletableProject(readyForDeletion)) {
        dialogData = {
          title    : 'Delete this project?',
          body     : 'Are you sure you want to delete this project?',
          yes      : 'Delete',
          no       : 'Cancel',
          iconClass: 'i-alert',
        };
      } else {
        dialogData = {
          title    : 'Unable to Delete Project',
          body     : getDeleteProjectPopupBody(readyForDeletion),
          no       : 'OK',
          iconClass: 'i-alert',
        };
      }
      const confirmDialogRef: MatDialogRef<any, boolean> = this.dialog.open(ConfirmDialogComponent, {
              data: dialogData
            })
      ;
      confirmDialogRef.afterClosed().subscribe(approvedDeletion => {
        if (approvedDeletion) {
          this.store.dispatch(new DeleteProject(this.deleteProjectId));
        } else {
          this.store.dispatch(new ResetReadyToDelete());
        }
      });
    });
  }

  ngOnDestroy() {
    this.stopSyncSearch();
    this.projectReadyForDeletionSub.unsubscribe();
    this.store.dispatch(new ResetReadyToDelete());
    this.store.dispatch(new ResetProjectsSearchQuery());
  }

  stopSyncSearch() {
    this.store.dispatch(new ResetSearch());
    this.searchSubs.unsubscribe();
  }

  syncAppSearch() {
    this.store.dispatch(new InitSearch('Search for projects'));
    this.searchSubs = this.searchQuery$.pipe(skip(1)).subscribe(query => this.search(query));
  }

  openCreateProjectDialog() {
    this.createProjectDialog = this.dialog.open(ProjectCreateDialogComponent);
    this.createProjectDialog.afterClosed().subscribe(projectHasBeenCreated => {
      if (projectHasBeenCreated) {
        this.store.dispatch(new GetAllProjects());
      }
    });
  }

  public projectCardClicked(projectId) {
    this.router.navigateByUrl('projects/' + projectId + '/experiments');
  }

  search(term: string) {
    this.store.dispatch(new SetProjectsSearchQuery(term));
  }

  orderByChanged(sortByFieldName: string) {
    this.store.dispatch(new SetProjectsOrderBy(sortByFieldName));
  }

  projectNameChanged(updatedProject) {
    this.store.dispatch(new ProjectUpdated(updatedProject));
  }

  deleteProject(projectId) {
    this.deleteProjectId = projectId;
    this.store.dispatch(new CheckProjectForDeletion(projectId));
  }

  loadMore() {
    this.store.dispatch(new GetAllProjects());
  }
}
