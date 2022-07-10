import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {
  CommonProjectReadyForDeletion,
  selectNoMoreProjects,
  selectProjectReadyForDeletion,
  selectProjects,
  selectProjectsOrderBy,
  selectProjectsSortOrder
} from '../../common-projects.reducer';
import {
  checkProjectForDeletion,
  getAllProjectsPageProjects,
  resetProjects,
  resetProjectsSearchQuery,
  resetReadyToDelete,
  setProjectsOrderBy,
  setProjectsSearchQuery, updateProject
} from '../../common-projects.actions';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ProjectsGetAllResponseSingle} from '~/business-logic/model/projects/projectsGetAllResponseSingle';
import {ProjectDialogComponent} from '@common/shared/project-dialog/project-dialog.component';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  map,
  skip, tap,
  withLatestFrom
} from 'rxjs/operators';
import {ConfirmDialogComponent} from '@common/shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import * as coreProjectsActions from '../../../core/actions/projects.actions';
import {setDeep, setSelectedProjectId} from '@common/core/actions/projects.actions';
import {initSearch, resetSearch} from '@common/common-search/common-search.actions';
import {SearchState, selectSearchQuery} from '@common/common-search/common-search.reducer';
import {
  getDeletePopupEntitiesList,
  getDeleteProjectPopupStatsBreakdown,
  isDeletableProject,
  readyForDeletionFilter
} from '~/features/projects/projects-page.utils';
import {selectRouterParams} from '@common/core/reducers/router-reducer';
import {get} from 'lodash/fp';
import {selectShowOnlyUserWork} from '@common/core/reducers/users-reducer';
import {Project} from '~/business-logic/model/projects/project';
import {CommonDeleteDialogComponent} from '@common/shared/entity-page/entity-delete/common-delete-dialog.component';
import {resetDeleteState} from '@common/shared/entity-page/entity-delete/common-delete-dialog.actions';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {isExample} from '@common/shared/utils/shared-utils';
import {selectSelectedProject} from '@common/core/reducers/projects.reducer';

@Component({
  selector: 'sm-common-projects-page',
  templateUrl: './common-projects-page.component.html',
  styleUrls: ['./common-projects-page.component.scss']
})
export class CommonProjectsPageComponent implements OnInit, OnDestroy {
  public projectsList$: Observable<Project[]>;
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
  public noMoreProjects$: Observable<boolean>;
  public projectsSortOrder$: Observable<1 | -1>;
  public searching: boolean;
  public selectedProjectId$: Observable<string>;
  public allExamples: boolean;
  /* eslint-enable @typescript-eslint/naming-convention */
  private searchSubs: Subscription;
  private projectReadyForDeletion$: Observable<CommonProjectReadyForDeletion>;
  private projectReadyForDeletionSub: Subscription;
  private readonly searchQuery$: Observable<SearchState['searchQuery']>;
  private projectDialog: MatDialogRef<ProjectDialogComponent, any>;
  private showOnlyUserWorkSub: Subscription;
  private selectedProjectSub: Subscription;
  private selectedProject$: Observable<Project>;
  private selectedProjectIdSub: Subscription;
  private projectId: string;

