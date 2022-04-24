import {ApiUsersService} from './business-logic/api-services/users.service';
import {selectCurrentUser} from '@common/core/reducers/users-reducer';
import {Component, OnDestroy, OnInit, ViewEncapsulation, HostListener, Renderer2, Injector} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, Params, RouterEvent} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {selectLoggedOut} from '@common/core/reducers/view.reducer';
import {Store} from '@ngrx/store';
import {get} from 'lodash/fp';
import {selectRouterParams, selectRouterUrl} from '@common/core/reducers/router-reducer';
import {ApiProjectsService} from './business-logic/api-services/projects.service';
import {Project} from './business-logic/model/projects/project';
import {getAllSystemProjects, setSelectedProjectId, updateProject} from '@common/core/actions/projects.actions';
import {selectSelectedProject} from '@common/core/reducers/projects.reducer';
import {MatDialog} from '@angular/material/dialog';
import {getTutorialBucketCredentials} from '@common/core/actions/common-auth.actions';
import {termsOfUseAccepted} from '@common/core/actions/users.actions';
import {distinctUntilChanged, filter, map, tap, withLatestFrom} from 'rxjs/operators';
import * as routerActions from './webapp-common/core/actions/router.actions';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {selectBreadcrumbsStrings} from '@common/layout/layout.reducer';
import {prepareNames} from './layout/breadcrumbs/breadcrumbs.utils';
import {formatStaticCrumb} from '@common/layout/breadcrumbs/breadcrumbs-common.utils';
import {ServerUpdatesService} from '@common/shared/services/server-updates.service';
import {selectAvailableUpdates} from './core/reducers/view.reducer';
import {UPDATE_SERVER_PATH} from './app.constants';
import {aceReady, firstLogin, plotlyReady, setScaleFactor, visibilityChanged} from '@common/core/actions/layout.actions';
import {UiUpdatesService} from '@common/shared/services/ui-updates.service';
import {UsageStatsService} from './core/services/usage-stats.service';
import {dismissSurvey} from './core/actions/layout.actions';
import {getScaleFactor, loadExternalLibrary} from '@common/shared/utils/shared-utils';
import {User} from './business-logic/model/users/user';
import {ConfigurationService} from '@common/shared/services/configuration.service';
import {GoogleTagManagerService} from 'angular-google-tag-manager';
import {selectIsSharedAndNotOwner} from './features/experiments/reducers';
import {TipsService} from '@common/shared/services/tips.service';
import {USER_PREFERENCES_KEY} from '@common/user-preferences';
import {selectIsPipelines} from '@common/experiments-compare/reducers';
import {Environment} from '../environments/base';

