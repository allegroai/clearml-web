import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import versionConf from '../../../../version.json';
import {UiUpdateDialogComponent} from '../../layout/ui-update-dialog/ui-update-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {take} from 'rxjs/operators';

export interface VersionFile {
  version: string,
  date: string,
  'build-number': string,
  'docker-image': string,
  'webapp-treeish': string,
  'webapp-common-treeish': string,
  'webapp-commit': string,
  'webapp-common-commit': string
}

@Injectable({
  providedIn: 'root'
})
export class UiUpdatesService {
  private httpClient = inject(HttpClient);
  private matDialog = inject(MatDialog);

  checkForUiUpdate() {
    window.setInterval(this.checkForUpdate.bind(this), (1000 * 60  * 3));
  }

  checkForUpdate() {
    if (this.httpClient) {
      this.httpClient.get('version.json')
        .pipe(take(1))
        .subscribe((onlineVersionFile: VersionFile) => {
          if (onlineVersionFile && versionConf['docker-image'] !== onlineVersionFile['docker-image'] && this.matDialog.openDialogs.length === 0) {
            this.matDialog.open(UiUpdateDialogComponent);
          }
        });
    }
  }
}
