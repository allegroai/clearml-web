import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {SmSyncStateSelectorService} from '../../core/services/sync-state-selector.service';
import {selectCurrentUser} from '../../core/reducers/users-reducer';
import versionConf from '../../../../version.json';
import {Store} from '@ngrx/store';
import {SetServerUpdatesAvailable} from '../../core/actions/layout.actions';
import {ApiServerService} from '../../../business-logic/api-services/server.service';
import {switchMap, take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ServerUpdatesService {

  constructor(private httpClient: HttpClient, public syncSelector: SmSyncStateSelectorService, private store: Store<any>, private serverService: ApiServerService) {
    if (localStorage.getItem('currentVersion') !== versionConf.version) {
      this.resetUpdateState();
    }
  }

  private timeGap = 1000 * 60 * 60 * 24;

  // private timeGap = 1000 * 10;

  checkServerForUpdate(serverPath: string) {
    const nextUpdateCheckTime = new Date(localStorage.getItem('nextCheckForUpdateTime'));

    if (this.httpClient && (!nextUpdateCheckTime || nextUpdateCheckTime < new Date())) {
      this.serverService.serverInfo({}).pipe(
        take(1),
        switchMap(infoRes => this.httpClient.post<any>(`${serverPath}/updates`, {
            url: window.location.origin,
            client: window.navigator.userAgent,
            uid: this.syncSelector.selectSync(selectCurrentUser).id,
            server_uuid: infoRes.uid || '',
            time: new Date().toISOString(),
            versions: {
              ['trains-server']: versionConf.version
            }
          })
        )
      ).subscribe(updateRes => {
          this.store.dispatch(new SetServerUpdatesAvailable(updateRes));
          localStorage.setItem('nextCheckForUpdateTime', new Date(new Date().getTime() + (this.timeGap)).toISOString());
        }
      );
    }
  }

  checkForUpdates(serverPath: string) {
    this.checkServerForUpdate(serverPath);
    setInterval(this.checkServerForUpdate.bind(this, serverPath), this.timeGap);
  }


  get lastDismissedVersion() {
    return localStorage.getItem('dismissedVersion');
  }

  setDismissedVersion(version: string) {
    localStorage.setItem('dismissedVersion', version);
  }

  private resetUpdateState() {
    this.store.dispatch(new SetServerUpdatesAvailable(null));
    localStorage.setItem('currentVersion', versionConf.version);
    localStorage.removeItem('nextCheckForUpdateTime');
    localStorage.removeItem('dismissedVersion');
  }
}