  constructor(
    protected store: Store<any>,
    protected router: Router,
    protected route: ActivatedRoute,
    protected dialog: MatDialog
  ) {
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
      this.store.select(selectProjects),
      this.store.select(selectSelectedProject)
    ]).pipe(
      debounceTime(0),
      withLatestFrom(this.selectedProjectId$, this.searchQuery$),
      map(([[projectsList, selectedProject], selectedProjectId, searchQuery]) => {
        this.searching = searchQuery?.query.length > 0;
        this.allExamples = projectsList?.length > 0 && projectsList?.every(project => isExample(project));
        if (projectsList === null) {
          return null;
        }
        if ((searchQuery?.query || searchQuery?.regExp)) {
          return projectsList;
        } else {
          if (selectedProject?.sub_projects?.length === 0 && selectedProjectId === selectedProject?.id) {
            this.router.navigate(['../experiments'], {relativeTo: this.route.parent});
            return [];
          }
          const pageProjectsList = this.getExtraProjects(selectedProjectId, selectedProject);
          return pageProjectsList.concat(projectsList);
        }
      }),
    );

    this.syncAppSearch();
  }

  protected getExtraProjects(selectedProjectId, selectedProject) {
    return [{
      ...((selectedProjectId && selectedProject) ? selectedProject : this.ALL_EXPERIMENTS_CARD),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      id: selectedProjectId ? selectedProjectId : '*', name: 'All Experiments', sub_projects: null,
    } as ProjectsGetAllResponseSingle];
  }

  ngOnInit() {
    // this.store.dispatch(new ResetSelectedProject());
    this.store.dispatch(setDeep({deep: false}));
    this.store.dispatch(getAllProjectsPageProjects({}));

    this.selectedProjectIdSub = this.selectedProjectId$.pipe(
      tap(projectId => this.projectId = projectId),
      filter(projectId => !projectId),
      distinctUntilChanged(),
    ).subscribe(() => {
        this.store.dispatch(resetProjectsSearchQuery());
        this.store.dispatch(getAllProjectsPageProjects({}));
      }
    );
    this.selectedProjectSub = this.selectedProject$.pipe(
      filter(project => (!!project)),
      distinctUntilKeyChanged('id'),
      skip(1),
    ).subscribe(() => {
      this.store.dispatch(resetProjectsSearchQuery());
      this.store.dispatch(getAllProjectsPageProjects({}));
    });
    this.showOnlyUserWorkSub = this.store.select(selectShowOnlyUserWork)
      .pipe(skip(1))
      .subscribe(() => {
        this.store.dispatch(resetProjectsSearchQuery());
        this.store.dispatch(getAllProjectsPageProjects({}));
      });

    this.projectReadyForDeletionSub = this.projectReadyForDeletion$.subscribe(readyForDeletion => {
      if (isDeletableProject(readyForDeletion)) {
        this.showDeleteDialog(readyForDeletion);
      } else {
        this.showConfirmDialog(readyForDeletion);
      }
    });
  }

  protected getDeletePopupEntitiesList() {
    return getDeletePopupEntitiesList();
  }

  private showConfirmDialog(readyForDeletion: CommonProjectReadyForDeletion) {
    const name = this.getName();
    const confirmDialogRef: MatDialogRef<any, boolean> = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Unable to Delete ${name[0].toUpperCase()}${name.slice(1)}`,
        body: `You cannot delete ${name} "<b>${readyForDeletion.project.name}</b>" with un-archived ${this.getDeletePopupEntitiesList()}. <br/>
                   You have: ${getDeleteProjectPopupStatsBreakdown(
                     readyForDeletion,
          'unarchived',
                    name === 'project' ? 'experiments' : 'runs'
          )} in this ${name}. <br/>
                   If you wish to delete this ${name}, you must archive${name === 'project' ? ', delete, or move': ' or delete'} these items to another ${name}.`,
        no: 'OK',
        iconClass: 'i-alert',
      }
    });
    confirmDialogRef.afterClosed().subscribe(() => {
      this.store.dispatch(resetReadyToDelete());
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
        this.store.dispatch(resetProjects());
        this.store.dispatch(getAllProjectsPageProjects({}));
      }
    });
  }

  ngOnDestroy() {
    this.stopSyncSearch();
    this.projectReadyForDeletionSub.unsubscribe();
    this.showOnlyUserWorkSub.unsubscribe();
    this.selectedProjectSub.unsubscribe();
    this.selectedProjectIdSub.unsubscribe();
    this.store.dispatch(resetReadyToDelete());
    this.store.dispatch(resetProjectsSearchQuery());
  }

  stopSyncSearch() {
    this.store.dispatch(resetSearch());
    this.searchSubs.unsubscribe();
  }


  syncAppSearch() {
    this.store.dispatch(initSearch({payload: `Search for ${this.getName()}s`}));
    this.searchSubs = this.searchQuery$.pipe(skip(1)).subscribe(query => this.search(query));
  }

  public projectCardClicked(project: ProjectsGetAllResponseSingle) {
    if (project.name === 'All Experiments') {
      this.store.dispatch(setDeep({deep: true}));
    }
    this.router.navigate((project?.sub_projects?.length > 0) ? ['projects', project.id, 'projects'] :
        (project.id !== '*' ? ['projects', project.id] : ['projects', project.id, 'experiments'])
    );
    this.store.dispatch(setSelectedProjectId({projectId: project.id, example: isExample(project)}));
  }

  search(query: SearchState['searchQuery']) {
    this.store.dispatch(setProjectsSearchQuery(query));
  }

  orderByChanged(sortByFieldName: string) {
    this.store.dispatch(setProjectsOrderBy({orderBy: sortByFieldName}));
  }

  projectNameChanged(updatedProject: {id: string; name: string}) {
    this.store.dispatch(updateProject({id: updatedProject.id, changes: {name: updatedProject.name}}));
  }

  deleteProject(project: Project) {
    this.store.dispatch(checkProjectForDeletion({project}));
  }

  loadMore() {
    this.store.dispatch(getAllProjectsPageProjects({}));
  }


  openProjectDialog(mode?: string, projectId?: string) {
    this.projectDialog = this.dialog.open(ProjectDialogComponent, {
      data: {
        mode,
        projectId
      }
    });
    this.projectDialog.afterClosed().subscribe(projectHasBeenUpdated => {
      if (projectHasBeenUpdated) {
        this.store.dispatch(resetProjectsSearchQuery());
        this.store.dispatch(getAllProjectsPageProjects({}));
        this.store.dispatch(coreProjectsActions.getAllSystemProjects());
      }
    });
  }

  protected getName(): string {
    return 'project';
  }
}
