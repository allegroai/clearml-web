import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {guessAPIServerURL, HTTP} from '../../../app.constants';

@Component({
  selector   : 'sm-admin-dialog-template',
  templateUrl: './admin-dialog-template.component.html',
  styleUrls  : ['./admin-dialog-template.component.scss']
})
export class AdminDialogTemplateComponent implements AfterViewInit {
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

  @ViewChild('codeSnippet') codeSnippet: ElementRef<HTMLDivElement>;
  @Input() workspace: string;
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

  constructor(private cdr: ChangeDetectorRef) {
    this.host = `${window.location.protocol}//${window.location.hostname}`;
    if (this.API_BASE_URL === '/api') {
      this.API_BASE_URL = guessAPIServerURL();
    }
  }

  ngAfterViewInit(): void {
    this.clipboardText = this.codeSnippet.nativeElement.innerText + '\n';
    this.cdr.detectChanges();
  }
}
