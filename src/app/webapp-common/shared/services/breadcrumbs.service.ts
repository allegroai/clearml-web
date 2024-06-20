import {inject, Injectable, signal} from '@angular/core';
import {Store} from '@ngrx/store';
import {combineLatest} from 'rxjs';
import {selectBreadcrumbOptions, selectProjectAncestors} from '@common/core/reducers/projects.reducer';
import {debounceTime, distinctUntilChanged, filter, startWith} from 'rxjs/operators';
import {setBreadcrumbs, setWorkspaceNeutral} from '@common/core/actions/router.actions';
import {isExample} from '@common/shared/utils/shared-utils';
import {CrumbTypeEnum, IBreadcrumbsLink} from '@common/layout/breadcrumbs/breadcrumbs.component';
import {setBreadcrumbsOptions} from '@common/core/actions/projects.actions';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {selectFeatureParam, selectHasProjectId} from '@common/layout/layout.selectors';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbsService {
  private store = inject(Store);
  private router = inject(Router);
  public route = inject(ActivatedRoute);
  protected staticBreadcrumb = signal(null)

  constructor() {
    combineLatest([
      this.store.select(selectHasProjectId).pipe(startWith(false)),
      this.router.events.pipe(filter((event) => event instanceof NavigationEnd))
    ])
      .pipe(takeUntilDestroyed())
      .subscribe(([hasProjectId]) => {
        this.setCrumbs(hasProjectId);
      });


    this.store.select(selectFeatureParam)
      .pipe(
        takeUntilDestroyed(),
        distinctUntilChanged()
      )
      .subscribe(() => {
          this.store.dispatch(setBreadcrumbsOptions({breadcrumbOptions: null}));
        }
      );

    combineLatest([
      this.store.select(selectProjectAncestors),
      this.store.select(selectBreadcrumbOptions)
    ])
      .pipe(
        takeUntilDestroyed(),
        debounceTime(200),
        filter(([projectAncestors, breadcrumbOptions]) => !!breadcrumbOptions && (!breadcrumbOptions.showProjects || projectAncestors !== null)),
      )
      .subscribe(([projectAncestors, breadcrumbOptions]) => {
        const crumbAfterProject = breadcrumbOptions.subFeatureBreadcrumb &&
          (!breadcrumbOptions.subFeatureBreadcrumb.onlyWithProject || projectAncestors?.length > 0);
        const projectCrumb = breadcrumbOptions.projectsOptions?.selectedProjectBreadcrumb;
        this.store.dispatch(setBreadcrumbs({
          breadcrumbs: [
            [breadcrumbOptions.featureBreadcrumb],
            ...([projectAncestors
              ?.filter(ancestor =>
                !breadcrumbOptions.projectsOptions.filterBaseNameWith ||
                !breadcrumbOptions.projectsOptions.filterBaseNameWith.includes(ancestor.basename)
              )
              .map(ancestor => ({
                name: ancestor.basename,
                example: isExample(ancestor),
                url: `${breadcrumbOptions.projectsOptions.basePath}/${ancestor.id}/projects`,
                type: CrumbTypeEnum.Project,
                hidden: ancestor.hidden,
                collapsable: true
              } as IBreadcrumbsLink))
              .concat(projectCrumb?.url && crumbAfterProject ?
                [{...projectCrumb, type: CrumbTypeEnum.Project, collapsable: true} as IBreadcrumbsLink] : []
              )
            ]),
            ...(projectCrumb && !(projectCrumb.url && projectAncestors && crumbAfterProject) ?
                [[breadcrumbOptions.projectsOptions.selectedProjectBreadcrumb]] : []
            ),
            ...(breadcrumbOptions.subFeatureBreadcrumb && (!breadcrumbOptions.subFeatureBreadcrumb.onlyWithProject || projectAncestors?.length > 0) ?
                [[breadcrumbOptions.subFeatureBreadcrumb]] : []
            ),
          ]
        }));
      });
  }

  private setCrumbs(hasProjectId: boolean) {
    let route = this.route.snapshot;
    let neutral = false;
    while (route.firstChild) {
      route = route.firstChild;
      if (route.data.workspaceNeutral !== undefined) {
        neutral = route.data.workspaceNeutral;
      }
    }
    const staticBreadcrumb = route?.data?.staticBreadcrumb;
    if (!hasProjectId && staticBreadcrumb) {
      this.store.dispatch(setBreadcrumbs({breadcrumbs: staticBreadcrumb, workspaceNeutral: neutral}));
    } else {
      this.store.dispatch(setWorkspaceNeutral({neutral}));
    }
  }
}
