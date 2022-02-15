import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, filter, map, mergeMap, retryWhen, switchMap, tap} from 'rxjs/operators';
import {HTTP} from '~/app.constants';
import {UsersGetAllResponse} from '~/business-logic/model/users/usersGetAllResponse';
import {AuthCreateUserResponse} from '~/business-logic/model/auth/authCreateUserResponse';
import {v1 as uuidV1} from 'uuid';
import {EMPTY, Observable, of, throwError, timer} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {LoginModeResponse} from '~/business-logic/model/LoginModeResponse';
import {clone} from 'lodash/fp';
import {ApiLoginService} from '~/business-logic/api-services/login.service';
import {ConfigurationService} from './configuration.service';
import {Environment} from '../../../../environments/base';
import {USER_PREFERENCES_KEY, UserPreferences} from '@common/user-preferences';
import {setUserLoginState} from '@common/login/login.actions';
import {fetchCurrentUser} from '@common/core/actions/users.actions';
import {Store} from '@ngrx/store';
import {ConfirmDialogConfig} from '@common/shared/ui-components/overlay/confirm-dialog/confirm-dialog.model';
import {Router} from '@angular/router';

export type LoginMode = 'simple' | 'password' | 'ssoOnly';

export const LoginModeEnum = {
  simple: 'simple' as LoginMode,
  password: 'password' as LoginMode,
  ssoOnly: 'ssoOnly' as LoginMode
};

@Injectable({
  providedIn: 'root'
})
export class BaseLoginService {
  signupMode: boolean;
  protected basePath = HTTP.API_BASE_URL;
  private userKey: string;
  private userSecret: string;
  private companyID: string;
  private _loginMode: LoginMode;
  private _guestUser: { enabled: boolean; username: string; password: string };
  private environment: Environment;
  get guestUser() {
    return clone(this._guestUser);
  }
  private _sso: {name: string; url: string; displayName?: string}[];
  get sso() {
    return this._sso;
  }
  protected _authenticated: boolean;
  get authenticated(): boolean {
    return this._authenticated;
  }

  constructor(
    protected httpClient: HttpClient,
    protected loginApi: ApiLoginService,
    protected dialog: MatDialog,
    protected configService: ConfigurationService,
    protected store: Store,
    protected router: Router,
    protected userPreferences: UserPreferences
  ) {
    configService.globalEnvironmentObservable.subscribe(env => {
      const firstLogin = !window.localStorage.getItem(USER_PREFERENCES_KEY.firstLogin);
      this.environment = env;
      this.signupMode = !!this.environment.communityServer && firstLogin;
    });
  }

  initCredentials() {
    const fromEnv = () => {
      this.userKey = this.environment.userKey;
      this.userSecret = this.environment.userSecret;
      this.companyID = this.environment.companyID;
    };

    return this.getLoginMode().pipe(
      retryWhen(errors => errors.pipe(
        mergeMap((err, i) => i > 2 ? throwError('Error from retry!') : timer(500))
      )),
      catchError(() => {
        this.openServerError();
        return of({});
      }),
      switchMap(mode => mode === LoginModeEnum.simple ? this.httpClient.get('credentials.json') : of(fromEnv())),
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
      return this.getLoginSupportedModes(this.signupMode && 'signup')
        .pipe(
          // for testing: map(res => ({...res, server_errors: {missed_es_upgrade: true}}) ),
          tap(res => (res?.server_errors && this.shouldOpenServerError(res.server_errors)) && this.openEs7MessageDialog(res.server_errors)),
          filter(res => !this.shouldOpenServerError(res?.server_errors)),
          tap((res: LoginModeResponse) => {
            this._authenticated = res.authenticated;
            this._loginMode = res.basic.enabled ? LoginModeEnum.password : res.sso_providers?.length > 0 ? LoginModeEnum.ssoOnly : LoginModeEnum.simple;
            this._guestUser = res.basic.guest;
            this._sso = res.sso_providers;
          }),
          map(() => this._loginMode)
        );
    }
  }

  public getLoginSupportedModes(additionalState = ''): Observable<LoginModeResponse> {
    const url = new URL(window.location.href);
    let state = url.searchParams.get('redirect') ??
      url.searchParams.get('state') ??
      (url.pathname === '/login' ? '/' : url.pathname + url.search);
    if (additionalState && state) {
      const stateUrl = new URL(`http://aaa${state}`);
      stateUrl.searchParams.append(additionalState, '');
      state = stateUrl.pathname + stateUrl.search;
    }
    return this.loginApi.loginSupportedModes({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      callback_url_prefix: url.origin + '/callback_',
      state: (state === '/' || state.startsWith('callback_') || state.startsWith('/callback_')) ? undefined : state
    }).pipe(map((res: LoginModeResponse) => {
      const auth0 = res.sso_providers.find(provider => provider.name == 'auth0');
      if (auth0 && this.signupMode) {
        const auth0Url = new URL(auth0.url);
        auth0Url.searchParams.set('screen_hint', 'signup');
        auth0.url = auth0Url.toString();
      }
      return {
        /* eslint-disable @typescript-eslint/naming-convention */
        ...res,
        ...(res.sso_providers ?
          {sso_providers: res.sso_providers.map(provider => ({...provider, displayName: provider.display_name}))} :
          res.sso && {sso_providers: Object.keys(res.sso).map((key: string) => ({name: key, url: res.sso[key]}))})
        /* eslint-enable @typescript-eslint/naming-convention */
      };
    }));
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
    headers = headers.append(`${this.environment.headerPrefix}-Impersonate-As`, userId);
    return this.httpClient.post(`${this.basePath}/auth.login`, null, {headers, withCredentials: true});
  }

