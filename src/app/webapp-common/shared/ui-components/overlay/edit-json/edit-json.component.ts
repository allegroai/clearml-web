import {AfterViewInit, Component, ElementRef, HostListener, Inject, NgZone, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {JsonPipe} from '@angular/common';
import {validateJson} from '../../../utils/validation-utils';
import {Store} from '@ngrx/store';
import {addMessage} from '@common/core/actions/layout.actions';
import {Ace} from 'ace-builds';

declare const ace;

const jsonPlaceholder = `e.q:

      {
        "location" : "london",
        "date" : "2019-01-31 22:41:03"
      }
`;
const regularPlaceholder = '';
@Component({
  selector: 'sm-edit-json',
  templateUrl: './edit-json.component.html',
  styleUrls: ['./edit-json.component.scss'],
  providers: [{provide: JsonPipe, useClass: JsonPipe}]
})
export class EditJsonComponent implements AfterViewInit {
  public errors: Map<string, boolean>;
  public textData: string;
  public showErrors: boolean;
  public validators: Array<any> = [validateJson];

  private _readOnly: boolean;
  public placeHolder: string;
  public title: string;
  readonly typeJson: boolean;
  @ViewChild('aceEditor') private aceEditorElement: ElementRef;
  private aceEditor: Ace.Editor;
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
    private store: Store<any>,
    private zone: NgZone
  ) {
    this.typeJson = data.typeJson;
    this.placeHolder = data.placeHolder;
    this.textData = data.textData ? (this.typeJson ? jsonPipe.transform(data.textData) : data.textData) : undefined;
    this.readOnly = data.readOnly;
    this.title = data.title;
  }

  ngAfterViewInit() {
    this.initAceEditor();
  }

  closeDialog(isConfirmed) {
    if (isConfirmed) {
      try {
        const text = this.aceEditor.getValue();
        this.dialogRef.close(text ? (this.typeJson ? JSON.parse(text) : text) : '');
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

  // we can make this to ace wrapper later on
  private initAceEditor() {
    this.zone.runOutsideAngular(() => {
      const aceEditor = ace.edit(this.aceEditorElement.nativeElement)  as Ace.Editor;
      aceEditor.setOptions({
        readOnly: this.readOnly,
        showLineNumbers: false,
        showGutter: false,
        fontSize: 14,
        highlightActiveLine: false,
        highlightSelectedWord: false,
        showPrintMargin: false,
        placeholder: this.typeJson ? jsonPlaceholder : regularPlaceholder,
      });


      aceEditor.renderer.setScrollMargin(12, 12, 12, 12);
      aceEditor.renderer.setPadding(12);
      (aceEditor.renderer.container.querySelector('.ace_cursor') as HTMLElement).style.color = 'white';

      if (this.typeJson) {
        aceEditor.session.setMode('ace/mode/json');
        aceEditor.setTheme('ace/theme/monokai');
      }
      aceEditor.getSession().setValue(this.textData || '');
      this.aceEditor = aceEditor;
    });
  }
}
