import {Component, HostListener, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {JsonPipe} from '@angular/common';
import {validateJson} from '../../../utils/validation-utils';
import {Store} from '@ngrx/store';
import {addMessage} from '../../../../core/actions/layout.actions';

@Component({
  selector: 'sm-edit-json',
  templateUrl: './edit-json.component.html',
  styleUrls: ['./edit-json.component.scss'],
  providers: [{provide: JsonPipe, useClass: JsonPipe}]
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
    private jsonPipe: JsonPipe,
    private store: Store<any>
  ) {
    this.typeJson = data.typeJson;
    this.placeHolder = data.placeHolder;
    this.textData = data.textData ? (this.typeJson ? jsonPipe.transform(data.textData) : data.textData) : undefined;
    this.readOnly = data.readOnly;
    this.title = data.title;
  }

  closeDialog(isConfirmed) {
    if (isConfirmed) {
      try {
        this.dialogRef.close(this.textData ? (this.typeJson ? JSON.parse(this.textData) : this.textData) : '');
      } catch (e) {
        this.store.dispatch(addMessage('warn', 'Not a valid JSON'))
        // this.showErrors = true; // shows warning message bellow texterea
      }
    } else {
      this.dialogRef.close();
    }
  }

  textChanged() {
    this.showErrors = false;
  }

  textAreaKeydown(e: KeyboardEvent) {
    if (e.ctrlKey === true && e.key == 'Enter') {
      return; // Ctrl + Enter closes the dialog
    } else {
      e.stopPropagation();
    }
  }
}
