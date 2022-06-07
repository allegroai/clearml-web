import {Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {updateCredentialLabel} from '@common/core/actions/common-auth.actions';
import {OrganizationGetUserCompaniesResponseCompanies} from '~/business-logic/model/organization/organizationGetUserCompaniesResponseCompanies';
import {Observable} from 'rxjs';
import {CredentialKeyExt, selectNewCredential} from '@common/core/reducers/common-auth-reducer';

@Component({
  selector: 'sm-create-credential-dialog',
  templateUrl: './create-credential-dialog.component.html',
  styleUrls: ['./create-credential-dialog.component.scss']
})
  export class CreateCredentialDialogComponent {
  public newCredential$: Observable<CredentialKeyExt>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {credentials: any; workspace?: OrganizationGetUserCompaniesResponseCompanies},
    private store: Store
  ) {
    this.newCredential$ = this.store.select(selectNewCredential);
  }

  updateLabel({credential, label}) {
    this.store.dispatch(updateCredentialLabel({credential, label}));
  }
}
