import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectRouterQueryParams} from '../core/reducers/router-reducer';
import {Observable, Subscription} from 'rxjs';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {selectNavigationPreferences} from './reducers';
import {debounceTime, filter, withLatestFrom} from 'rxjs/operators';
import {resetSelectCompareHeader, setNavigationPreferences} from './actions/compare-header.actions';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {getCompanyTags, setBreadcrumbsOptions, setSelectedProject} from '@common/core/actions/projects.actions';
import {selectSelectedProject} from '@common/core/reducers/projects.reducer';
import {Project} from '~/business-logic/model/projects/project';
import {TitleCasePipe} from '@angular/common';
import {resetSelectModelState} from '@common/select-model/select-model.actions';
import {selectProjectType} from '~/core/reducers/view.reducer';
import {ALL_PROJECTS_OBJECT} from '@common/core/effects/projects.effects';

@Component({
  selector: 'sm-experiments-compare',
  templateUrl: './experiments-compare.component.html',
  styleUrls: ['./experiments-compare.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentsCompareComponent implements OnInit, OnDestroy {
  private subs = new Subscription();
  private queryParams: Params;
  public entityType: EntityTypeEnum;
  public entityTypeEnum = EntityTypeEnum;
  private selectedProject$: Observable<Project>;
  private modelsFeature: boolean;

  constructor(private store: Store, private router: Router, private activatedRoute: ActivatedRoute, private titleCasePipe: TitleCasePipe) {
    // updating URL with store query params
    this.selectedProject$ = this.store.select(selectSelectedProject);
    this.entityType = this.activatedRoute.snapshot.data.entityType;
    this.modelsFeature = this.activatedRoute.snapshot.data?.setAllProject;
    if (this.modelsFeature) {
      this.store.dispatch(getCompanyTags());
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.store.dispatch(resetSelectCompareHeader({fullReset: true}));
    this.store.dispatch(resetSelectModelState({fullReset: true}));
  }

  ngOnInit(): void {
    // Update store with url query params on load
    this.subs.add(this.selectedProject$.pipe(filter(selectedProject => (this.modelsFeature && !selectedProject))).subscribe(() =>
      this.store.dispatch(setSelectedProject({project: ALL_PROJECTS_OBJECT}))
  ));
    this.subs.add(this.store.select(selectNavigationPreferences).pipe(debounceTime(10)).subscribe((queryParams) => {
      this.router.navigate(
        [],
        {
          relativeTo: this.activatedRoute,
          queryParams,
          queryParamsHandling: 'merge'
        });
    }));

    this.subs.add(this.store.select(selectRouterQueryParams).subscribe((queryParams) => this.queryParams = queryParams));
    this.store.dispatch(setNavigationPreferences({navigationPreferences: this.queryParams}));
    this.setupBreadcrumbsOptions();
  }

  updateUrl(ids: string[]) {
    this.router.navigate(
      [{ids}, ...this.activatedRoute.firstChild?.snapshot.url.map(segment => segment.path)],
      {
        relativeTo: this.activatedRoute,
      });
  }

  setupBreadcrumbsOptions() {
    this.subs.add(this.selectedProject$.pipe(
      withLatestFrom(this.store.select(selectProjectType))
    ).subscribe(([selectedProject, projectType]) => {
      const projectTypeBasePath = {
        projects: 'projects',
        datasets: 'datasets/simple',
        pipelines: 'pipelines'
      };
      if (this.modelsFeature) {
        this.store.dispatch(setBreadcrumbsOptions({
          breadcrumbOptions: {
            showProjects: false,
            featureBreadcrumb: {name: 'Models', url: 'models'},
            subFeatureBreadcrumb: {
              name: `Compare ${this.titleCasePipe.transform(this.entityType)}s`
            },
          }
        }));
      } else {
        this.store.dispatch(setBreadcrumbsOptions({
          breadcrumbOptions: {
            showProjects: !!selectedProject,
            featureBreadcrumb: {
              name: this.titleCasePipe.transform(projectType),
              url: projectType
            },
            subFeatureBreadcrumb: {
              name: `Compare ${this.titleCasePipe.transform(this.entityType)}s`
            },
            projectsOptions: {
              basePath: projectTypeBasePath[projectType],
              filterBaseNameWith: null,
              compareModule: null,
              showSelectedProject: selectedProject && selectedProject?.id !== '*',
              ...(selectedProject && {
                selectedProjectBreadcrumb: {
                  name: selectedProject?.id === '*' ? `All ${this.titleCasePipe.transform(this.entityType)}s` : selectedProject?.basename,
                  url: `${projectTypeBasePath[projectType]}/${selectedProject?.id}/${this.entityType === 'model' ? 'model' : 'experiment'}s`
                }
              })
            }
          }
        }));
      }
    }));
  }
}
