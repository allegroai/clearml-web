import {LocationStrategy} from '@angular/common';
import {ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {CredentialKeyExt} from '@common/core/reducers/common-auth-reducer';
import {ConfigurationService} from '@common/shared/services/configuration.service';
import {NavbarItemComponent} from '@common/shared/ui-components/panel/navbar-item/navbar-item.component';
import {CopyClipboardComponent} from '@common/shared/ui-components/indicators/copy-clipboard/copy-clipboard.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';


@Component({
  selector: 'sm-admin-dialog-template',
  templateUrl: './admin-dialog-template.component.html',
  styleUrls: ['./admin-dialog-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NavbarItemComponent,
    CopyClipboardComponent,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ]
})
export class AdminDialogTemplateComponent {
  locationStrategy = inject(LocationStrategy);
  protected configService = inject(ConfigurationService);

  public clipboardText: string;
  public label: string;

  WEB_SERVER_URL = window.location.origin + this.locationStrategy.getBaseHref();
  jupyterCode: string;

  @Input() credentialName: string;
  @Input() newCredential: CredentialKeyExt;
  @Input() credentialsComment: string;
  @Input() serviceUserMode: boolean;

  @Output() updateLabel = new EventEmitter<{ credential: CredentialKeyExt; label: string }>();
  isJupyter: boolean;

  onUpdateLabel() {
    this.updateLabel.emit({credential: this.newCredential, label: this.label});
  }

  setIsJupyter(jupyter: boolean) {
    this.isJupyter = jupyter;
  }

  getCopyContent() {
    let res =  'api {\n';
    if (this.credentialsComment) {
      res += `  # ${this.credentialsComment}\n`;
    }
    res += `  web_server: ${this.WEB_SERVER_URL}
  api_server: ${this.configService.apiServerUrl()}\n`;
    const filesServer = this.configService.fileServerUrl();
    if (filesServer) {
      res += `  files_server: ${filesServer}\n`;
    }
    if (this.newCredential.label) {
      res += `  # ${this.newCredential.label}\n`;
    }
    res += `  credentials {
    "access_key" = "${this.newCredential.access_key}"
    "secret_key" = "${this.newCredential.secret_key}"
  }
}`;
    return res;
  }

  getJupiterCode() {
    let res = `%env CLEARML_WEB_HOST=${this.WEB_SERVER_URL}
%env CLEARML_API_HOST=${this.configService.apiServerUrl()}\n`;
    const filesServer = this.configService.fileServerUrl();
    if (filesServer) {
      res += `%env CLEARML_FILES_HOST=${filesServer}\n`;
    }
    if(this.newCredential.label) {
      res += `# ${this.newCredential.label}\n`;
    }
    res += `%env CLEARML_API_ACCESS_KEY=${this.newCredential?.access_key || '<You\'re API access key>'}
%env CLEARML_API_SECRET_KEY=${this.newCredential?.secret_key || '<You\'re API secret key>'}`;
    return res;
  }
}
