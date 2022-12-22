import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectActiveWorkspace, selectCurrentUser} from '../../core/reducers/users-reducer';
import {Observable, Subscription} from 'rxjs';
import {logout} from '../../core/actions/users.actions';
import {addMessage, openAppsAwarenessDialog} from '../../core/actions/layout.actions';
import {MatDialog} from '@angular/material/dialog';
import {GetCurrentUserResponseUserObject} from '~/business-logic/model/users/getCurrentUserResponseUserObject';
import {ConfigurationService} from '../../shared/services/configuration.service';
import {GetCurrentUserResponseUserObjectCompany} from '~/business-logic/model/users/getCurrentUserResponseUserObjectCompany';
import {distinctUntilKeyChanged, filter} from 'rxjs/operators';
import {selectRouterUrl} from '../../core/reducers/router-reducer';
import {TipsService} from '../../shared/services/tips.service';
import {WelcomeMessageComponent} from '../welcome-message/welcome-message.component';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {LoginService} from '~/shared/services/login.service';
import {selectUserSettingsNotificationPath} from '~/core/reducers/view.reducer';
import {selectInvitesPending} from '~/core/reducers/users.reducer';
import {selectShowUserFocus} from '@common/core/reducers/view.reducer';
import {MESSAGES_SEVERITY} from '@common/constants';

@Component({
  selector: 'sm-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() isShareMode: boolean;
  @Input() isLogin: boolean;
  isDashboard: boolean;
  profile: boolean;
  userFocus: boolean;
  environment = ConfigurationService.globalEnvironment;
  public user: Observable<GetCurrentUserResponseUserObject>;
  public activeWorkspace: GetCurrentUserResponseUserObjectCompany;
  public url: Observable<string>;
  public invitesPending$: Observable<any[]>;
  public userNotificationPath: string;
  public showUserFocus$: Observable<boolean>;
  private sub = new Subscription();

  constructor(
    private store: Store<any>,
    private dialog: MatDialog,
    private tipsService: TipsService,
    private loginService: LoginService,
    private router: Router,
    private activeRoute: ActivatedRoute

  ) {
    this.url = this.store.select(selectRouterUrl);
    this.user = this.store.select(selectCurrentUser);
    this.sub.add(this.store.select(selectUserSettingsNotificationPath).subscribe(path => this.userNotificationPath = path));
    this.invitesPending$ = this.store.select(selectInvitesPending);
    this.showUserFocus$ = this.store.select(selectShowUserFocus);
    this.sub.add(this.store.select(selectActiveWorkspace)
      .pipe(
        filter(workspace => !!workspace),
        distinctUntilKeyChanged('id')
      )
      .subscribe(workspace => {
        this.activeWorkspace = workspace;
      }));

    this.sub.add(this.router.events
    .pipe(filter((event) => event instanceof NavigationEnd))
    .subscribe(() => this.getRouteData()));

  }

  ngOnInit(): void {
    this.getRouteData();
  }

  getRouteData() {
    this.userFocus = !!this.activeRoute?.firstChild?.snapshot.data?.userFocus;
    this.isDashboard = this.activeRoute?.firstChild?.snapshot.url?.[0]?.path === 'dashboard';
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  logout() {
    this.loginService.clearLoginCache();
    this.store.dispatch(logout({}));
  }

  copyToClipboardSuccess() {
    this.store.dispatch(addMessage(MESSAGES_SEVERITY.SUCCESS, 'URL copied successfully'));
  }

  openTip() {
    this.tipsService.showTipsModal(null, true);
  }

  openWelcome(event: MouseEvent) {
    event.preventDefault();
    this.dialog.open(WelcomeMessageComponent, {data: {step: 2}});
  }

  openAppsAwareness($event: MouseEvent, appsYouTubeIntroVideoId: string) {
    $event.preventDefault();
    this.store.dispatch(openAppsAwarenessDialog({appsYouTubeIntroVideoId}));
  }

  navigate(link: string) {
   const a = document.createElement('a');
   a.target = '_blank';
   a.href = link;
   a.click();
  }
}
