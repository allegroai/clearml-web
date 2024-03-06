import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "sm-pipeline-parameters-dialog",
  templateUrl: "./pipeline-parameters-dialog.component.html",
  styleUrls: ["./pipeline-parameters-dialog.component.scss"],
})
export class PipelineParametersDialogComponent {
  parameters: any[];
  paramsChanged: () => void;
  setIsAutoCompleteOpen: (focus: boolean) => void;
  displayFn: (opt: any) => string;
  paramSelected: (event: any) => void;
  ioOptions: any[];
  trackByValue: any;

  constructor(
    private matDialogRef: MatDialogRef<PipelineParametersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.parameters = data.parameters;
    this.paramsChanged = data.paramsChanged;
    this.setIsAutoCompleteOpen = data.setIsAutoCompleteOpen;
    this.displayFn = data.displayFn;
    this.paramSelected = data.paramSelected;
    this.ioOptions = data.ioOptions;
    this.trackByValue = data.trackByValue;
  }
}
