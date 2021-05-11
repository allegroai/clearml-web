import { Component, OnInit } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {combineLatest, Observable} from 'rxjs';
import {filter, map, take} from 'rxjs/operators';

import {
  addWhitelistEntries,
  deleteWhitelistEntry,
  getWhitelistEntries,
  getUserWorkspaces,
  removeWhitelistEntry
} from '../core/actions/users.actions';
import {selectCurrentUser, selectWhitelistEntries, selectUserWorkspaces} from '../core/reducers/users-reducer';
import { UserManagementDialogComponent } from './user-management-dialog/user-management-dialog.component';
import {Invite} from '../../business-logic/model/login/invite';
import {ConfirmDialogComponent} from '../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {OrganizationGetUserCompaniesResponseCompanies} from '../../business-logic/model/organization/organizationGetUserCompaniesResponseCompanies';
import {GetCurrentUserResponseUserObject} from '../../business-logic/model/users/getCurrentUserResponseUserObject';
import {WhitelistEntry} from '../../business-logic/model/login/whitelistEntry';
import {isUndefined, isNil} from 'lodash/fp';

export interface InviteUser extends Invite {
  isMainUser?: boolean;
}
export enum STATE_ENUM {
  WHITE_LIST_ENTRY,
  USER_WORK_SPACE,
  CURRENT_USER
}

@Component({
  selector: 'sm-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  state$: Observable<[Array<WhitelistEntry>, OrganizationGetUserCompaniesResponseCompanies[], GetCurrentUserResponseUserObject]>;

  STATE_ENUM = STATE_ENUM;

  constructor( private store: Store<any>,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.store.dispatch(getWhitelistEntries());
    this.store.dispatch(getUserWorkspaces());

    const currentUser$ = this.store.select(selectCurrentUser).pipe(filter(x => !!x));
    const invitedUsers$ = this.store.select(selectWhitelistEntries);
    const userWorkspaces$ = this.store.select(selectUserWorkspaces)

    this.state$ = combineLatest([invitedUsers$, userWorkspaces$, currentUser$]);
  }

  createNewInvite(numberAvailableEmails: number) {
    this.dialog.open(UserManagementDialogComponent, {data: {numberAvailableEmails}}) .afterClosed()
      .pipe(take(1),filter(x => !!x))
      .subscribe( (whitelistEntries: string[]) => {
        this.store.dispatch(addWhitelistEntries({whitelistEntries}));
      });
  }

  onRemoveInviteHandler(whitelistEntry: WhitelistEntry) {
    if (whitelistEntry?.user) {
      this.onRemoveUserHandler(whitelistEntry);
      return;
    }
    this.store.dispatch(removeWhitelistEntry({remove: [whitelistEntry.email]}));
  }

  onRemoveUserHandler(invite: WhitelistEntry) {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title    : 'Remove User',
        body     : `
        Removing ${invite.email} from your account will prevent them and any code using their App Credentials from any further use of the system.
Any data previously created by them will remain available.
If ${invite.email} is added in the future, they will be considered a new user and will not retain any history.
<div class="mt-4">Are you sure you want to continue?</div>

        `,
        yes      : 'Delete',
        no       : 'Cancel',
        iconClass: 'i-alert',
      }
    })
      .afterClosed()
      .pipe(take(1),filter(x => !!x))
      .subscribe( res => {
        this.store.dispatch(deleteWhitelistEntry({user: {...invite.user, email: invite.email}}));
      });
  }

  getAllowedUsers(companyUsers: OrganizationGetUserCompaniesResponseCompanies) {
    if (isUndefined(companyUsers) || isNil(companyUsers)) { return ''; }

     return companyUsers.allowed === null ? '∞' : companyUsers.allowed;
  }

  getNumberAvailableEmails(companyUsers: OrganizationGetUserCompaniesResponseCompanies, whitelistEntries: Array<WhitelistEntry>) {
    if (isNil(companyUsers) || isNil(companyUsers.allowed)) { return Number.MAX_SAFE_INTEGER; }

    return companyUsers.allowed - (whitelistEntries?.length || 0);
  }
}
