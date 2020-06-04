import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {get} from 'lodash/fp';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {Store} from '@ngrx/store';
import {GuardBase} from '../../../shared/guards/guard-base';

@Injectable()
export class LeavingBeforeSaveAlertGuard extends GuardBase implements CanDeactivate<any> {
  private inEditMode: boolean;
  constructor(private dialog: MatDialog, private store: Store<any>) {
    super(store);
    this.inEditMode$.subscribe(inEditModes => {
      if (inEditModes.includes(true)) {
        this.inEditMode = true;
      } else {
        this.inEditMode = false;
      }
    });
  }

  public canDeactivate(component: any, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    const unGuard = get('root.queryParams.unGuard', nextState);
    if (unGuard === 'true') {
      return true;
    }
    if (!this.inEditMode) {
      return true;
    }

    const confirmation$ = Observable.create(observer => {
      const confirmDialogRef: MatDialogRef<any, boolean> = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title    : 'Attention',
          body     : 'You have unsaved changes. Do you want to stay on this page or leave without saving?',
          yes      : 'Leave',
          no       : 'Stay',
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

    return confirmation$;
  }
}

