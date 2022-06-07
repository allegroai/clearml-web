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
export class AdminDialogTemplateComponent implements OnInit{
  public clipboardText: string;
  public label: string;

  API_BASE_URL = HTTP.API_BASE_URL_NO_VERSION;
  fileBaseUrl = HTTP.FILE_BASE_URL;
  WEB_SERVER_URL = window.location.origin;

  @Input() newCredential: CredentialKeyExt;

  @Output() updateLabel = new EventEmitter<{ credential: CredentialKeyExt; label: string }>();
  public displayedServerUrls: { apiServer?: string; filesServer?: string };

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
}
