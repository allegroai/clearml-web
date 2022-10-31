import {Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector   : 'sm-terms-of-use-dialog',
  templateUrl: './terms-of-use-dialog.component.html',
  styleUrls  : ['./terms-of-use-dialog.component.scss']
})
export class TermsOfUseDialogComponent {

  text: string;
  private version: number;
  public isApprove: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<any>) {
    this.version = data.version;
    // TODO: (nir) hack to prevent auto scrolling to first <a>
    this.text = '<a href="#"></a>' + data.externalData;
  }

  openTerms() {
    window.open('/', '_blank');
  }

  closeDialog() {
    this.dialogRef.close(this.version);
  }


}
