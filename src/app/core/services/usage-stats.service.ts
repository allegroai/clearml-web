import { Injectable } from '@angular/core';
import {Store} from '@ngrx/store';
import {filter} from 'rxjs/operators';
import {updateUsageStats} from '../actions/usage-stats.actions';
import {selectPromptUser} from '../reducers/usage-stats.reducer';
import {MatLegacyDialog as MatDialog} from '@angular/material/legacy-dialog';
import {ConfirmDialogComponent} from '@common/shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {ConfigurationService} from '@common/shared/services/configuration.service';

@Injectable({
  providedIn: 'root'
})
export class UsageStatsService {

  constructor(
    private store: Store<any>,
    private dialog: MatDialog,
  ) {

    if (!ConfigurationService.globalEnvironment.demo) {
      this.store.select(selectPromptUser)
        .pipe(filter(prompt => !!prompt))
        .subscribe(() => {
          const dialogRef = this.dialog.open(ConfirmDialogComponent,
            {
              data: {
                title: 'Help us improve ClearML',
                body: `Please allow the ClearML server to send anonymous usage metrics so we can better understand how ClearML is being used and make it even better.<BR>
  This setting can be changed through the Profile page.`,
                yes: 'Approve',
                no: 'Deny',
                iconClass: 'i-terms',
              }
            });

          dialogRef.afterClosed().subscribe((allowed: boolean) => {
            this.store.dispatch(updateUsageStats({allowed}));
          });
        });
    }
  }
}
