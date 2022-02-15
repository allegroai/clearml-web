import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {
  CommonProjectReadyForDeletion,
  selectNoMoreProjects,
  selectProjectReadyForDeletion,
  selectProjectsData,
  selectProjectsOrderBy,
  selectProjectsSortOrder
} from '../../common-projects.reducer';
import {
  CheckProjectForDeletion,
  GetAllProjectsPageProjects,
  ProjectUpdated,
  ResetProjects,
  ResetProjectsSearchQuery,
  ResetReadyToDelete,
  SetProjectsOrderBy,
  setProjectsSearchQuery
} from '../../common-projects.actions';
import {Router} from '@angular/router';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ProjectsGetAllResponseSingle} from '../../../../business-logic/model/projects/projectsGetAllResponseSingle';
import {ProjectDialogComponent} from '../../../shared/project-dialog/project-dialog.component';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  map,
  skip,
  withLatestFrom
} from 'rxjs/operators';
import {ConfirmDialogComponent} from '../../../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import * as coreProjectsActions from '../../../core/actions/projects.actions';
import {setDeep, setSelectedProjectId} from '../../../core/actions/projects.actions';
import {InitSearch, ResetSearch} from '../../../common-search/common-search.actions';
import {ICommonSearchState, selectSearchQuery} from '../../../common-search/common-search.reducer';
import {
  getDeletePopupEntitiesList,
  getDeleteProjectPopupStatsBreakdown,
  isDeletableProject,
  readyForDeletionFilter
} from '../../../../features/projects/projects-page.utils';
import {selectRouterParams} from '../../../core/reducers/router-reducer';
import {get} from 'lodash/fp';
import {selectShowOnlyUserWork} from '../../../core/reducers/users-reducer';
import {Project} from '../../../../business-logic/model/projects/project';
import {CommonDeleteDialogComponent} from '../../../shared/entity-page/entity-delete/common-delete-dialog.component';
import {resetDeleteState} from '../../../shared/entity-page/entity-delete/common-delete-dialog.actions';
import {EntityTypeEnum} from '../../../../shared/constants/non-common-consts';
import {StatsStatusCount} from '../../../../business-logic/model/projects/statsStatusCount';
import {isExample} from '../../../shared/utils/shared-utils';
import {selectSelectedProject} from '../../../core/reducers/projects.reducer';
import {Projects} from '@angular/cli/lib/config/workspace-schema';

@Component({
  selector: 'sm-common-projects-page',
  templateUrl: './common-projects-page.component.html',
  styleUrls: ['./common-projects-page.component.scss']
})
export class CommonProjectsPageComponent implements OnInit, OnDestroy {
  public projectsList$: Observable<Projects[]>;
  public projectsOrderBy$: Observable<string>;

  /* eslint-disable @typescript-eslint/naming-convention */
  public ALL_EXPERIMENTS_CARD: ProjectsGetAllResponseSingle = {
    id: '*',
    name: 'All Experiments',
    stats: {
      active: {
        status_count: {queued: '∞' as any, in_progress: '∞' as any, published: '∞' as any},
        total_runtime: 0
      }
    }
  };

  public ROOT_EXPERIMENTS_CARD: ProjectsGetAllResponseSingle = {
    name: '[.]',
    stats: {
      active: {
        status_count: {queued: 0, in_progress: 0, closed: 0},
        total_runtime: 0
      }
    }
  };
  /* eslint-enable @typescript-eslint/naming-convention */
  private searchSubs: Subscription;
  private projectReadyForDeletion$: Observable<CommonProjectReadyForDeletion>;
  private projectReadyForDeletionSub: Subscription;
  private searchQuery$: Observable<ICommonSearchState['searchQuery']>;
  public noMoreProjects$: Observable<boolean>;
  public projectsSortOrder$: Observable<1 | -1>;
  private projectDialog: MatDialogRef<ProjectDialogComponent, any>;
  public selectedProjectId$: Observable<string>;
  private showOnlyUserWorkSub$: Subscription;
  private selectedProjectSub: Subscription;
  private selectedProject$: Observable<Project>;
  private selectedProjectIdSub: Subscription;

  constructor(public store: Store<any>, private router: Router, private dialog: MatDialog) {
    this.searchQuery$ = this.store.select(selectSearchQuery);
    this.projectsOrderBy$ = this.store.select(selectProjectsOrderBy);
    this.projectsSortOrder$ = this.store.select(selectProjectsSortOrder);
    this.noMoreProjects$ = this.store.select(selectNoMoreProjects);
    this.selectedProjectId$ = this.store.select(selectRouterParams).pipe(map(params => get('projectId', params)));
    this.selectedProject$ = this.store.select(selectSelectedProject);

    this.projectReadyForDeletion$ = this.store.select(selectProjectReadyForDeletion).pipe(
      distinctUntilChanged(),
      filter(readyForDeletion => readyForDeletionFilter(readyForDeletion)));
    this.projectsList$ = combineLatest([
      this.store.select(selectProjectsData),
      this.store.select(selectSelectedProject)
    ]).pipe(
      debounceTime(0),
      withLatestFrom(this.selectedProjectId$, this.searchQuery$),
      map(([[projectsList, selectedProject], selectedProjectId, searchQuery]) => {
        if ((searchQuery?.query || searchQuery?.regExp)) {
          return projectsList;
        } else {
          if (selectedProject?.sub_projects?.length === 0 && selectedProjectId === selectedProject?.id) {
            this.router.navigateByUrl(`projects/${selectedProject.id}/experiments`);
            return [];
          }
          const pageProjectsList = ([{
            ...((selectedProjectId && selectedProject) ? selectedProject : this.ALL_EXPERIMENTS_CARD),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            id: selectedProjectId ? selectedProjectId : '*', name: 'All Experiments', sub_projects: null,
            ...(selectedProject && {stats: {active: this.calculateAllExperimentsProjectStats(selectedProject, projectsList)}})
          } as ProjectsGetAllResponseSingle]);
          return pageProjectsList.concat(projectsList);
        }
      })
    );

    this.syncAppSearch();
  }

