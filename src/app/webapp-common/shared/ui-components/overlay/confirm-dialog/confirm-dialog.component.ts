import {Component, Inject, Input} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {IConfirmDialogConfig} from './confirm-dialog.model';

@Component({
  selector: 'sm-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {

  @Input() displayX: boolean = true;
  showNeverShowAgain: boolean;
  title: string;
  body: string;
  yes = 'OK';
  no = 'Cancel';
  iconClass = '';
  codeSnippet = '';
  externalData: string = null;
  public reference: string;
  neverShowAgain: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) public data: IConfirmDialogConfig,
    public dialogRef: MatDialogRef<ConfirmDialogComponent>) {
    this.title = data.title || '';
    this.reference = data.reference || '';
    this.body = data.body || '';
    this.yes = data.yes || '';
    this.no = data.no || '';
    this.iconClass = data.iconClass || '';
    this.codeSnippet = data.codeSnippet || '';
    this.showNeverShowAgain = data.showNeverShowAgain || false;
  }

  closeDialog(isConfirmed) {
    if(isConfirmed) {
      this.dialogRef.close({isConfirmed: isConfirmed, neverShowAgain: this.neverShowAgain});
    } else {
      this.dialogRef.close(isConfirmed);
    }
  }

}
