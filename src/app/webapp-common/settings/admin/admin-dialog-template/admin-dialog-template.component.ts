import {ChangeDetectorRef, Component, Input, ViewChild} from '@angular/core';
import {guessAPIServerURL, HTTP} from '../../../../app.constants';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector   : 'sm-admin-dialog-template',
  templateUrl: './admin-dialog-template.component.html',
  styleUrls  : ['./admin-dialog-template.component.scss']
})
export class AdminDialogTemplateComponent {
  private _newCredential: any;
  public host: string;
  clipboardText: string;
  public exampleText: { credentials: { access_key: any | string; secret_key: any } } = {
    credentials: {
      access_key: '',
      secret_key: ''
    }
  };
  API_BASE_URL = HTTP.API_BASE_URL_NO_VERSION;
  fileBaseUrl = HTTP.FILE_BASE_URL;
  WEB_SERVER_URL = window.location.origin;

  @ViewChild('content') set contentElement(contetElement) {
    setTimeout(() => {
      this.textContent$.next(contetElement.nativeElement.textContent);
    });
  }
  @Input() workspace: {id: string, name: string};

  @Input() set newCredential(newCredential) {
    this._newCredential = newCredential;
    this.exampleText = {
      credentials: {
        access_key: newCredential.access_key,
        secret_key: newCredential.secret_key
      }
    };
  }
  textContent$ = new BehaviorSubject(null);
  get newCredential() {
    return this._newCredential;
  }
  constructor(private cdr: ChangeDetectorRef) {
    this.host = `${window.location.protocol}//${window.location.hostname}`;
    if (this.API_BASE_URL === '/api') {
      this.API_BASE_URL = guessAPIServerURL();
    }
  }
}
