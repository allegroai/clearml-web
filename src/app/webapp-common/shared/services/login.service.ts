import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, filter, map, switchMap, tap} from 'rxjs/operators';
import {HTTP} from '../../../app.constants';
import {UsersGetAllResponse} from '../../../business-logic/model/users/usersGetAllResponse';
import {AuthCreateUserResponse} from '../../../business-logic/model/auth/authCreateUserResponse';
import {environment} from '../../../../environments/environment';
import {v1 as uuidV1} from 'uuid';
import {ApiAuthService} from '../../../business-logic/api-services/auth.service';
import {Observable, of} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {AuthFixedUsersModeExResponse} from '../../../business-logic/model/FixedUserModeExResponse';
import {clone} from 'lodash/fp';

export type LoginMode = 'simple' | 'password';

export const LoginModeEnum = {
  simple: 'simple' as LoginMode,
  password: 'password' as LoginMode,
};

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  protected basePath = HTTP.API_BASE_URL;
  private userKey: string;
  private userSecret: string;
  private companyID: string;
  private _loginMode;
  private _guestUser: { enabled: boolean; username: string; password: string };
  get guestUser () {
    return clone(this._guestUser);
  }

  constructor(private httpClient: HttpClient, private authApi: ApiAuthService, private dialog: MatDialog) {
  }

  initCredentials() {
    const fromEnv = () => {
      this.userKey = environment.userKey;
      this.userSecret = environment.userSecret;
      this.companyID = environment.companyID;
    };

    return this.getLoginMode().pipe(
      switchMap(mode => mode === LoginModeEnum.password ? of(fromEnv()) : this.httpClient.get('credentials.json')),
      tap((credentials: any) => {
        this.userKey = credentials.userKey;
        this.userSecret = credentials.userSecret;
        this.companyID = credentials.companyID;
      }),
      catchError(() => of(fromEnv()))
    );
  }

  getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const auth = window.btoa(this.userKey + ':' + this.userSecret);
    headers = headers.append('Authorization', 'Basic ' + auth);
    //    headers = headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return headers;
  }

  getLoginMode(): Observable<LoginMode> {
    if (this._loginMode !== undefined) {
      return of(this._loginMode);
    } else {
      return (this.authApi.authFixedUsersMode({}) as Observable<AuthFixedUsersModeExResponse>)
        .pipe(
          // for testing: map(res => ({...res, server_errors: {missed_es_upgrade: true}}) ),
          tap(res => (this.shouldOpenServerError(res.server_errors)) && this.openEs7MessageDialog(res.server_errors)),
          filter(res => !this.shouldOpenServerError(res.server_errors)),
          tap((res: AuthFixedUsersModeExResponse) => {
            this._loginMode = res.enabled ? LoginModeEnum.password : LoginModeEnum.simple;
            this._guestUser = res.guest;
          }),
          map(() => this._loginMode)
        );
    }
  }

  getUsers() {
    return this.httpClient.post<UsersGetAllResponse>(`${this.basePath}/users.get_all`, null, {headers: this.getHeaders()})
      .pipe(
        map((x: any) => x.data.users)
      );
  }

  passwordLogin(user: string, password: string) {
    let headers = new HttpHeaders();
    const auth = window.btoa(user + ':' + password);
    headers = headers.append('Authorization', 'Basic ' + auth);
    headers = headers.append('Access-Control-Allow-Credentials', '*');
    return this.httpClient.post<AuthCreateUserResponse>(`${this.basePath}/auth.login`, null, {headers, withCredentials: true});
  }

  login(userId: string) {
    let headers = this.getHeaders();
    headers = headers.append(`${environment.headerPrefix}-Impersonate-As`, userId);
    return this.httpClient.post(`${this.basePath}/auth.login`, null, {headers, withCredentials: true});
  }

  createUser(name: string) {
    let headers = this.getHeaders();
    headers = headers.append('Content-Type', 'application/json');
    const data = {
      email: uuidV1() + '@test.ai',
      name,
      company: this.companyID,
      given_name: name.split(' ')[0],
      family_name: name.split(' ')[1] ? name.split(' ')[1] : name.split(' ')[0]
    };
    return this.httpClient.post<AuthCreateUserResponse>(`${this.basePath}/auth.create_user`, data, {headers})
      .pipe(map((x: any) => x.data.id));
  }

  autoLogin(name: string, callback: (res) => void) {
    return this.createUser(name)
      .subscribe(id => this.login(id)
        .subscribe((res: any) => {
          callback(res);
        }));
  }

  private shouldOpenServerError(serverErrors: {missed_es_upgrade: boolean; es_connection_error: boolean}) {
    return serverErrors?.missed_es_upgrade || serverErrors?.es_connection_error;
  }

  private openEs7MessageDialog(serverErrors: {missed_es_upgrade: boolean; es_connection_error: boolean}) {

    // Mocking application header
    const imgElement = new Image();
    imgElement.setAttribute('src', '../../../../assets/logo-white.svg');
    imgElement.setAttribute('style', 'width: 100%; height: 64px; background-color: #141822; padding: 15px;');
    document.body.appendChild(imgElement);

    const body = `The Trains Server database seems to be unavailable.<BR>Possible reasons for this state are:<BR><BR>
<ul>
  ${serverErrors?.missed_es_upgrade ? '<li>Upgrading the Trains Server from a version earlier than v0.16 without performing the required data migration (see <a target="_blank" href="https://allegro.ai/docs/deploying_trains/trains_server_es7_migration/">instructions</a>).</li>' : ''}
  <li>Misconfiguration of the Elasticsearch container storage: Check the directory mappings in the docker-compose YAML configuration file
     are correct and the target directories have the right permissions (see <a target="_blank" href="https://allegro.ai/docs/deploying_trains/trains_deploy_overview/#option-3-a-self-hosted-trains-server">documentation</a>).</li>
  <li>Other errors in the database startup sequence: Check the elasticsearch logs in the elasticsearch container for problem description.</li>
</ul>
<BR>
After the issue is resolved and Trains Server is up and running, reload this page.`;

    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      data: {
        title: 'Database Error',
        body,

        yes: 'Reload',
        iconClass: 'i-alert'
      }
    });
    confirmDialogRef.afterClosed().subscribe(() => {
      window.location.reload();
    });
  }
}
