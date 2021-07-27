import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectActiveWorkspace, selectCurrentUser, selectWorkspaces} from '../../core/reducers/users-reducer';
import {Observable, Subscription} from 'rxjs';
import {logout, setActiveWorkspace, setAccountAdministrationPage} from '../../core/actions/users.actions';
import {addMessage} from '../../core/actions/layout.actions';
import {MESSAGES_SEVERITY} from '../../../app.constants';
import {MatDialog} from '@angular/material/dialog';
import {InviteUserModalComponent} from '../invite-user-modal/invite-user-modal.component';
import {GetCurrentUserResponseUserObject} from '../../../business-logic/model/users/getCurrentUserResponseUserObject';
import {ConfigurationService} from '../../shared/services/configuration.service';
import {GetCurrentUserResponseUserObjectCompany} from '../../../business-logic/model/users/getCurrentUserResponseUserObjectCompany';
import {filter} from 'rxjs/operators';
import {selectRouterUrl} from '../../core/reducers/router-reducer';
import {TipsService} from '../../shared/services/tips.service';
import {LoginService} from '../../shared/services/login.service';
import {WelcomeMessageComponent} from '../../dashboard/dumb/welcome-message/welcome-message.component';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {selectHasUserManagement} from '../../../core/reducers/users.reducer';

@Component({
  selector: 'sm-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() isShareMode: boolean;
  @Input() isLogin: boolean;
  isDashboard: boolean;
  profile: boolean;
  userFiltered: boolean;
  userFocus: boolean;
  environment = ConfigurationService.globalEnvironment;
  public user: Observable<GetCurrentUserResponseUserObject>;
  public activeWorkspace: GetCurrentUserResponseUserObjectCompany;
  public workspaces: Observable<GetCurrentUserResponseUserObjectCompany[]>;
  public url: Observable<string>;
  private sub = new Subscription();
  public userManagement$: Observable<boolean>;

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
    this.workspaces = this.store.select(selectWorkspaces);
    this.userManagement$ = this.store.select(selectHasUserManagement);
    this.sub.add(this.store.select(selectActiveWorkspace)
      .pipe(filter(workspace => !!workspace))
      .subscribe(workspace => {
        this.activeWorkspace = workspace;
      }));

    this.sub.add(this.router.events
    .pipe(filter((event) => event instanceof NavigationEnd))
    .subscribe(() => this.getRotueData()));

  }

  ngOnInit(): void {
    this.getRotueData();
  }

  getRotueData() {
    this.userFocus = !!this.activeRoute?.firstChild?.snapshot.data?.userFocus;
    this.isDashboard = this.activeRoute?.firstChild?.snapshot.url?.[0].path === 'dashboard';
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  logout() {
    this.loginService.clearLoginCache();
    this.store.dispatch(logout({}));
  }

  userManagement() {
    this.store.dispatch(setAccountAdministrationPage());
  }

  copyToClipboardSuccess() {
    this.store.dispatch(addMessage(MESSAGES_SEVERITY.SUCCESS, 'URL copied successfully'));
  }

  openInviteModal() {
    this.dialog.open(InviteUserModalComponent);
  }

  switchWorkspace(workspace: GetCurrentUserResponseUserObjectCompany) {
    this.store.dispatch(setActiveWorkspace({workspace}));
  }

  openTip() {
    this.tipsService.showTipsModal(null, true);
  }

  openWelcome(event: MouseEvent) {
    event.preventDefault();
    this.dialog.open(WelcomeMessageComponent, {data: {step: 2}});
  }
}
