import {Component, HostListener, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {JsonPipe} from '@angular/common';
import {validateJson} from '../../../utils/validation-utils';

@Component({
  selector   : 'sm-edit-json',
  templateUrl: './edit-json.component.html',
  styleUrls  : ['./edit-json.component.scss'],
  providers  : [{provide: JsonPipe, useClass: JsonPipe}]
})
export class EditJsonComponent {
  public errors: Map<string, boolean>;
  public textData: string;
  public showErrors: boolean;
  public validators: Array<any> = [validateJson];

  private _readOnly: boolean;
  public placeHolder: string;
  public title: string;
  readonly typeJson: boolean;

  set readOnly(readOnly: boolean) {
    this._readOnly = readOnly;
  };

  get readOnly(): boolean {
    return this._readOnly;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && e.ctrlKey === true) {
      this.closeDialog(!this.readOnly);
    }
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { textData: string; readOnly: boolean; title: string; typeJson: boolean; placeHolder: string },
    private dialogRef: MatDialogRef<EditJsonComponent, any>,
    private jsonPipe: JsonPipe
  ) {
    this.typeJson = data.typeJson;
    this.placeHolder = data.placeHolder;
    this.textData = data.textData ? (this.typeJson ? jsonPipe.transform(data.textData) : data.textData) : undefined;
    this.readOnly = data.readOnly;
    this.title = data.title;
  }

  closeDialog(isConfirmed) {
    if (isConfirmed) {
      if (!this.errors || !this.textData) {
        this.dialogRef.close(this.textData ? (this.typeJson ? this.jsonPipe.transform(this.textData) : this.textData) : null);
      } else {
        this.showErrors = true;
      }
    } else {
      this.dialogRef.close();
    }
  }

  metadataChanged($event: string) {
    this.showErrors = false;
    this.textData = $event;
  }

  errorChanged(errors: Map<string, boolean>) {
    this.errors = errors;
  }

  textAreaKeydown(e: KeyboardEvent) {
    if (e.ctrlKey === true && e.key == 'Enter') {
      return; // Ctrl + Enter closes the dialog
    } else {
      e.stopPropagation();
    }
  }
}
