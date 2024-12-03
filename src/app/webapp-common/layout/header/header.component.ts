import {ChangeDetectionStrategy, Component, computed, inject, input, signal} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectActiveWorkspace, selectCurrentUser, selectIsAdmin} from '../../core/reducers/users-reducer';
import {logout} from '../../core/actions/users.actions';
import {addMessage, openAppsAwarenessDialog} from '../../core/actions/layout.actions';
import {MatDialog} from '@angular/material/dialog';
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
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {ChangesService} from '@common/shared/services/changes.service';

@Component({
  selector: 'sm-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private store = inject(Store);
  private dialog = inject(MatDialog);
  public tipsService = inject(TipsService);
  public changesService = inject(ChangesService);
  private loginService = inject(LoginService);
  private router = inject(Router);
  private activeRoute = inject(ActivatedRoute);
  private configService = inject(ConfigurationService);

  isShareMode = input<boolean>();
  isLogin = input<boolean>();
  hideMenus = input<boolean>();

  protected environment = toSignal(this.configService.getEnvironment());
  protected url = this.store.selectSignal(selectRouterUrl);
  protected user = this.store.selectSignal(selectCurrentUser);
  protected isAdmin = this.store.selectSignal(selectIsAdmin);
  protected userNotificationPath = this.store.selectSignal(selectUserSettingsNotificationPath);
  protected invitesPending = this.store.selectSignal(selectInvitesPending);
  protected userFocus = signal<boolean>(false);
  protected hideSideNav = signal<boolean>(false);
  protected dashboard = signal<boolean>(false);
  protected showLogo = computed<boolean>(() => this.hideSideNav() || this.dashboard());
  public activeWorkspace = toSignal<GetCurrentUserResponseUserObjectCompany>(this.store.select(selectActiveWorkspace)
    .pipe(
      filter(workspace => !!workspace),
      distinctUntilKeyChanged('id')
    )
  );

  constructor(
  ) {
    this.getRouteData();
    this.router.events
    .pipe(
      takeUntilDestroyed(),
      filter((event) => event instanceof NavigationEnd)
    )
    .subscribe(() => this.getRouteData());
  }

  getRouteData() {
    this.userFocus.set(!!this.activeRoute?.firstChild?.snapshot.data?.userFocus);
    this.hideSideNav.set(this.activeRoute?.firstChild?.snapshot.data.hideSideNav);
    this.dashboard.set(this.activeRoute?.firstChild?.snapshot.url?.[0]?.path === 'dashboard');
  }

  logout() {
    this.loginService.clearLoginCache();
    this.store.dispatch(logout({}));
  }

  copyToClipboardSuccess() {
    this.store.dispatch(addMessage(MESSAGES_SEVERITY.SUCCESS, 'URL copied successfully'));
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
