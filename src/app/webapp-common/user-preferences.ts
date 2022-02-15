import {ApiUsersService} from '~/business-logic/api-services/users.service';
import {Observable, of} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {cloneDeep, isEqual} from 'lodash/fp';
import {UsersSetPreferencesRequest} from '~/business-logic/model/users/usersSetPreferencesRequest';
import {ConfigurationService} from './shared/services/configuration.service';
import {LoginService} from '~/shared/services/login.service';
import {Injectable} from '@angular/core';

const USER_PREFERENCES_STORAGE_KEY = '_USER_PREFERENCES_';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const enum USER_PREFERENCES_KEY {
  firstLogin = 'firstLogin',
}

@Injectable()
export class UserPreferences {

  private preferences: { [key: string]: any };

  constructor(private userService: ApiUsersService) {
      this.removeFromLocalStorage();
  }

  loadPreferences(): Observable<{ [key: string]: any }> {
    return this.userService.usersGetPreferences({})
      .pipe(
        map(res => res.preferences),
        map(pref => {
          this.preferences = pref;
          this.checkIfFirstTimeLoginAndSaveData(pref);
          this.cleanPreferencesInPreferences(pref);
          let prefsString = JSON.stringify(pref);
          prefsString = prefsString.split('--DOT--').join('.');
          pref = JSON.parse(prefsString);
          return pref;
        }),
        catchError((err) => {
          // in case of 401 we have login logic in other places - throw it
          if (err.status !== 401) {
            return of({});
          } else {
            throw err;
          }

        }),
        tap(preferences => this.preferences = preferences),
      );
  }

  public setPreferences(key: string, value: any) {
    if (this.preferences && !isEqual(this.preferences[key], value)) {
      const prefs = {[key]: cloneDeep(value)};
      this.preferences = {...this.preferences, ...prefs};
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

  private checkIfFirstTimeLoginAndSaveData(pref) {
    if (!pref.version) {
      this.setPreferences('version', 1);
      this.setPreferences(USER_PREFERENCES_KEY.firstLogin, true);
      window.localStorage.setItem(USER_PREFERENCES_KEY.firstLogin, '0');
    } else {
      const firstLoginTime = window.localStorage.getItem(USER_PREFERENCES_KEY.firstLogin) || new Date().getTime().toString();
      window.localStorage.setItem(USER_PREFERENCES_KEY.firstLogin, firstLoginTime);
    }
  }

  private removeFromLocalStorage() {
    localStorage.removeItem(USER_PREFERENCES_STORAGE_KEY);
  }

  private saveToServer(partialPreferences: { [key: string]: any }) {
    this.userService.usersSetPreferences({preferences: partialPreferences} as UsersSetPreferencesRequest).subscribe();
  }

  private cleanPreferencesInPreferences(pref: { [key: string]: any }) {
    if (pref.preferences) {
      this.setPreferences('preferences', null);
    }
  }
}

export const loadUserAndPreferences = (
  loginService: LoginService,
  confService: ConfigurationService,
): () => Promise<any> => (): Promise<any> => new Promise((resolve) => {
  confService.initConfigurationService().subscribe(() =>
    loginService.initCredentials().subscribe(() => {
      if (window.location.pathname.startsWith('/callback')) {
        if (window.location.pathname.endsWith('verify')) {
          const providerName = window.location.pathname.slice(10, -7);
          const provider = loginService.sso.find(provide => provide.name === providerName);
          window.location.href = provider.url;
        } else {
          loginService.ssoFlow(resolve);
        }
      } else {
        loginService.loginFlow(resolve);
      }
    }));
});
