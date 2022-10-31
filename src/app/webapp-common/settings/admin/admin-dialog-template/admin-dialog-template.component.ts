import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {guessAPIServerURL, HTTP} from '../../../../app.constants';
import {CredentialKeyExt} from '../../../core/reducers/common-auth-reducer';
import {ConfigurationService} from '../../../shared/services/configuration.service';


@Component({
  selector: 'sm-admin-dialog-template',
  templateUrl: './admin-dialog-template.component.html',
  styleUrls: ['./admin-dialog-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDialogTemplateComponent implements OnInit {
  public clipboardText: string;
  public label: string;

  API_BASE_URL = HTTP.API_BASE_URL_NO_VERSION;
  fileBaseUrl = HTTP.FILE_BASE_URL;
  WEB_SERVER_URL = window.location.origin;
  jupyterCode: string;
  private _newCredential: CredentialKeyExt;

  @Input() set newCredential(cred: CredentialKeyExt) {
    this.jupyterCode =         `%env CLEARML_WEB_HOST=${this.WEB_SERVER_URL }
%env CLEARML_API_HOST=${this.displayedServerUrls?.apiServer || this.API_BASE_URL }
%env CLEARML_FILES_HOST=${this.displayedServerUrls?.filesServer || this.fileBaseUrl}${cred?.label? ('\n# ' + cred?.label):''}
%env CLEARML_API_ACCESS_KEY=${cred?.access_key || `<You’re API access key>`}
%env CLEARML_API_SECRET_KEY=${cred?.secret_key || `<You’re API secret key>`}`;
    this._newCredential = cred;
  };

  get newCredential() {
    return this._newCredential;
  }

  @Output() updateLabel = new EventEmitter<{ credential: CredentialKeyExt; label: string }>();
  public displayedServerUrls: { apiServer?: string; filesServer?: string };
  isJupyter: boolean;

  constructor(private configService: ConfigurationService) {
    if (this.API_BASE_URL === '/api') {
      this.API_BASE_URL = guessAPIServerURL();
    }
  }

  onUpdateLabel() {
    this.updateLabel.emit({credential: this.newCredential, label: this.label});
  }

  ngOnInit(): void {
    this.displayedServerUrls = this.configService.getStaticEnvironment().displayedServerUrls;

  }

  setIsJupyter(jupyter: boolean) {
    this.isJupyter = jupyter;
  }
}
