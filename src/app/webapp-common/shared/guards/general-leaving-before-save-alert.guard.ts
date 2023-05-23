import {Injectable} from '@angular/core';
import {CanDeactivate} from '@angular/router';
import {Observable} from 'rxjs';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../ui-components/overlay/confirm-dialog/confirm-dialog.component';

@Injectable()
export class GeneralLeavingBeforeSaveAlertGuard implements CanDeactivate<any> {
  constructor(private dialog: MatDialog) {
  }

  public canDeactivate(component: any): Observable<boolean> | Promise<boolean> | boolean {

    if (!component.isDirty) {
      return true;
    }


    return Observable.create(observer => {
      const confirmDialogRef: MatDialogRef<any, boolean> = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Attention',
          body: 'You have unsaved changes. Do you want to stay on this page or leave without saving?',
          yes: 'Leave',
          no: 'Stay',
          iconClass: 'i-alert',
        }
      });

      confirmDialogRef.afterClosed().subscribe((confirmed) => {
        if (confirmed) {
          observer.next(true);
          observer.complete();
        } else {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}