  ngOnInit() {
    // this.store.dispatch(new ResetSelectedProject());
    this.store.dispatch(setDeep({deep: false}));
    this.store.dispatch(new GetAllProjectsPageProjects());

    this.selectedProjectIdSub = this.selectedProjectId$.pipe(
      filter(projectId => !projectId),
      distinctUntilChanged(),
    ).subscribe(() => {
        this.store.dispatch(new ResetProjectsSearchQuery());
        this.store.dispatch(new GetAllProjectsPageProjects());
      }
    );
    this.selectedProjectSub = this.selectedProject$.pipe(
      filter(project => (!!project)),
      distinctUntilKeyChanged('id'),
      skip(1),
    ).subscribe(() => {
      this.store.dispatch(new ResetProjectsSearchQuery());
      this.store.dispatch(new GetAllProjectsPageProjects());
    });
    this.showOnlyUserWorkSub$ = this.store.select(selectShowOnlyUserWork).pipe(skip(1)).subscribe(() => {
      this.store.dispatch(new ResetProjectsSearchQuery());
      this.store.dispatch(new GetAllProjectsPageProjects());
    });

    this.projectReadyForDeletionSub = this.projectReadyForDeletion$.subscribe(readyForDeletion => {
      if (isDeletableProject(readyForDeletion)) {
        this.showDeleteDialog(readyForDeletion);
      } else {
        this.showConfirmDialog(readyForDeletion);
      }
    });
  }

  private showConfirmDialog(readyForDeletion: CommonProjectReadyForDeletion) {
    const confirmDialogRef: MatDialogRef<any, boolean> = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Unable to Delete Project`,
        body: `You cannot delete project "<b>${readyForDeletion.project.name}</b>" with un-archived ${getDeletePopupEntitiesList()}. <br/>
                   You have: ${getDeleteProjectPopupStatsBreakdown(readyForDeletion, 'unarchived')} in this project. <br/>
                   If you wish to delete this project, you must archive, delete, or move these items to another project.`,
        no: 'OK',
        iconClass: 'i-alert',
      }
    });
    confirmDialogRef.afterClosed().subscribe(() => {
      this.store.dispatch(new ResetReadyToDelete());
    });
  }

  private showDeleteDialog(readyForDeletion: CommonProjectReadyForDeletion) {
    const confirmDialogRef = this.dialog.open(CommonDeleteDialogComponent, {
      data: {
        entity: readyForDeletion.project,
        numSelected: 1,
        entityType: EntityTypeEnum.project,
        projectStats: readyForDeletion
      },
      width: '600px',
      disableClose: true
    });
    confirmDialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.store.dispatch(resetDeleteState());
        this.store.dispatch(new ResetProjects());
        this.store.dispatch(new GetAllProjectsPageProjects());
      }
    });
  }

  ngOnDestroy() {
    this.stopSyncSearch();
    this.projectReadyForDeletionSub.unsubscribe();
    this.showOnlyUserWorkSub$.unsubscribe();
    this.selectedProjectSub.unsubscribe();
    this.selectedProjectIdSub.unsubscribe();
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

  public projectCardClicked(project: ProjectsGetAllResponseSingle) {
    if (project.name === 'All Experiments') {
      this.store.dispatch(setDeep({deep: true}));
    }
    this.router.navigateByUrl((project?.sub_projects?.length > 0) ? `projects/${project.id}/projects` :
      (project.id !== '*' ? `projects/${project.id}` : `projects/${project.id}/experiments`));
    this.store.dispatch(setSelectedProjectId({projectId: project.id, example: isExample(project)}));
  }

  search(query: ICommonSearchState['searchQuery']) {
    this.store.dispatch(setProjectsSearchQuery(query));
  }

  orderByChanged(sortByFieldName: string) {
    this.store.dispatch(new SetProjectsOrderBy(sortByFieldName));
  }

  projectNameChanged(updatedProject) {
    this.store.dispatch(new ProjectUpdated(updatedProject));
  }

  deleteProject(project: Project) {
    this.store.dispatch(new CheckProjectForDeletion(project));
  }

  loadMore() {
    this.store.dispatch(new GetAllProjectsPageProjects());
  }


  openProjectDialog(projectId?: string, mode?: string) {
    this.projectDialog = this.dialog.open(ProjectDialogComponent, {
      data: {
        mode,
        projectId
      }
    });
    this.projectDialog.afterClosed().subscribe(projectHasBeenUpdated => {
      if (projectHasBeenUpdated) {
        this.store.dispatch(new ResetProjectsSearchQuery());
        this.store.dispatch(new GetAllProjectsPageProjects());
        this.store.dispatch(coreProjectsActions.getAllSystemProjects());
      }
    });
  }

  private calculateAllExperimentsProjectStats(selectedProject: ProjectsGetAllResponseSingle, projectsList: ProjectsGetAllResponseSingle[]): StatsStatusCount {
    const stats: StatsStatusCount = {};
    for (const key of Object.keys(selectedProject.stats.active)) {
      if(['completed_tasks', 'running_tasks', 'total_tasks', 'total_runtime'].includes(key)){
        stats[key] = projectsList.map(project => (project.stats.active[key] || 0)).reduce((a, b) => a + b, 0);
      }
    }
    return stats;
  }


}
