import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, map, switchMap, tap} from 'rxjs/operators';
import {HTTP} from '../../../app.constants';
import {UsersGetAllResponse} from '../../../business-logic/model/users/usersGetAllResponse';
import {AuthCreateUserResponse} from '../../../business-logic/model/auth/authCreateUserResponse';
import {environment} from '../../../../environments/environment';
import {v1 as uuidV1} from 'uuid';
import {ApiAuthService} from '../../../business-logic/api-services/auth.service';
import {Observable, of} from 'rxjs';

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

  constructor(private httpClient: HttpClient, private authApi: ApiAuthService) {
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
      catchError( () => of(fromEnv()))
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
      return this.authApi.authFixedUsersMode({})
        .pipe(
          map((res) => res.enabled ? LoginModeEnum.password : LoginModeEnum.simple),
          tap((mode: LoginMode) => this._loginMode = mode));
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
}
