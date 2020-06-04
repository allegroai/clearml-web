import {ApiUsersService} from './business-logic/api-services/users.service';
import {selectCurrentUser} from './webapp-common/core/reducers/users-reducer';
import {Component, OnDestroy, OnInit, ViewEncapsulation, HostListener} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, Params} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {selectLoggedOut} from './webapp-common/core/reducers/view-reducer';
import {select, Store} from '@ngrx/store';
import {get} from 'lodash/fp';
import {selectRouterParams, selectRouterUrl} from './webapp-common/core/reducers/router-reducer';
import {ApiProjectsService} from './business-logic/api-services/projects.service';
import {Project} from './business-logic/model/projects/project';
import {GetAllProjects, SetSelectedProjectId, UpdateProject} from './webapp-common/core/actions/projects.actions';
import {selectSelectedProject} from './webapp-common/core/reducers/projects.reducer';
import {selectS3BucketCredentialsBucketCredentials, selectS3PopUpDetails, selectShowLocalFilesPopUp, selectShowS3PopUp} from './webapp-common/core/reducers/common-auth-reducer';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {S3AccessResolverComponent} from './webapp-common/layout/s3-access-resolver/s3-access-resolver.component';
import {cancelS3Credentials, getTutorialBucketCredentials} from './webapp-common/core/actions/common-auth.actions';
import {FetchCurrentUser} from './webapp-common/core/actions/users.actions';
import {filter, map, take, withLatestFrom} from 'rxjs/operators';
import * as routerActions from './webapp-common/core/actions/router.actions';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {selectBreadcrumbsStrings} from './webapp-common/layout/layout.reducer';
import {prepareNames} from './layout/breadcrumbs/breadcrumbs.utils';
import {formatStaticCrumb} from './webapp-common/layout/breadcrumbs/breadcrumbs-common.utils';
import {ServerUpdatesService} from './webapp-common/shared/services/server-updates.service';
import {selectAvailableUpdates, selectShowSurvey} from './core/reducers/view-reducer';
import {UPDATE_SERVER_PATH} from './app.constants';
import {VisibilityChanged} from './webapp-common/core/actions/layout.actions';
import {UiUpdatesService} from './webapp-common/shared/services/ui-updates.service';
import {UsageStatsService} from './core/Services/usage-stats.service';
import {UiUpdateDialogComponent} from './webapp-common/layout/ui-update-dialog/ui-update-dialog.component';
import {dismissSurvey} from './core/Actions/layout.actions';
import {environment} from '../environments/environment';

