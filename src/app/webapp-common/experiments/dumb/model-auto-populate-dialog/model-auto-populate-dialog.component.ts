import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector   : 'sm-model-auto-populate-dialog',
  templateUrl: './model-auto-populate-dialog.component.html',
  styleUrls  : ['./model-auto-populate-dialog.component.scss']
})
export class ModelAutoPopulateDialogComponent {

  public showLabelEnumCheckbox: boolean;
  public showDesignCheckbox: boolean;
  public formData;
  public subHeader: string;

  constructor(
    private dialogRef: MatDialogRef<ModelAutoPopulateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { populateLabels: boolean, populateDesign: boolean, experimentName: string, modelName: string }
  ) {
    this.formData = {
      labelEnum    : this.data.populateLabels,
      networkDesign: this.data.populateDesign,
    };
    this.subHeader = `Overwrite the ${this.data.experimentName}’s current model configuration with ${this.data.modelName}'s configuration?`;
  }

  closeDialog(isConfirmed) {
    if (!isConfirmed) {
      this.formData.networkDesign = false;
      this.formData.labelEnum = false;
    }
    this.dialogRef.close(this.formData);
  }

  updateFormData(event) {
    this.formData[event.field] = event.value;
  }

}
