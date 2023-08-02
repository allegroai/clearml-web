import {inject} from '@angular/core';
import {CanDeactivateFn} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {map} from 'rxjs/operators';

export const generalLeavingBeforeSaveAlertGuard: CanDeactivateFn<any> = (component) => {
  const dialog = inject(MatDialog);

  if (!component.isDirty) {
    return true;
  }

  return dialog.open(ConfirmDialogComponent, {
    data: {
      title: 'Attention',
      body: 'You have unsaved changes. Do you want to stay on this page or leave without saving?',
      yes: 'Leave',
      no: 'Stay',
      iconClass: 'i-alert',
    }
  }).afterClosed()
    .pipe(map(leave => leave));
};
