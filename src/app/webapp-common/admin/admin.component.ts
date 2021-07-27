import {Component, OnDestroy, OnInit} from '@angular/core';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {AdminService} from '../../features/admin/admin.service';
import {selectActiveWorkspace, selectCurrentUser, selectServerVersions, selectUserWorkspaces} from '../core/reducers/users-reducer';
import {createCredential, credentialRevoked, getAllCredentials, updateS3Credential} from '../core/actions/common-auth.actions';
import {selectCredentials, selectNewCredential, selectS3BucketCredentials} from '../core/reducers/common-auth-reducer';
import { MatDialog } from '@angular/material/dialog';
import {CreateCredentialDialogComponent} from './create-credential-dialog/create-credential-dialog.component';
import {debounceTime, filter, take, tap} from 'rxjs/operators';
import {
  getApiVersion,
  getUserWorkspaces,
  leaveWorkspace,
  logout,
  setActiveWorkspace,
  setSelectedWorkspaceTab
} from '../core/actions/users.actions';
import * as versions from '../../../version.json';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {InviteUserModalComponent} from '../layout/invite-user-modal/invite-user-modal.component';
import {GetCurrentUserResponseUserObject} from '../../business-logic/model/users/getCurrentUserResponseUserObject';
import {ConfirmDialogComponent} from '../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {ConfigurationService} from '../shared/services/configuration.service';
import {OrganizationGetUserCompaniesResponseCompanies} from '../../business-logic/model/organization/organizationGetUserCompaniesResponseCompanies';
import {popupId} from '../shared/services/tips.service';
import {selectNeverShowPopups} from '../core/reducers/view-reducer';
import {neverShowPopupAgain} from '../core/actions/layout.actions';
import {UserDetails} from '../../business-logic/model/organization/userDetails';
import {CredentialKey} from '../../business-logic/model/auth/credentialKey';

interface WorkspaceUser extends UserDetails {
  initials: string;
}

interface Workspace extends OrganizationGetUserCompaniesResponseCompanies {
  users?: WorkspaceUser[];
}

const MAX_MEMBERS_TO_SHOW = 10;


