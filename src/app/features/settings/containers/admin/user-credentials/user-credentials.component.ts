import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {CredentialKeyExt, selectCredentials, selectNewCredential} from '@common/core/reducers/common-auth-reducer';
import {selectCurrentUser} from '@common/core/reducers/users-reducer';
import {filter, take} from 'rxjs/operators';
import {credentialRevoked, getAllCredentials} from '@common/core/actions/common-auth.actions';
import {Store} from '@ngrx/store';
import { createCredential } from '@common/core/actions/common-auth.actions';
import {GetCurrentUserResponseUserObject} from '~/business-logic/model/users/getCurrentUserResponseUserObject';

@Component({
  selector: 'sm-user-credentials',
  templateUrl: './user-credentials.component.html',
  styleUrls: ['./user-credentials.component.scss']
})
export class UserCredentialsComponent implements OnInit, OnDestroy {

  public credentials$: Observable<{ [workspaceId: string]: CredentialKeyExt[] }>;
  private newCredentialSub: Subscription;
  creatingCredentials = false;
  private user: GetCurrentUserResponseUserObject;
  constructor(private store: Store) { }

  ngOnInit(): void {
    this.store.select(selectCurrentUser)
      .pipe(filter(user => !!user), take(1))
      .subscribe(user => {
        this.user = user;
        this.store.dispatch(getAllCredentials());
      });
    this.credentials$ = this.store.select(selectCredentials);

    this.newCredentialSub = this.store.select(selectNewCredential)
      .subscribe(() => {
        this.creatingCredentials = false;
      });
  }

  createCredential() {
    this.creatingCredentials = true;
    this.store.dispatch(createCredential({workspace: this.user.company, openCredentialsPopup: true}));
  }

  onCredentialRevoked(accessKey) {
    this.store.dispatch(credentialRevoked({accessKey, workspaceId: this.user.company.id}));
  }

  ngOnDestroy(): void {
    this.newCredentialSub.unsubscribe();
  }
}
