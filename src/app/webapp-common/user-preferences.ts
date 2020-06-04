import {ApiUsersService} from '../business-logic/api-services/users.service';
import {EMPTY, Observable, of} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {cloneDeep, isEqual} from 'lodash/fp';
import {UsersSetPreferencesRequest} from '../business-logic/model/users/usersSetPreferencesRequest';
import {LoginService} from './shared/services/login.service';
import {FetchCurrentUser} from './core/actions/users.actions';
import {environment} from '../../environments/environment';
import {Store} from '@ngrx/store';

const USER_PREFERENCES_STORAGE_KEY = '_USER_PREFERENCES_';

export function loadUserAndPreferences(userService: ApiUsersService, loginService: LoginService, store: Store<any>): () => Promise<any> {
  return (): Promise<any> => {

    return new Promise((resolve, reject) => {
      const loginFlow = () => {
        userPreferences.setUserService(userService);
        userPreferences.loadPreferences().pipe(
          tap(_ => resolve()),   // resolve in case user is logged-in and preferences are loaded
          catchError((err) => {
            const redirectUrl: string = window.location.pathname;
            if (environment.autoLogin && err.status === 401 && !['/login', '/dashboard', '/'].includes(redirectUrl)) {
              const name = `${(new Date()).getTime().toString()}`;
              loginService.autoLogin(name, afterLogin.bind(this, resolve, store));
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


      if (environment.spaLogin) {
        loginService.initCredentials().subscribe(() => loginFlow());
      } else {
        loginFlow();
      }
    });
  };
}

function afterLogin(resolve, store) {
  userPreferences.loadPreferences()
    .subscribe(() => {
      store.dispatch(new FetchCurrentUser());
      resolve();
    });
}

class UserPreferences {

  private preferences: object;
  private userService: ApiUsersService;

  constructor() {
  }

  setUserService(userService: ApiUsersService) {
    this.userService = userService;
  }

  loadPreferences(): Observable<Object> {
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
          let prefs_string = JSON.stringify(pref);
          prefs_string = prefs_string.split('--DOT--').join('.');
          pref = JSON.parse(prefs_string);
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
    if (typeof prefs === 'string') {
      return;
    }
    for (const key in prefs) {
      this.replaceDots(prefs[key]);
      if (key.includes('.')) {
        const newKey = key.split('.').join('--DOT--');
        prefs[newKey] = prefs[key];
        delete prefs[key];
      }
    }
  }

  public getPreferences(key: string) {
    return this.preferences[key];
  }

  public isReady() {
    return !!this.preferences;
  }

  private loadFromLocalStorage(): object {
    try {
      return JSON.parse(localStorage.getItem(USER_PREFERENCES_STORAGE_KEY));
    } catch (e) {
      return {};
    }
  }

  private saveToLocalStorage(preferences: object) {
    localStorage.setItem(USER_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  }

  private saveToServer(partialPreferences: object) {
    this.userService.usersSetPreferences(<UsersSetPreferencesRequest>{preferences: partialPreferences}).subscribe();
  }
}

export const userPreferences = new UserPreferences();
