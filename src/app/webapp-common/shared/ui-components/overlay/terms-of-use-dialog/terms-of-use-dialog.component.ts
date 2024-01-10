import {Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {ConfirmDialogComponent} from '@common/shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';
import {SafePipe} from '@common/shared/pipes/safe.pipe';

@Component({
  selector: 'sm-terms-of-use-dialog',
  templateUrl: './terms-of-use-dialog.component.html',
  styleUrls: ['./terms-of-use-dialog.component.scss'],
  standalone: true,
  imports: [
    ConfirmDialogComponent,
    MatCheckboxModule,
    FormsModule,
    SafePipe
  ]
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
