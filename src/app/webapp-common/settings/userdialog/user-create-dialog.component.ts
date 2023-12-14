import * as createNewUserActions from './user-create-dialog.actions';

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

import { User } from '~/business-logic/model/users/user';
import { Company } from '~/business-logic/model/company/company';
import { Group } from '~/business-logic/model/group/group';

@Component({
  selector: 'sm-user-create-dialog',
  templateUrl: './user-create-dialog.component.html',
  styleUrls: ['./user-create-dialog.component.scss']
})
export class UserCreateDialogComponent implements OnInit, OnDestroy {
  public mode: string;
  public header: string;
  public modeParameters: { [mode: string]: { header: string; headerEdit: string } } = {
    user: {
      header: 'NEW USER',
      headerEdit: 'EDIT USER',
    },
    group: {
      header: 'NEW GROUP',
      headerEdit: 'EDIT GROUP',
    },
    company: {
      header: 'NEW COMPANY',
      headerEdit: 'EDIT COMPANY',
    },
  };

  public baseData: any;

  public users: User[];
  public companys: Company[];
  public groups: Group[];
  public editMode: boolean;

  public headerTitle: string;

  constructor(private store: Store<any>, private matDialogRef: MatDialogRef<UserCreateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { companys: Company[]; groups: Group[]; users: User[]; current: any; mode: string; editMode: boolean }) {
    if (data) {
      this.baseData = data.current;
      this.editMode = data.editMode;
      this.mode = data.mode;
      this.companys = data.companys;
      this.groups = data.groups;
      this.users = data.users;
      this.headerTitle = data.editMode ? this.modeParameters[data.mode].headerEdit : this.modeParameters[data.mode].header;
    }
  }

  ngOnInit(): void {
    // this.store.dispatch(new createNewQueueActions.GetQueues());
    // this.creationStatusSubscription = this.store.select(createUserSelectors.selectCreationStatus).subscribe(status => {
    //   if (status === CREATION_STATUS.SUCCESS) {
    //     return this.matDialogRef.close(true);
    //   }
    // });
  }

  ngOnDestroy(): void {
    this.store.dispatch(new createNewUserActions.ResetUser());
  }

  public createUser(user) {
    if (user.id) {
      this.store.dispatch(new createNewUserActions.UpdateUser({ user: user.id, name: user.name, email: user.email, role: user.role, status: user.status, company: user.company }));
      this.matDialogRef.close();
    } else {
      this.store.dispatch(new createNewUserActions.CreateNewUser(user));
      this.matDialogRef.close();
    }
  }

  public createGroup(group) {
    if (group.id) {
      this.store.dispatch(new createNewUserActions.UpdateGroup({ id: group.id, name: group.name, company: group.company, description: group.description, users: group.users }));
    } else {
      this.store.dispatch(new createNewUserActions.CreateNewGroup(group));
    }
    this.matDialogRef.close();
  }

  public createCompany(company) {
    if (company.id) {
      this.store.dispatch(new createNewUserActions.UpdateCompany({ id: company.id, name: company.name, description: company.description }));
      this.matDialogRef.close();
    } else {
      this.store.dispatch(new createNewUserActions.CreateNewCompany(company));
      this.matDialogRef.close();
    }
  }

  closeDialog() {
    this.matDialogRef.close();
  }
}
