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
import {MESSAGES_SEVERITY} from '@common/constants';
import {UsersGetInvitesResponseInvites} from '~/business-logic/model/users/usersGetInvitesResponseInvites';

@Component({
  selector: 'sm-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() isShareMode: boolean;
  @Input() isLogin: boolean;
  @Input() hideMenus: boolean;
  showLogo: boolean;
  profile: boolean;
  userFocus: boolean;
  public environment$ = this.configService.getEnvironment();
  public user: Observable<GetCurrentUserResponseUserObject>;
  public activeWorkspace: GetCurrentUserResponseUserObjectCompany;
  public url: Observable<string>;
  public invitesPending$: Observable<UsersGetInvitesResponseInvites[]>;
  private sub = new Subscription();
  public userNotificationPath$: Observable<string>;

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private tipsService: TipsService,
    private loginService: LoginService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private configService: ConfigurationService
  ) {
    this.url = this.store.select(selectRouterUrl);

    this.user = this.store.select(selectCurrentUser);
    this.userNotificationPath$ = this.store.select(selectUserSettingsNotificationPath);
    this.invitesPending$ = this.store.select(selectInvitesPending);
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
    this.showLogo = this.activeRoute?.firstChild?.snapshot.url?.[0]?.path === 'dashboard' || this.activeRoute?.firstChild?.snapshot.data.hideSideNav;
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

  openAppsAwareness($event: MouseEvent) {
    $event.preventDefault();
    this.store.dispatch(openAppsAwarenessDialog());
  }
}
