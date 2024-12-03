import {selectCurrentUser} from '@common/core/reducers/users-reducer';
import {Component, OnDestroy, OnInit, ViewEncapsulation, HostListener, Renderer2, inject} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {selectBreadcrumbs, selectLoggedOut} from '@common/core/reducers/view.reducer';
import {Store} from '@ngrx/store';
import {selectRouterParams, selectRouterUrl} from '@common/core/reducers/router-reducer';
import {Project} from './business-logic/model/projects/project';
import {getAllSystemProjects, setSelectedProjectId, updateProject} from '@common/core/actions/projects.actions';
import {selectRouterProjectId, selectSelectedProject} from '@common/core/reducers/projects.reducer';
import {getTutorialBucketCredentials} from '@common/core/actions/common-auth.actions';
import {termsOfUseAccepted} from '@common/core/actions/users.actions';
import {distinctUntilChanged, filter, tap} from 'rxjs/operators';
import * as routerActions from './webapp-common/core/actions/router.actions';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {ServerUpdatesService} from '@common/shared/services/server-updates.service';
import {selectAvailableUpdates} from './core/reducers/view.reducer';
import {UPDATE_SERVER_PATH} from './app.constants';
import {aceReady, firstLogin, plotlyReady, setScaleFactor, visibilityChanged} from '@common/core/actions/layout.actions';
import {UiUpdatesService} from '@common/shared/services/ui-updates.service';
import {getScaleFactor} from '@common/shared/utils/shared-utils';
import {ConfigurationService} from '@common/shared/services/configuration.service';
import {selectIsSharedAndNotOwner} from './features/experiments/reducers';
import {TipsService} from '@common/shared/services/tips.service';
import {USER_PREFERENCES_KEY} from '@common/user-preferences';
import {Environment} from '../environments/base';
import {loadExternalLibrary} from '@common/shared/utils/load-external-library';
import {User} from '~/business-logic/model/users/user';
import {BreadcrumbsService} from '@common/shared/services/breadcrumbs.service';

@Component({
  selector: 'sm-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private titleService = inject(Title);
  private store = inject(Store);
  public serverUpdatesService = inject(ServerUpdatesService);
  private uiUpdatesService = inject(UiUpdatesService);
  private tipsService = inject(TipsService);
  private renderer = inject(Renderer2);
  private configService = inject(ConfigurationService);
  private breadcrumbsService = inject(BreadcrumbsService); // don't delete
  protected loggedOut$: Observable<boolean>;
  private urlSubscription: Subscription;
  protected selectedProject$: Observable<Project>;
  protected projectId: string;
  protected isWorkersContext: boolean;
  protected updatesAvailable$: Observable<string>;
  private breadcrumbsSubscription: Subscription;
  private selectedCurrentUserSubscription: Subscription;
  protected showNotification = true;
  protected isLoginContext: boolean;
  protected currentUser: User;
  protected isSharedAndNotOwner$: Observable<boolean>;
  private activeWorkspace: string;
  protected hideUpdate: boolean;
  protected showSurvey: boolean;
  private environment: Environment;
  private title = 'ClearML';

  @HostListener('document:visibilitychange') onVisibilityChange() {
    this.store.dispatch(visibilityChanged({visible: !document.hidden}));
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler() {
    window.localStorage.setItem('lastWorkspace', this.activeWorkspace);
  }

  constructor(
  ) {
    this.loggedOut$ = this.store.select(selectLoggedOut);
    this.isSharedAndNotOwner$ = this.store.select(selectIsSharedAndNotOwner);
    this.selectedProject$ = this.store.select(selectSelectedProject);
    this.updatesAvailable$ = this.store.select(selectAvailableUpdates);
  }

  ngOnInit(): void {
    window.addEventListener('message', e => {
      if (e.data.maximizing) {
        const drawerContent = document.querySelector('sm-report mat-drawer-container');
        const iframeElement = document.querySelector(`iframe[name="${e.data.name}"]`);
        if (iframeElement?.classList.contains('iframe-maximized')) {
          this.renderer.removeClass(iframeElement, 'iframe-maximized');
          this.renderer.removeClass(drawerContent, 'iframe-maximized');
        } else {
          this.renderer.addClass(iframeElement, 'iframe-maximized');
          this.renderer.addClass(drawerContent, 'iframe-maximized');
        }
      }
    });

    this.configService.globalEnvironmentObservable.subscribe(env => {
      this.hideUpdate = env.hideUpdateNotice;
      this.showSurvey = env.showSurvey;
      this.environment = env;
    });
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.store.dispatch(routerActions.navigationEnd()));

    this.selectedCurrentUserSubscription = this.store.select(selectCurrentUser).pipe(
      tap(user => this.currentUser = user as unknown as User),
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

    this.store.select(selectRouterProjectId).subscribe((projectId: string) => {
      this.store.dispatch(setSelectedProjectId({projectId}));
    });

    this.urlSubscription = combineLatest([
      this.store.select(selectRouterUrl),
      this.store.select(selectRouterParams)
    ])
      .subscribe(([url, params]) => {
        this.projectId = params?.projectId;
        this.isLoginContext = url && url.includes('login');
        this.isWorkersContext = url && url.includes('workers-and-queues');
      });

    this.breadcrumbsSubscription = this.store.select(selectBreadcrumbs).subscribe(breadcrumbs => {
      const crumbs = breadcrumbs.flat().filter((breadcrumb => !!breadcrumb?.name)).map(breadcrumb => breadcrumb.name);
      if (crumbs.length> 0) {
        this.titleService.setTitle(`${this.title ? this.title + '-' : ''} ${crumbs.join(' / ')}`);
      }
    });

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

  versionDismissed(version: string) {
    this.serverUpdatesService.setDismissedVersion(version);
  }

  notifierActive(show: boolean) {
    this.showNotification = show;
  }
}
