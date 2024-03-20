import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {filter, take} from 'rxjs/operators';
import 'ngx-markdown-editor';
import {
  selectIsDeepMode,
  selectSelectedMetricVariantForCurrProject,
  selectSelectedProject
} from '../core/reducers/projects.reducer';
import {setBreadcrumbsOptions, updateProject} from '../core/actions/projects.actions';
import {Project} from '~/business-logic/model/projects/project';
import {isExample} from '../shared/utils/shared-utils';
import {ContextMenuService} from '@common/shared/services/context-menu.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';


@Component({
  selector: 'sm-project-info',
  templateUrl: './project-info.component.html',
  styleUrls: ['./project-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectInfoComponent implements OnInit, OnDestroy {
  private selectedProject$: Observable<Project>;
  public info: string;
  public editMode: boolean;
  public loading: boolean;
  public project: Project;
  public panelOpen: boolean = false;
  public example: boolean;
  public isDirty: boolean;
  private projectId: string;

  private selectedVariantSub: Subscription;

  constructor(private store: Store, private cdr: ChangeDetectorRef,private contextMenuService: ContextMenuService) {
    this.selectedProject$ = this.store.select(selectSelectedProject);
    this.loading = true;
    this.selectedProject$
      .pipe(
        takeUntilDestroyed(),
        filter(project => !!project?.id)
      )
      .subscribe(project => {
        this.project = project;
        this.example = isExample(project);
        this.info = project.description;
        this.projectId = project.id;
        this.contextMenuService.setupProjectContextMenu('overview', this.projectId);
        this.loading = false;
        this.cdr.markForCheck();
      });
    this.setupBreadcrumbsOptions();
  }

  ngOnInit() {
    this.selectedVariantSub = this.store.select(selectSelectedMetricVariantForCurrProject)
      .pipe(
        filter(data => !!data),
        take(1)
      )
      .subscribe(() => {
        this.setMetricsPanel(true);
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy() {
    this.selectedVariantSub?.unsubscribe();
  }

  setMetricsPanel(open: boolean) {
    this.panelOpen = open;
  }

  saveInfo(info: string) {
    this.store.dispatch(updateProject({id: this.projectId, changes: {description: info}}));
  }

  setupBreadcrumbsOptions() {
    combineLatest([
      this.selectedProject$,
      this.store.select(selectIsDeepMode)
    ])
      .pipe(takeUntilDestroyed())
      .subscribe(([selectedProject, isDeep]) => this.store.dispatch(
        setBreadcrumbsOptions({
          breadcrumbOptions: {
            showProjects: !!selectedProject,
            featureBreadcrumb: {
              name: 'PROJECTS',
              url: 'projects'
            },
            ...(isDeep && selectedProject?.id !== '*' && {
              subFeatureBreadcrumb: {
                name: 'All Experiments'
              }
            }),
            projectsOptions: {
              basePath: 'projects',
              filterBaseNameWith: null,
              compareModule: null,
              showSelectedProject: selectedProject?.id !== '*',
              ...(selectedProject && {
                selectedProjectBreadcrumb: {
                  name: selectedProject?.id === '*' ? 'All Experiments' : selectedProject?.basename,
                  url: `projects/${selectedProject?.id}/projects`
                }
              })
            }
          }
        })
      ));
  }
}
