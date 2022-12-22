import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectRouterConfig, selectRouterQueryParams} from '../../core/reducers/router-reducer';
import {debounceTime, filter} from 'rxjs/operators';
import {selectBreadcrumbsStrings} from '../layout.reducer';
import {ActivatedRoute} from '@angular/router';
import {combineLatest, fromEvent, Subscription} from 'rxjs';
import {formatStaticCrumb, prepareNames} from '~/layout/breadcrumbs/breadcrumbs.utils';
import {addMessage} from '../../core/actions/layout.actions';
import {ConfigurationService} from '../../shared/services/configuration.service';
import {GetCurrentUserResponseUserObjectCompany} from '~/business-logic/model/users/getCurrentUserResponseUserObjectCompany';
import {selectIsDeepMode, selectRootProjects} from '../../core/reducers/projects.reducer';
import {getAllSystemProjects} from '@common/core/actions/projects.actions';
import {castArray, isEqual} from 'lodash/fp';
import {selectCustomProject} from '@common/experiments-compare/reducers';
import {selectIsSearching} from '../../common-search/common-search.reducer';
import {MESSAGES_SEVERITY} from '@common/constants';


export interface IBreadcrumbsLink {
  name?: string;
  url?: string;
  subCrumbs?: { name: string; url: string }[];
  isProject?: boolean;
}

@Component({
  selector: 'sm-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
  public breadcrumbs: Array<IBreadcrumbsLink> = [];
  public currentUrl: string;
  public showShareButton: boolean = false;
  public isCommunity: boolean;
  public archive: boolean;
  public workspaceNeutral: boolean;
  public isDeep: boolean;
  public subProjectsMenuIsOpen: boolean;
  public lastSegment: string;
  public shouldCollapse: boolean;
  private previousProjectNames: any;
  private tempBread:  Array<IBreadcrumbsLink> = [];
  private routeConfig: Array<string> = [];
  public breadcrumbsStrings;
  private sub = new Subscription();
  private isSearching$ = this.store.select(selectIsSearching);

  @Input() activeWorkspace: GetCurrentUserResponseUserObjectCompany;
  @ViewChild('container') private breadCrumbsContainer: ElementRef;
  private expandedSize: number;

  constructor(
    private store: Store<any>,
    public route: ActivatedRoute,
    private configService: ConfigurationService,
    private cd: ChangeDetectorRef,
    private ref: ElementRef
  ) {}

  ngOnInit() {
    this.sub.add(fromEvent(window, 'resize')
      .pipe(debounceTime(100))
      .subscribe(() => {
        this.calcOverflowing();
        this.cd.detectChanges();
      })
    );

    this.sub.add(this.isSearching$.pipe(debounceTime(300)).subscribe(() => {
        if (this.checkIfBreadcrumbsInitiated() && !this.shouldCollapse) {
          this.calcOverflowing();
          this.cd.detectChanges();
        }
      })
    );

    this.sub.add(this.configService.globalEnvironmentObservable.subscribe(env => this.isCommunity = env.communityServer));

    this.sub.add(this.store.select(selectIsDeepMode).subscribe(isDeep => {
        this.isDeep = isDeep;
        this.cd.detectChanges();
      })
    );

    this.sub.add(combineLatest([
        this.store.select(selectRouterConfig),
        this.store.select(selectBreadcrumbsStrings),
        this.store.select(selectCustomProject),
        this.store.select(selectRouterQueryParams),
        this.store.select(selectRootProjects),
      ]).pipe(
        debounceTime(200),
        filter(([, names]) => !!names)
      ).subscribe(([config, names, isPipelines, params]) => {
        this.archive = !!params?.archive;
        this.routeConfig = (!config?.includes('compare-experiments') && names.project?.id === '*') ? config?.filter(c => c !== ':projectId') :
          this.isDeep ? config : config?.filter( c => !['experiments', 'models', 'dataviews'].includes(c));
        const experimentFullScreen = config?.[4] === ('output');
        this.breadcrumbsStrings = prepareNames(names, isPipelines, experimentFullScreen);
        if (!isEqual(this.previousProjectNames, this.breadcrumbsStrings[':projectId']?.subCrumbs) &&
          this.breadcrumbsStrings[':projectId']?.subCrumbs?.map(project => project.name).includes(undefined)) {
          this.previousProjectNames = this.breadcrumbsStrings[':projectId']?.subCrumbs;
          this.store.dispatch(getAllSystemProjects());
        }
        this.refreshBreadcrumbs();
        let route = this.route.snapshot;
        let hide = false;
        while (route.firstChild) {
          route = route.firstChild;
          if (route.data.workspaceNeutral !== undefined) {
            hide = route.data.workspaceNeutral;
          }
        }
        this.lastSegment = route.parent?.url[0]?.path;
        this.workspaceNeutral = hide;
        this.cd.detectChanges();
      })
    );
  }

  private calcOverflowing() {
    if (!this.shouldCollapse) {
      this.expandedSize = this.breadCrumbsContainer?.nativeElement.scrollWidth ;
    }
    this.shouldCollapse = this.ref?.nativeElement.clientWidth < this.expandedSize;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private refreshBreadcrumbs(): Array<IBreadcrumbsLink> {
    if (!this.routeConfig) {
      return;
    }
    this.tempBread = this.routeConfig
      .reduce((acc, config) => {
        const parts = this.breadcrumbsStrings?.[config];
        if (Array.isArray(parts)) {
          parts.forEach(part => {
            const previous = acc.slice(-1)[0]; // get the last item in the array
            const url = part.url ? `${previous ? previous?.url : ''}/${part.url}` : '';
            const isProject = config === ':projectId';
            acc.push({name: part?.name ?? '', url, isProject});
          });
        } else {
          const part = parts;
          const id = this.getRouteId(config);
          const isProject = config === ':projectId';
          let url;
          if (part?.url === null) {
            url = '';
          } else {
            const previous = acc.slice(-1)[0]; // get the last item in the array
            url = `${previous ? previous?.url : ''}/${id}`;
          }
          acc.push({name: part?.name ?? '', url, isProject});
        }
        return acc;
      }, [{url: '', name: '', isProject: true}])
      .filter((i) => !!i.name);
    const rootCrumb = formatStaticCrumb(this.routeConfig[0]);
    this.tempBread = [...castArray(rootCrumb), ...this.tempBread];
    if(!isEqual(this.tempBread, this.breadcrumbs)){
      this.shouldCollapse = false;
      this.breadcrumbs = this.tempBread;
    }
    setTimeout(() => {
      if (this.checkIfBreadcrumbsInitiated()) {
        this.calcOverflowing();
      }
    }, 0);
    // this.showShareButton = !(this.routeConfig.includes('login') || this.routeConfig.includes('dashboard'));
  }

  private getRouteId(config: string) {
    return this.breadcrumbsStrings?.[config]?.url ?? config;
  }

  openShareModal() {
    this.currentUrl = window.location.href;
  }

  copyToClipboardSuccess() {
    this.store.dispatch(addMessage(MESSAGES_SEVERITY.SUCCESS, 'URL copied successfully'));
  }

  checkIfBreadcrumbsInitiated() {
    return this.breadcrumbs && this.routeConfig && this.breadcrumbs.length <= this.routeConfig.length;
  }

  get subProjects() {
    return this.breadcrumbsStrings?.[':projectId']?.subCrumbs;
  }

  subProjectsMenuOpened(b: boolean) {
    this.subProjectsMenuIsOpen = b;
  }
}