@Component({
  selector     : 'sm-root',
  templateUrl  : 'app.component.html',
  styleUrls    : ['app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, OnDestroy {
  public loggedOut$: Observable<any>;
  public isDashboardContext: boolean;
  public activeFeature: string;
  private urlSubscription: Subscription;
  public selectedProject$: Observable<Project>;
  public projectId: string;
  public isWorkersContext: boolean;
  public updatesAvailable$: Observable<any>;
  private selectedProjectFromUrl$: Observable<string>;
  private showS3Popup$: Observable<any>;
  private s3Dialog: MatDialogRef<S3AccessResolverComponent, any>;
  private showLocalFilePopup$: Observable<any>;
  private breadcrumbsSubscription: Subscription;
  private breadcrumbsStrings;
  private selectedCurrentUser$: Observable<any>;
  public showNotification: boolean = true;
  public showSurvey$: Observable<boolean>;
  public demo = environment.demo;

  @HostListener('document:visibilitychange') onVisibilityChange() {
    this.store.dispatch(new VisibilityChanged(!document.hidden));
  }

  constructor (
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title,
    private store: Store<any>,
    private projectsApi: ApiProjectsService,
    private userService: ApiUsersService,
    public serverUpdatesService: ServerUpdatesService,
    private uiUpdatesService: UiUpdatesService,
    private matDialog: MatDialog,
    private userStats: UsageStatsService
  ) {
    this.showS3Popup$            = this.store.select(selectShowS3PopUp);
    this.showLocalFilePopup$     = this.store.pipe(select(selectShowLocalFilesPopUp));
    this.loggedOut$              = store.select(selectLoggedOut);
    this.selectedProject$        = this.store.select(selectSelectedProject);
    this.updatesAvailable$       = this.store.select(selectAvailableUpdates);
    this.showSurvey$       = this.store.select(selectShowSurvey);
    this.selectedCurrentUser$    = this.store.select(selectCurrentUser);
    this.selectedProjectFromUrl$ = this.store.select(selectRouterParams)
      .pipe(
        filter((params: Params) => !!params),
        map(params => get('projectId', params) || null)
      );
  }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(
        () => {
          this.store.dispatch(new routerActions.NavigationEnd());
          this.updateTitle();
        });

    this.store.dispatch(new FetchCurrentUser());
    this.selectedCurrentUser$.pipe(
      filter( user => !!user),
      take(1))
      .subscribe(() => this.serverUpdatesService.checkForUpdates(UPDATE_SERVER_PATH));

    this.selectedProjectFromUrl$.subscribe((projectId: string) => {
      this.store.dispatch(new SetSelectedProjectId(projectId));
    });

    this.showS3Popup$.subscribe(showS3 => {
      if (showS3) {
        this.s3Dialog = this.matDialog.open(S3AccessResolverComponent);
        this.s3Dialog.afterClosed().pipe(
          withLatestFrom(
            this.store.pipe(select(selectS3BucketCredentialsBucketCredentials)), this.store.pipe(select(selectS3PopUpDetails)))
        )
          .subscribe(([data, bucketCredentials, popupDetails]) => {
            if (!(data && data.success)) {
              const emptyCredentials          = bucketCredentials.find((cred => cred.Bucket === popupDetails.credentials.Bucket)) === undefined;
              const dontAskAgainForBucketName = emptyCredentials ? '' : popupDetails.credentials.Bucket + popupDetails.credentials.Endpoint;
              this.store.dispatch(cancelS3Credentials({dontAskAgainForBucketName}));
            }
          });
      }
    });

    this.urlSubscription = combineLatest([this.store.select(selectRouterUrl), this.store.select(selectRouterParams)])
      .subscribe(([url, params]) => {
        this.projectId          = get('projectId', params);
        this.isDashboardContext = url && url.includes('dashboard');
        this.isWorkersContext   = url && url.includes('workers-and-queues');
        if (this.projectId) {
          try { // TODO: refactor to a better solution after all navbar are declared...
            this.activeFeature = url.split(this.projectId)[1].split('/')[1];
          } catch (e) {

          }
        }
      });

    this.breadcrumbsSubscription = this.store.pipe(
      select(selectBreadcrumbsStrings),
      filter(names => !!names)
    ).subscribe(
      (names) => {
        this.breadcrumbsStrings = prepareNames(names);
        this.updateTitle();
      }
    );

    // TODO: move to somewhere else...
    this.store.dispatch(new GetAllProjects());
    this.store.dispatch(getTutorialBucketCredentials());
    this.uiUpdatesService.checkForUiUpdate();
  }

  nameChanged(name) {
    this.store.dispatch(new UpdateProject({id: this.projectId, changes: {name: name}}));
  }

  ngOnDestroy(): void {
    this.urlSubscription.unsubscribe();
    this.breadcrumbsSubscription.unsubscribe();
  }

  changeRoute(feature) {
    this.router.navigateByUrl('projects/' + this.projectId + '/' + feature);
  }

  backToProjects() {
    this.router.navigateByUrl('projects');
  }

  updateTitle() {
    let route       = this.route.snapshot.firstChild;
    let routeConfig = [];

    while (route) {
      const path  = route.routeConfig.path.split('/').filter((item) => !!item);
      routeConfig = routeConfig.concat(path);
      route       = route.firstChild;
    }
    const crumbs = routeConfig
      .reduce((acc, config) => {
        const dynamicCrumb = this.breadcrumbsStrings[config];
        return acc.concat(dynamicCrumb ? dynamicCrumb.name : formatStaticCrumb(config).name);
      }, [''])
      .filter(name => !!name);
    this.titleService.setTitle(`trains - ${crumbs.join(' / ')}`);
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
}

