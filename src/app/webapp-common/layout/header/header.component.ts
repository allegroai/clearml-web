import {Component, Input, OnDestroy} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectActiveWorkspace, selectCurrentUser, selectWorkspaces} from '../../core/reducers/users-reducer';
import {Observable, Subscription} from 'rxjs';
import {logout, setActiveWorkspace, setAccountAdministrationPage} from '../../core/actions/users.actions';
import {AddMessage} from '../../core/actions/layout.actions';
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

@Component({
  selector: 'sm-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnDestroy {
  @Input() isDashboard: boolean;
  @Input() isShareMode: boolean;
  @Input() isLogin: boolean;
  profile: boolean;
  environment = ConfigurationService.globalEnvironment;
  public user: Observable<GetCurrentUserResponseUserObject>;
  public activeWorkspace: GetCurrentUserResponseUserObjectCompany;
  public workspaces: Observable<GetCurrentUserResponseUserObjectCompany[]>;
  public url: Observable<string>;
  private workspaceSub: Subscription;
  userFiltered: boolean;

  constructor(private store: Store<any>, private dialog: MatDialog, private tipsService: TipsService, private loginService: LoginService) {
    this.url = this.store.select(selectRouterUrl);
    this.user = this.store.select(selectCurrentUser);
    this.workspaces = this.store.select(selectWorkspaces);
    this.workspaceSub = this.store.select(selectActiveWorkspace)
      .pipe(filter(workspace => !!workspace))
      .subscribe(workspace => {
        this.activeWorkspace = workspace;
      });
  }

  ngOnDestroy(): void {
    this.workspaceSub?.unsubscribe();
  }

  logout() {
    this.loginService.clearLoginCache();
    this.store.dispatch(logout({}));
  }

  userManagement() {
    this.store.dispatch(setAccountAdministrationPage());
  }

  copyToClipboardSuccess() {
    this.store.dispatch(new AddMessage(MESSAGES_SEVERITY.SUCCESS, 'URL copied successfully'));
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
