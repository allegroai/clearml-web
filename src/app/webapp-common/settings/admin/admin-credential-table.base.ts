import { EventEmitter, Input, Output, Directive } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import { ICONS } from '../../constants';
import {CredentialKey} from '../../../business-logic/model/auth/credentialKey';

@Directive()
export class AdminCredentialTableBaseDirective {
  @Input() credentials: CredentialKey[];
  @Output() credentialRevoked = new EventEmitter();
  public ICONS                = ICONS;
  public dialog: MatDialog;

  constructor(dialog: MatDialog) {
    this.dialog = dialog;
  }

  confirmPopUp(credential) {
    const confirmDialogRef: MatDialogRef<any, boolean> = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title    : 'Are you sure?',
        body     : `Are you sure you want to revoke access key ${credential.access_key}?<br>\n
              When revoked, these credentials cannot be recovered.`,
        yes      : 'Revoke',
        no       : 'Cancel',
        iconClass: 'i-alert',
      }
    });

    confirmDialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.credentialRevoked.emit(credential.access_key);
      }
    });
  }

}
