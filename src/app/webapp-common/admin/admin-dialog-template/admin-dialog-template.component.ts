import {Component, Input} from '@angular/core';
import {HTTP} from '../../../app.constants';

@Component({
  selector   : 'sm-admin-dialog-template',
  templateUrl: './admin-dialog-template.component.html',
  styleUrls  : ['./admin-dialog-template.component.scss']
})
export class AdminDialogTemplateComponent {
  private _newCredential: any;
  public host: string;
  public exampleText: { credentials: { access_key: any | string; secret_key: any } } = {
    credentials: {
      access_key: '',
      secret_key: ''
    }
  };
  API_BASE_URL = HTTP.API_BASE_URL_NO_VERSION;
  fileBaseUrl = HTTP.FILE_BASE_URL;
  WEB_SERVER_URL = window.location.origin;

  @Input() set newCredential(newCredential) {
    this._newCredential = newCredential;
    this.exampleText = {
      credentials: {
        access_key: newCredential.access_key,
        secret_key: newCredential.secret_key
      }
    };
  }

  get newCredential() {
    return this._newCredential;
  }

  constructor() {
    this.host = `${window.location.protocol}//${window.location.hostname}`;
  }

}
