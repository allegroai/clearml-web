import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {guessAPIServerURL, HTTP} from '../../../../app.constants';
import {CredentialKeyExt} from '../../../core/reducers/common-auth-reducer';
import {MatDialogRef} from '@angular/material/dialog';
import {CreateCredentialDialogComponent} from '../../../../features/settings/containers/admin/create-credential-dialog/create-credential-dialog.component';

@Component({
  selector: 'sm-admin-dialog-template',
  templateUrl: './admin-dialog-template.component.html',
  styleUrls: ['./admin-dialog-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDialogTemplateComponent {
  public clipboardText: string;
  public label: string;
  public credentialsCreated: boolean;

  API_BASE_URL = HTTP.API_BASE_URL_NO_VERSION;
  fileBaseUrl = HTTP.FILE_BASE_URL;
  WEB_SERVER_URL = window.location.origin;

  @Input() newCredential: CredentialKeyExt;

  @Output() onCreateCredentials = new EventEmitter<{label: string}>();

  constructor(private dialog: MatDialogRef<CreateCredentialDialogComponent>) {
    if (this.API_BASE_URL === '/api') {
      this.API_BASE_URL = guessAPIServerURL();
    }
  }

  createCredentials() {
    this.credentialsCreated = true;
    this.onCreateCredentials.emit({label: this.label});
  }

  close() {
    this.dialog.close();
  }
}
