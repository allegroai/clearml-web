import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'sm-ui-update-dialog',
  templateUrl: './ui-update-dialog.component.html',
  styleUrls: ['./ui-update-dialog.component.scss']
})
export class UiUpdateDialogComponent {

  constructor(private matDialogRef: MatDialogRef<UiUpdateDialogComponent>) {
  }


  cancel() {
    this.matDialogRef.close();
  }

  reload() {
    window.location.reload(true);
  }
}
