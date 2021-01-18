import {ApiUsersService} from '../business-logic/api-services/users.service';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {cloneDeep, isEqual} from 'lodash/fp';
import {UsersSetPreferencesRequest} from '../business-logic/model/users/usersSetPreferencesRequest';
import {LoginService} from './shared/services/login.service';
import {FetchCurrentUser} from './core/actions/users.actions';
import {Store} from '@ngrx/store';
import {HttpErrorResponse} from '@angular/common/http';
import {ErrorService} from './shared/services/error.service';
import {setLoginError, setUserLoginState} from './login/login.actions';
import {cleanUserData} from './shared/utils/shared-utils';
import {ConfigurationService} from './shared/services/configuration.service';

const USER_PREFERENCES_STORAGE_KEY = '_USER_PREFERENCES_';

class UserPreferences {

  private preferences: {[key: string]: any};
  private userService: ApiUsersService;

  constructor() {
  }

  setUserService(userService: ApiUsersService) {
    this.userService = userService;
  }

  loadPreferences(): Observable<{[key: string]: any}> {
    return this.userService.usersGetPreferences({})
      .pipe(
        map(res => res.preferences),
        map(pref => {
          if (pref.version !== 1 && pref.experiments) {
            this.preferences = {};
            this.setPreferences('experiments', {});
            this.setPreferences('models', {});
            this.setPreferences('version', 1);
          }
          let prefsString = JSON.stringify(pref);
          prefsString = prefsString.split('--DOT--').join('.');
          pref = JSON.parse(prefsString);
          return pref;
        }),
        tap(this.saveToLocalStorage),
        catchError((err) => {
          // in case of 401 we have login logic in other places - throw it
          if (err.status !== 401) {
            return of(this.loadFromLocalStorage());
          } else {
            throw err;
          }

        }),
        tap(preferences => this.preferences = preferences),
      );
  }

  public setPreferences(key: string, value: any) {
    if (this.preferences && !isEqual(this.preferences[key], value)) {
      this.preferences = {...this.preferences, [key]: {...value}};
      this.saveToLocalStorage(this.preferences);
      const prefs = {[key]: cloneDeep(value)};
      this.replaceDots(prefs);
      this.saveToServer(prefs);
      return;
    }
  }

  private replaceDots(prefs: any) {
    if (typeof prefs === 'string' || prefs === null || prefs === undefined) {
      return;
    }
    Object.keys(prefs).forEach(key => {
      this.replaceDots(prefs[key]);
      if (key.includes('.')) {
        const newKey = key.split('.').join('--DOT--');
        prefs[newKey] = prefs[key];
        delete prefs[key];
      }
    });
  }

  public getPreferences(key: string) {
    return this.preferences[key];
  }

  public isReady() {
    return !!this.preferences;
  }

  private loadFromLocalStorage(): {[key: string]: any} {
    try {
      return JSON.parse(localStorage.getItem(USER_PREFERENCES_STORAGE_KEY));
    } catch (e) {
      return {};
    }
  }

  private saveToLocalStorage(preferences: {[key: string]: any}) {
    localStorage.setItem(USER_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  }

  private saveToServer(partialPreferences: {[key: string]: any}) {
    this.userService.usersSetPreferences({preferences: partialPreferences} as UsersSetPreferencesRequest).subscribe();
  }
}

export const userPreferences = new UserPreferences();

function afterLogin(resolve, store) {
  userPreferences.loadPreferences()
    .subscribe(() => {
      store.dispatch(new FetchCurrentUser());
      resolve();
    });
}

export function loadUserAndPreferences(
  userService: ApiUsersService,
  loginService: LoginService,
  store: Store<any>,
  errorSvc: ErrorService,
  confService: ConfigurationService
): () => Promise<any> {
  return (): Promise<any> => new Promise((resolve) => {
    confService.initConfigurationService();

    const loginFlow = (skipInvite = false) => {
      if (location.search.includes('invite') && !skipInvite) {
        const currentURL = new URL(location.href);
        const inviteId = currentURL.searchParams.get('invite');
        store.dispatch(setUserLoginState({user: null, inviteId: inviteId, crmForm: null}));
      }
      userPreferences.setUserService(userService);
      userPreferences.loadPreferences().pipe(
        tap(_ => resolve()),   // resolve in case user is logged-in and preferences are loaded
        catchError((err) => {
          const redirectUrl: string = window.location.pathname;
          if (err.status === 401 && !['/login/signup', '/login', '/dashboard', '/'].includes(redirectUrl)) {
            if (loginService.guestUser?.enabled) {
              loginService.passwordLogin(loginService.guestUser.username, loginService.guestUser.password)
                .subscribe(() => afterLogin.bind(this)(resolve, store));
            } else if (ConfigurationService.globalEnvironment.autoLogin) {
              const name = `${(new Date()).getTime().toString()}`;
              loginService.autoLogin(name, afterLogin.bind(this, resolve, store));
            } else {
              resolve();
            }
          } else {
            resolve();
          }
          return EMPTY;
        })
      ).subscribe(() => {
        // Do nothing
      }, (error) => {
        // Do nothing
      });
    };

    const ssoFlow = () => {
      const url = new URL(window.location.href);
      let redirect = url.searchParams.get('state') || '/';
      const signup = redirect.includes('signup');
      redirect = redirect.replace(/[&]?signup=/, '');
      let invite: string;
      if (redirect.includes('invite')) {
        const redirectURL = new URL('https://aaa/' + redirect);
        invite = redirectURL.searchParams.get('invite');
        store.dispatch(setUserLoginState({user: null, inviteId: invite, crmForm: null}));
      }
      loginService.ssoLogin({signup_flow: signup})
        .pipe(catchError((err: HttpErrorResponse) => {
          const message = errorSvc.getErrorMsg(err?.error) || 'failed SSO login';
          store.dispatch(setLoginError({error: message}));
          loginService.clearLoginCache();
          const targetUrl = redirect ? `/login?redirect=${encodeURIComponent(redirect)}${invite? '&invite='+ invite : ''}` : `/login${invite? '?invite='+ invite : ''}`;
          window.history.replaceState(window.history.state, '', targetUrl);
          return throwError('failed SSO login');
        }))
        .subscribe((data) => {
          if (data.userState.user_id && data.state?.includes('signup=')) {
            store.dispatch(setLoginError({error: 'User already exists. Please sign in.'}));
            loginService.clearLoginCache();
            const targetUrl = redirect ? `/login?redirect=${encodeURIComponent(redirect)}${invite? '&invite='+ invite : ''}` : `/login${invite? '?invite='+ invite : ''}`;
            window.history.replaceState(window.history.state, '', targetUrl);
          } else if (signup) {
            let crmForm;
            try {
              crmForm = JSON.parse(data.userState.signup_info.crm_form);
            }
            catch{}
            store.dispatch(setUserLoginState({user: cleanUserData(data.userState.signup_info), inviteId: invite, crmForm}));
            const signupURL = `/login/signup?redirect=${encodeURIComponent(redirect)}`;
            window.history.replaceState(window.history.state, '', signupURL);
          } else {
            store.dispatch(setUserLoginState({user: cleanUserData(data.userState.signup_info), inviteId: invite, crmForm: null}));
            window.history.replaceState(window.history.state, '', redirect);
          }
          loginFlow(true);
        }, (err) => loginFlow());
    };

    loginService.initCredentials().subscribe(() => {
      if (window.location.pathname.startsWith('/callback')) {
        ssoFlow();
      } else {
        loginFlow();
      }
    });
  });
}