@Component({
  selector   : 'sm-admin',
  templateUrl: './admin.component.html',
  styleUrls  : ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  public popupId = popupId;
  private newCredentialSub: Subscription;
  public credentials$: Observable<{ [workspoaceId: string]: CredentialKey[] }>;
  public S3BucketCredentials = this.store.select(selectS3BucketCredentials);
  public version = versions['version'];
  public disableHidpi: boolean = false;
  public disableHidpiChanged: boolean = false;
  public supportReScaling: boolean;
  workspaces = [] as Workspace[];
  activeWorkspace: OrganizationGetUserCompaniesResponseCompanies;
  selectionIndex = 0;
  public currentUser: GetCurrentUserResponseUserObject;
  showDeleteAccount: boolean;
  communityServer: boolean;
  private workspacesSub: Subscription;
  public neverShowTipsAgain$: Observable<string[]>;
  creatingCredentials = false;
  public panelState = {} as { [workspaceId: string]: boolean };
  private confSub: Subscription;
  public serverVersions$: Observable<{ server: string; api: string }>;

  constructor(
    public adminService: AdminService,
    private store: Store<any>,
    private dialog: MatDialog,
    private configService: ConfigurationService
) {
    this.supportReScaling = window['chrome'] || window['safari'];
    store.select(selectCurrentUser)
      .pipe(filter(user => !!user), take(1))
      .subscribe(user => {
        this.currentUser = user;
      });

    this.workspacesSub =
      combineLatest([
        this.store.select(selectUserWorkspaces),
        this.store.select(selectActiveWorkspace)
      ])
        .pipe(debounceTime(0), filter(([spaces, active]) => spaces?.length > 0 && !!active))
        .subscribe(([spaces, active]) => {
          this.workspaces = spaces;
          this.activeWorkspace = this.workspaces.find(ws => ws.id === active?.id);
          this.workspaces.forEach(ws => this.panelState[ws.id] = ws.id === this.activeWorkspace.id);
          if (this.communityServer) {
            this.calcWorkspaceMembers();
          }
        });

    this.neverShowTipsAgain$ = store.select(selectNeverShowPopups);
    this.credentials$ = this.store.select(selectCredentials);
    this.serverVersions$ = this.store.select(selectServerVersions);
  }

  ngOnInit() {
    this.store.dispatch(getApiVersion());
    this.store.select(selectCurrentUser)
      .pipe(filter(user => !!user), take(1))
      .subscribe(() => {
        this.store.dispatch(getUserWorkspaces());
        this.store.dispatch(getAllCredentials());
      });
    this.disableHidpi = window.localStorage.getItem('disableHidpi') === 'true';
    this.confSub = this.configService.globalEnvironmentObservable.subscribe(env => this.communityServer = env.communityServer);

    this.newCredentialSub = this.store.select(selectNewCredential)
      .pipe(
        tap(() => this.creatingCredentials = false),
        filter(credential => credential && Object.keys(credential).length > 0)
      ).subscribe((credential) => {
        if (credential.access_key) {
          const workspace = this.workspaces.find(ws => ws.id === credential.company);
          const dialog = this.dialog.open(
            CreateCredentialDialogComponent,
            {data: {credential, ...(this.communityServer && {workspace: workspace.name})}}
          );
          dialog.afterClosed().subscribe(() => {
            this.adminService.resetNewCredential();
          });
        }
      });
  }

  logoutClicked() {
    this.store.dispatch(logout({}));
  }

  createCredential(workspace: OrganizationGetUserCompaniesResponseCompanies) {
    this.creatingCredentials = true;
    this.store.dispatch(setSelectedWorkspaceTab({workspace}));
    this.store.dispatch(createCredential({workspaceId: workspace.id}));
  }

  onCredentialRevoked(accessKey, workspace: Workspace) {
    this.store.dispatch(setSelectedWorkspaceTab({workspace}));
    this.store.dispatch(credentialRevoked({accessKey, workspaceId: workspace.id}));
  }

  onS3BucketCredentialsChanged(formData) {
    this.adminService.resetS3Services();
    this.store.dispatch(updateS3Credential({S3BucketCredentials: formData}));
  }

  ngOnDestroy(): void {
    this.newCredentialSub.unsubscribe();
    this.workspacesSub?.unsubscribe();
    this.confSub?.unsubscribe();
  }

  HidpiChange(event: MatSlideToggleChange) {
    window.localStorage.setItem('disableHidpi', JSON.stringify(event.checked));
    this.disableHidpiChanged = !this.disableHidpiChanged;
  }

  reload(event) {
    if (this.disableHidpiChanged) {
      event.stopPropagation();
      event.preventDefault();
      window.location.reload();
    }
  }

  calcWorkspaceMembers() {
    this.workspaces = this.workspaces.map(ws => {
      if (ws.members && ws.owners) {
        const workspaceUsers = [...ws.owners, ...ws.members].map(member => ({
          ...member,
          initials: member.name.split(' ').map(part => part[0]).join('')
        }));
        if (workspaceUsers.length > MAX_MEMBERS_TO_SHOW) {
          const extraUsers = workspaceUsers.length - MAX_MEMBERS_TO_SHOW + 1;
          workspaceUsers.splice(MAX_MEMBERS_TO_SHOW - 1);
          workspaceUsers.push({name: `and ${extraUsers} more`, initials: `+${extraUsers}`});
        } else {
          for (let i = 0; i < Math.min(ws.allowed, MAX_MEMBERS_TO_SHOW) - ws.allocated; i++) {
            workspaceUsers.push({name: null, id: null, initials: null});
          }
        }
        return {...ws, users: workspaceUsers};
      }
    });
  }

  openInviteModal() {
    this.dialog.open(InviteUserModalComponent);
  }

  openLeaveModal(workspace: OrganizationGetUserCompaniesResponseCompanies) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent,
      {
        data: {
          title: `Leave ${workspace.name}`,
          body: 'Are you sure you would like to leave this workspace?',
          yes: 'Leave',
          no: 'Cancel',
          iconClass: 'i-welcome-researcher',
        }
      });

    dialogRef.afterClosed().subscribe((allowed: boolean) => {
      if (allowed) {
        this.store.dispatch(setSelectedWorkspaceTab({workspace}));
        this.store.dispatch(leaveWorkspace({workspace}));
      }
    });
  }

  deleteAccount() {
    this.showDeleteAccount = true;
  }

  switchWorkspace(event: Event, workspace) {
    this.store.dispatch(setActiveWorkspace({workspace}));
    event.stopPropagation();
  }

  setNeverShowTipsAgain($event: MatSlideToggleChange) {
    this.store.dispatch(neverShowPopupAgain({popupId, reset: !$event.checked}));
  }

  trackByUser(index, user: WorkspaceUser) {
    return user.id || index;
  }

  trackByWorkspace(index, workspace: Workspace) {
    return workspace?.id || index;
  }

  panelToggle(open: boolean, workspaceId: string) {
    window.setTimeout(() => this.panelState[workspaceId] = open);
  }
}
