import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {get} from 'lodash/fp';
import {AdminService} from '../../features/admin/admin.service';
import {selectCurrentUser} from '../core/reducers/users-reducer';
import {createCredential, credentialRevoked, getAllCredentials, updateS3Credential} from '../core/actions/common-auth.actions';
import {selectCredentials, selectNewCredential, selectS3BucketCredentials} from '../core/reducers/common-auth-reducer';
import { MatDialog } from '@angular/material/dialog';
import {CreateCredentialDialogComponent} from './create-credential-dialog/create-credential-dialog.component';
import {filter, map} from 'rxjs/operators';
import {Logout} from '../core/actions/users.actions';
import * as versions from '../../../version.json';

@Component({
  selector   : 'sm-admin',
  templateUrl: './admin.component.html',
  styleUrls  : ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  private newCredentialSub: Subscription;
  private currentUser: Observable<any>;
  public userTitle: Observable<string>;
  public credentials: Observable<any>;
  public newCredential: Observable<any>;
  public S3BucketCredentials: Observable<any>;
  public version = versions['webapp-treeish'];

  constructor(
    public adminService: AdminService,
    private store: Store<any>,
    private dialog: MatDialog
  ) {
    this.currentUser         = store.select(selectCurrentUser);
    this.userTitle           = this.currentUser.pipe(
      map((user) => [
        get('name', user),
        get('company.name', user)
      ].join(' - ')
      ));
    this.credentials         = store.select(selectCredentials);
    this.newCredential       = store.select(selectNewCredential);
    this.S3BucketCredentials = store.select(selectS3BucketCredentials);
  }


  ngOnInit() {
    this.store.dispatch(getAllCredentials());
    this.newCredentialSub = this.newCredential.pipe(filter(credential => Object.keys(credential).length > 0)).subscribe(credential => {
      const dialog = this.dialog.open(CreateCredentialDialogComponent, {data: {credential}});
      dialog.afterClosed().subscribe(() => {
        this.adminService.resetNewCredential();
      });
    });
  }

  logoutClicked() {
    this.store.dispatch(new Logout());
  }

  createCredential() {
    this.store.dispatch(createCredential());
  }

  onCredentialRevoked(accessKey) {
    this.store.dispatch(credentialRevoked({accessKey}));
  }

  onS3BucketCredentialsChanged(formData) {
    this.adminService.resetS3Services();
    this.store.dispatch(updateS3Credential({S3BucketCredentials: formData}));
  }

  ngOnDestroy(): void {
    this.newCredentialSub.unsubscribe();
  }
}
