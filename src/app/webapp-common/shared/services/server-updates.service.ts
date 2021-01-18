import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {selectCurrentUser} from '../../core/reducers/users-reducer';
import versionConf from '../../../../version.json';
import {Store} from '@ngrx/store';
import {setServerUpdatesAvailable} from '../../core/actions/layout.actions';
import {ApiServerService} from '../../../business-logic/api-services/server.service';
import {filter, switchMap, take} from 'rxjs/operators';
import {ConfigurationService} from './configuration.service';
import {GetCurrentUserResponseUserObject} from '../../../business-logic/model/users/getCurrentUserResponseUserObject';

@Injectable({
  providedIn: 'root'
})
export class ServerUpdatesService {
  private initialized = false;
  private currentUser: GetCurrentUserResponseUserObject;

  constructor(private httpClient: HttpClient, private store: Store<any>, private serverService: ApiServerService) {
    if (localStorage.getItem('currentVersion') !== versionConf.version) {
      this.resetUpdateState();
    }
    this.store.select(selectCurrentUser).subscribe(user => this.currentUser = user);
  }

  private timeGap = 1000 * 60 * 60 * 24;

  // private timeGap = 1000 * 10;

  checkServerForUpdate(serverPath: string) {
    const nextUpdateCheckTime = new Date(localStorage.getItem('nextCheckForUpdateTime'));
    if (this.httpClient && (!nextUpdateCheckTime || nextUpdateCheckTime < new Date())) {
      this.serverService.serverInfo({}).pipe(
        take(1),
        switchMap(infoRes => this.httpClient.post<any>(`${serverPath}`, {
          url: window.location.origin,
          client: window.navigator.userAgent,
          uid: this.currentUser?.id,
          server_uuid: infoRes.uid || '',
          time: new Date().toISOString(),
          versions: {
            ['trains-server']: versionConf.version
          }
        })
        )
      ).pipe(filter(() => !ConfigurationService.globalEnvironment.hideUpdateNotice))
        .subscribe(updateRes => {
          this.store.dispatch(setServerUpdatesAvailable({availableUpdates: updateRes}));
          localStorage.setItem('nextCheckForUpdateTime', new Date(new Date().getTime() + (this.timeGap)).toISOString());
        });
    }
  }

  checkForUpdates(serverPath: string) {
    if (!this.initialized) {
      this.initialized = true;
      this.checkServerForUpdate(serverPath);
      setInterval(this.checkServerForUpdate.bind(this, serverPath), this.timeGap);
    }
  }


  get lastDismissedVersion() {
    return localStorage.getItem('dismissedVersion');
  }

  setDismissedVersion(version: string) {
    localStorage.setItem('dismissedVersion', version);
  }

  private resetUpdateState() {
    this.store.dispatch(setServerUpdatesAvailable({availableUpdates: null}));
    localStorage.setItem('currentVersion', versionConf.version);
    localStorage.removeItem('nextCheckForUpdateTime');
    localStorage.removeItem('dismissedVersion');
  }
}
