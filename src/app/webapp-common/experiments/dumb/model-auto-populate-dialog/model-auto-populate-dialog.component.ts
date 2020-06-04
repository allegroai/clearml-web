import {Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'sm-model-auto-populate-dialog',
  templateUrl: './model-auto-populate-dialog.component.html',
  styleUrls: ['./model-auto-populate-dialog.component.scss']
})
export class ModelAutoPopulateDialogComponent {

  public showLabelEnumCheckbox: boolean;
  public showDesignCheckbox: boolean;
  public formData;

  constructor(
    private dialogRef: MatDialogRef<ModelAutoPopulateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {populateLabels: boolean, populateDesign: boolean}
  ) {
    this.formData = {
      labelEnum: this.data.populateLabels,
      networkDesign: this.data.populateDesign,
    };
  }

  closeDialog(isConfirmed) {
    this.dialogRef.close(isConfirmed ? this.formData : false);
  }

  updateFormData(event) {
    this.formData[event.field] = event.value;
  }

}
