import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit, QueryList,
  ViewChild, ViewChildren
} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectRouterConfig, selectRouterQueryParams} from '../../core/reducers/router-reducer';
import {debounceTime} from 'rxjs/operators';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {combineLatest, fromEvent, Observable, Subscription} from 'rxjs';
import {addMessage} from '../../core/actions/layout.actions';
import {ConfigurationService} from '../../shared/services/configuration.service';
import {
  GetCurrentUserResponseUserObjectCompany
} from '~/business-logic/model/users/getCurrentUserResponseUserObjectCompany';
import {selectIsDeepMode, selectShowHiddenUserSelection} from '../../core/reducers/projects.reducer';
import {selectIsSearching} from '../../common-search/common-search.reducer';
import {MESSAGES_SEVERITY} from '@common/constants';
import {setBreadcrumbs} from '@common/core/actions/router.actions';
import {selectBreadcrumbs} from '@common/core/reducers/view.reducer';
import {MatMenuModule} from '@angular/material/menu';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {NgForOf, NgIf} from '@angular/common';
import {
  ShowTooltipIfEllipsisDirective
} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';
import {ClipboardModule} from 'ngx-clipboard';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {BreadcrumbsService} from '@common/shared/services/breadcrumbs.service';
import {TagListComponent} from '@common/shared/ui-components/tags/tag-list/tag-list.component';
import {cloneItemIntoDummy} from '@common/shared/utils/shared-utils';

export enum CrumbTypeEnum {
  Workspace = 'Workspace',
  Feature = 'Feature',
  Project = 'Project',
  SubFeature = 'SubFeature',
}

export interface IBreadcrumbsLink {
  name?: string;
  url?: string;
  subCrumbs?: { name: string; url: string; hidden?: boolean }[];
  isProject?: boolean;
  type?: CrumbTypeEnum;
  hidden?: boolean;
  collapsable?: boolean;
  example?: boolean;
  tags?: string[];
  onlyWithProject?: boolean;
}

export interface IBreadcrumbsOptions {
  showProjects: boolean;
  featureBreadcrumb: IBreadcrumbsLink;
  subFeatureBreadcrumb?: IBreadcrumbsLink;
  projectsOptions?: {
    basePath: string;
    noSubProjectsRedirectPath?: string;
    filterBaseNameWith: string[];
    compareModule: string;
    showSelectedProject: boolean;
    selectedProjectBreadcrumb: IBreadcrumbsLink;
  };
}

@Component({
  selector: 'sm-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatMenuModule,
    TooltipDirective,
    NgForOf,
    ShowTooltipIfEllipsisDirective,
    ClipboardModule,
    RouterLink,
    NgIf,
    ClickStopPropagationDirective,
    TagListComponent
  ],
  standalone: true
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
  public breadcrumbs: IBreadcrumbsLink[][] = [];
  public currentUrl: string;
  public showShareButton: boolean = false;
  public isCommunity: boolean;
  public archive: boolean;
  public workspaceNeutral: boolean;
  public isDeep: boolean;
  public subProjectsMenuIsOpen: boolean;
  public shouldCollapse: boolean;
  private sub = new Subscription();
  private isSearching$ = this.store.select(selectIsSearching);

  @Input() activeWorkspace: GetCurrentUserResponseUserObjectCompany;
  @ViewChild('container') private breadCrumbsContainer: ElementRef<HTMLDivElement>;
  @ViewChildren('crumb') private crumbElements: QueryList<ElementRef<HTMLDivElement>>;
  public breadcrumbs$: Observable<IBreadcrumbsLink[][]>;
  public showHidden: boolean;
  public projectFeature: boolean;

  constructor(
    private store: Store,
    public route: ActivatedRoute,
    private configService: ConfigurationService,
    private cd: ChangeDetectorRef,
    private breadcrumbsService: BreadcrumbsService // don't delete
  ) {
    this.breadcrumbs$ = this.store.select(selectBreadcrumbs);
  }

  ngOnInit() {
    this.sub.add(fromEvent(window, 'resize')
      .pipe(debounceTime(100))
      .subscribe(() => {
        this.calcOverflowing();
        this.cd.detectChanges();
      })
    );

    this.sub.add(this.breadcrumbs$.subscribe(breadcrumbs => {
      this.breadcrumbs = breadcrumbs
        .map(breadcrumbsGroup => breadcrumbsGroup?.filter( breadcrumb =>
          (!breadcrumb.hidden) || (this.showHidden && this.projectFeature)
        ))
        .filter(breadcrumbsGroup => breadcrumbsGroup?.length > 0);
      this.cd.detectChanges();
    }));

    this.sub.add(this.breadcrumbs$.pipe(debounceTime(100)).subscribe(() => {
      this.calcOverflowing();
      this.cd.detectChanges();
    }));

    this.sub.add(this.isSearching$.pipe(debounceTime(100)).subscribe(() => {
        if (!this.shouldCollapse) {
          this.calcOverflowing();
          this.cd.detectChanges();
        }
      })
    );

    this.sub.add(this.configService.globalEnvironmentObservable.subscribe(env => this.isCommunity = env.communityServer));

    // todo: check if needed
    this.sub.add(this.store.select(selectIsDeepMode).subscribe(isDeep => {
        this.isDeep = isDeep;
        this.cd.detectChanges();
      })
    );
    this.sub.add(this.store.select(selectRouterConfig).subscribe(config => {
      let route = this.route.snapshot;
      while (route.firstChild) {
        route = route.firstChild;
      }
      !config?.includes(':projectId') && route?.data?.staticBreadcrumb && this.store.dispatch(setBreadcrumbs({
        breadcrumbs: route?.data?.staticBreadcrumb
      }));
    }));


    this.sub.add(combineLatest([
        this.store.select(selectRouterConfig),
        this.store.select(selectRouterQueryParams),
        this.store.select(selectShowHiddenUserSelection),
      ]).pipe(
        debounceTime(200),
      ).subscribe(([config, params, showHidden]) => {
        this.showHidden = showHidden;
        this.projectFeature = config?.[0] === 'projects';
        this.archive = !!params?.archive;
        let route = this.route.snapshot;
        let hide = false;
        while (route.firstChild) {
          route = route.firstChild;
          if (route.data.workspaceNeutral !== undefined) {
            hide = route.data.workspaceNeutral;
          }
        }
        this.workspaceNeutral = hide;
        this.cd.detectChanges();
      })
    );
  }

  private calcOverflowing() {
    this.shouldCollapse = false;
    this.cd.detectChanges();
    const lastCrumb = this.crumbElements.last.nativeElement;
    const dummyContainer = document.createElement('span');
    dummyContainer.style.position = 'fixed';
    this.breadCrumbsContainer.nativeElement.appendChild(dummyContainer);
    cloneItemIntoDummy(lastCrumb, dummyContainer);
    const width = dummyContainer.offsetWidth;
    this.breadCrumbsContainer.nativeElement.removeChild(dummyContainer);
    this.shouldCollapse = lastCrumb.clientWidth < width;
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  openShareModal() {
    this.currentUrl = window.location.href;
  }

  copyToClipboardSuccess() {
    this.store.dispatch(addMessage(MESSAGES_SEVERITY.SUCCESS, 'URL copied successfully'));
  }


  subProjectsMenuOpened(b: boolean) {
    this.subProjectsMenuIsOpen = b;
  }
}