@Component({
  selector: 'sm-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, OnDestroy {
  public loggedOut$: Observable<any>;
  public activeFeature: string;
  private urlSubscription: Subscription;
  public selectedProject$: Observable<Project>;
  public projectId: string;
  public isWorkersContext: boolean;
  public updatesAvailable$: Observable<any>;
  private selectedProjectFromUrl$: Observable<string>;
  private breadcrumbsSubscription: Subscription;
  private selectedCurrentUserSubscription: Subscription;
  private breadcrumbsStrings;
  private selectedCurrentUser$: Observable<any>;
  public showNotification: boolean = true;
  public showSurvey$: Observable<boolean>;
  public demo = ConfigurationService.globalEnvironment.demo;
  public isLoginContext: boolean;
  public currentUser: User;
  private gtmService;
  public isSharedAndNotOwner$: Observable<boolean>;
  private activeWorkspace: string;
  public hideUpdate: boolean;
  public showSurvey: boolean;
  private plotlyURL: string;
  private environment: Environment;

  @HostListener('document:visibilitychange') onVisibilityChange() {
    this.store.dispatch(visibilityChanged({visible: !document.hidden}));
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler() {
    window.localStorage.setItem('lastWorkspace', this.activeWorkspace);
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title,
    private store: Store<any>,
    private projectsApi: ApiProjectsService,
    private userService: ApiUsersService,
    public serverUpdatesService: ServerUpdatesService,
    private uiUpdatesService: UiUpdatesService,
    private tipsService: TipsService,
    private matDialog: MatDialog,
    private userStats: UsageStatsService,
    private renderer: Renderer2,
    private injector: Injector,
    private configService: ConfigurationService
  ) {
    this.loggedOut$ = store.select(selectLoggedOut);
    this.isSharedAndNotOwner$ = this.store.select(selectIsSharedAndNotOwner);
    this.selectedProject$ = this.store.select(selectSelectedProject);
    this.updatesAvailable$ = this.store.select(selectAvailableUpdates);
    this.selectedCurrentUser$ = this.store.select(selectCurrentUser);
    this.selectedProjectFromUrl$ = this.store.select(selectRouterParams)
      .pipe(
        filter((params: Params) => !!params),
        map(params => params?.projectId || null)
      );

    if (ConfigurationService.globalEnvironment.GTM_ID) {
      this.gtmService = injector.get(GoogleTagManagerService);
    }
  }

  ngOnInit(): void {
    this.configService.globalEnvironmentObservable.subscribe(env => {
      this.hideUpdate = env.hideUpdateNotice;
      this.showSurvey = env.showSurvey;
      this.plotlyURL = env.plotlyURL;
      this.environment = env;
    });
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(
        (item: RouterEvent) => {
          const gtmTag = {
            event: 'page',
            pageName: item.url
          };
          this.gtmService?.pushTag(gtmTag);
          this.store.dispatch(new routerActions.NavigationEnd());
          this.updateTitle();
        });

    this.selectedCurrentUserSubscription = this.selectedCurrentUser$.pipe(
      tap(user => this.currentUser = user), // should not be filtered
      filter(user => !!user?.id),
      distinctUntilChanged((prev, next) => prev?.id === next?.id)
    )
      .subscribe(() => {
        this.store.dispatch(getAllSystemProjects());
        this.store.dispatch(getTutorialBucketCredentials());
        this.store.dispatch(termsOfUseAccepted());
        this.uiUpdatesService.checkForUiUpdate();
        this.tipsService.initTipsService(false);
        this.serverUpdatesService.checkForUpdates(UPDATE_SERVER_PATH);
        let loginTime = parseInt(localStorage.getItem(USER_PREFERENCES_KEY.firstLogin) || '0', 10);
        if (!loginTime) {
          this.store.dispatch(firstLogin({first: true}));
          loginTime = Date.now();
          localStorage.setItem(USER_PREFERENCES_KEY.firstLogin, `${loginTime}`);
        }
      });

    this.selectedProjectFromUrl$.subscribe((projectId: string) => {
      this.store.dispatch(setSelectedProjectId({projectId}));
    });

    this.urlSubscription = combineLatest([this.store.select(selectRouterUrl), this.store.select(selectRouterParams)])
      .subscribe(([url, params]) => {
        this.projectId = get('projectId', params);
        this.isLoginContext = url && url.includes('login');
        this.isWorkersContext = url && url.includes('workers-and-queues');
        if (this.projectId) {
          try { // TODO: refactor to a better solution after all navbar are declared...
            this.activeFeature = url.split(this.projectId)[1].split('/')[1];
          } catch (e) {

          }
        }
      });

    this.breadcrumbsSubscription = this.store.select(selectBreadcrumbsStrings).pipe(
      filter(names => !!names),
      withLatestFrom(this.store.select(selectIsPipelines))
    ).subscribe(
      ([names, isPipeLines]) => {
        this.breadcrumbsStrings = prepareNames(names, isPipeLines);
        this.updateTitle();
      }
    );

    if (window.localStorage.getItem('disableHidpi') !== 'true') {
      this.setScale();
    }

    loadExternalLibrary(this.store, this.environment.plotlyURL, plotlyReady);
    loadExternalLibrary(this.store, 'assets/ace-builds/ace.js', aceReady);
  }

  private setScale() {
    const dimensionRatio = getScaleFactor();
    this.store.dispatch(setScaleFactor({scale: dimensionRatio}));
    const scale = 100 / dimensionRatio;
    this.renderer.setStyle(document.body, 'transform', `scale(${scale})`);
    this.renderer.setStyle(document.body, 'transform-origin', '0 0');
    this.renderer.setStyle(document.body, 'height', `${dimensionRatio}vh`);
    this.renderer.setStyle(document.body, 'width', `${dimensionRatio}vw`);
  }

  nameChanged(name) {
    this.store.dispatch(updateProject({id: this.projectId, changes: {name}}));
  }

  ngOnDestroy(): void {
    this.urlSubscription.unsubscribe();
    this.breadcrumbsSubscription.unsubscribe();
    this.selectedCurrentUserSubscription.unsubscribe();
  }

  changeRoute(feature) {
    return this.router.navigateByUrl('projects/' + this.projectId + '/' + feature);
  }

  backToProjects() {
    return this.router.navigateByUrl('projects');
  }

  updateTitle() {
    let route = this.route.snapshot.firstChild;
    let routeConfig = [];

    while (route) {
      const path = route.routeConfig.path.split('/').filter((item) => !!item);
      routeConfig = routeConfig.concat(path);
      route = route.firstChild;
    }
    const crumbs = routeConfig
      .reduce((acc, config) => {
        const dynamicCrumb = this.breadcrumbsStrings[config];
        return acc.concat(dynamicCrumb ? dynamicCrumb.name : formatStaticCrumb(config).name);
      }, [''])
      .filter(name => !!name);
    this.titleService.setTitle(`ClearML - ${crumbs.join(' / ')}`);
  }

  versionDismissed(version: string) {
    this.serverUpdatesService.setDismissedVersion(version);
  }

  notifierActive(show: boolean) {
    this.showNotification = show;
  }

  dismissSurvey() {
    this.store.dispatch(dismissSurvey());

  }

  get guestUser(): boolean {
    return !this.currentUser || this.currentUser?.role === 'guest';
  }
}