  createUser(name: string) {
    let headers = this.getHeaders();
    headers = headers.append('Content-Type', 'application/json');
    const data = {
      /* eslint-disable @typescript-eslint/naming-convention */
      email: uuidV1() + '@test.ai',
      name,
      company: this.companyID,
      given_name: name.split(' ')[0],
      family_name: name.split(' ')[1] ? name.split(' ')[1] : name.split(' ')[0]
      /* eslint-enable @typescript-eslint/naming-convention */
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

  // eslint-disable-next-line @typescript-eslint/naming-convention
  private shouldOpenServerError(serverErrors: {missed_es_upgrade: boolean; es_connection_error: boolean}) {
    return serverErrors?.missed_es_upgrade || serverErrors?.es_connection_error;
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  private openEs7MessageDialog(serverErrors: {missed_es_upgrade: boolean; es_connection_error: boolean}) {

    // Mocking application header
    const imgElement = new Image();
    imgElement.setAttribute('src', this.environment.branding.logo);
    imgElement.setAttribute('style', 'width: 100%; height: 64px; background-color: #141822; padding: 15px;');
    document.body.appendChild(imgElement);

    const body = `The ClearML Server database seems to be unavailable.<BR>Possible reasons for this state are:<BR><BR>
<ul>
  ${serverErrors?.missed_es_upgrade ? '<li>Upgrading the Trains Server from a version earlier than v0.16 without performing the required data migration (see <a target="_blank" href="https://allegro.ai/clearml/docs/deploying_trains/trains_server_es7_migration/">instructions</a>).</li>' : ''}
  <li>Misconfiguration of the Elasticsearch container storage: Check the directory mappings in the docker-compose YAML configuration file
     are correct and the target directories have the right permissions (see <a target="_blank" href="https://allegro.ai/clearml/docs/deploying_trains/trains_deploy_overview/#option-3-a-self-hosted-trains-server">documentation</a>).</li>
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

  private openServerError() {
    // Mocking application header
    const imgElement = new Image();
    imgElement.setAttribute('src', this.environment.branding.logo);
    imgElement.setAttribute('style', 'width: 100%; height: 64px; background-color: #141822; padding: 15px;');
    document.body.appendChild(imgElement);

    const body = this.environment.serverDownMessage;

    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      data: {
        width: 440,
        title: 'Server Unavailable',
        body,
        yes: 'Reload',
        iconClass: 'i-alert',
        centerText: true
      } as ConfirmDialogConfig
    });
    confirmDialogRef.afterClosed().subscribe(() => {
      window.location.reload();
    });
  }

  clearLoginCache() {
    this._loginMode = undefined;
  }

  afterLogin(resolve, store) {
    this.userPreferences.loadPreferences()
      .subscribe(() => {
        store.dispatch(fetchCurrentUser());
        resolve(null);
      });
  }

  loginFlow(resolve, skipInvite = false) {
    if (location.search.includes('invite') && !skipInvite) {
      const currentURL = new URL(location.href);
      const inviteId = currentURL.searchParams.get('invite');
      this.store.dispatch(setUserLoginState({user: null, inviteId, crmForm: null}));
    }
    const redirectToLogin = (status) => {
      if (status === 401) {
        const redirectUrl: string = window.location.pathname + window.location.search;
        if (
          !['/login/signup', '/login', '/dashboard', '/'].includes(redirectUrl) &&
          (this.guestUser?.enabled || ConfigurationService.globalEnvironment.autoLogin)
        ) {
          if (this.guestUser?.enabled) {
            this.passwordLogin(this.guestUser.username, this.guestUser.password)
              .subscribe(() => this.afterLogin.bind(this)(resolve, this.store));
          } else if (ConfigurationService.globalEnvironment.autoLogin) {
            const name = `${(new Date()).getTime().toString()}`;
            this.autoLogin(name, this.afterLogin.bind(this, resolve, this.store));
          } else {
            resolve(null);
          }
        } else if (!['/login/signup', '/login'].includes(redirectUrl)) {
          const targetUrl = (redirectUrl && redirectUrl != '/') ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login';
          window.history.replaceState(window.history.state, '', targetUrl);
        }
      }
      resolve(null);
      return EMPTY;
    };

    if (this.authenticated === false) {
      redirectToLogin(401);
    } else {
      this.store.dispatch(fetchCurrentUser());
      this.userPreferences.loadPreferences().pipe(
        catchError((err) => redirectToLogin(err.status))
      ).subscribe(
        () => {
          resolve(null);
        },
        () => {
          // Do nothing
        });
    }
  }
}
