import {Injectable, OnDestroy} from '@angular/core';
import {Store} from '@ngrx/store';
import {combineLatest, Subscription} from 'rxjs';
import {selectRouterConfig} from '@common/core/reducers/router-reducer';
import {selectBreadcrumbOptions, selectProjectAncestors} from '@common/core/reducers/projects.reducer';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import {setBreadcrumbs} from '@common/core/actions/router.actions';
import {isExample} from '@common/shared/utils/shared-utils';
import {CrumbTypeEnum, IBreadcrumbsLink} from '@common/layout/breadcrumbs/breadcrumbs.component';
import {setBreadcrumbsOptions} from '@common/core/actions/projects.actions';

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbsService implements OnDestroy {
  private sub = new Subscription();

  constructor(private store: Store) {
    this.sub.add(this.store.select(selectRouterConfig)
      .pipe(
        map(conf => conf?.[0]),
        distinctUntilChanged()
      )
      .subscribe(() => {
          this.store.dispatch(setBreadcrumbsOptions({breadcrumbOptions: null}));
        }
      ));
    this.sub.add(combineLatest([
        this.store.select(selectProjectAncestors),
        this.store.select(selectBreadcrumbOptions)
      ]).pipe(
        filter(([projectAncestors, breadcrumbOptions]) => !!breadcrumbOptions && (!breadcrumbOptions.showProjects || projectAncestors !== null)),
        debounceTime(200),
      ).subscribe(([projectAncestors, breadcrumbOptions]) => {
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
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }


}
