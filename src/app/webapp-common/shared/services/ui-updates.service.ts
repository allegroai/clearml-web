import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import versionConf from '../../../../version.json';
import {Store} from '@ngrx/store';
import {UiUpdateDialogComponent} from '../../layout/ui-update-dialog/ui-update-dialog.component';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class UiUpdatesService {
  private updateDialog: MatDialogRef<UiUpdateDialogComponent, any>;

  constructor(private httpClient: HttpClient, private store: Store<any>, private matDialog: MatDialog,
  ) {

  }

  checkForUiUpdate() {
    window.setInterval(this.checkForUpdate.bind(this), (1000 * 60  * 3));
  }

  checkForUpdate() {
    if (this.httpClient) {
      this.httpClient.get('version.json').subscribe((onlineVersionFile: any) => {
        if (onlineVersionFile && versionConf.version !== onlineVersionFile.version) {
          if (this.matDialog.openDialogs.length === 0) {
            this.updateDialog = this.matDialog.open(UiUpdateDialogComponent);
          }
        }
      });
    }

  }

}
