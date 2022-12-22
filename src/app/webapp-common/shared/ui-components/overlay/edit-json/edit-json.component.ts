import {AfterViewInit, Component, ElementRef, HostListener, Inject, NgZone, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {JsonPipe} from '@angular/common';
import {validateJson} from '../../../utils/validation-utils';
import {Store} from '@ngrx/store';
import {addMessage, saveAceCaretPosition} from '@common/core/actions/layout.actions';
import {Ace} from 'ace-builds';
import {selectAceCaretPosition} from '@common/core/reducers/view.reducer';
import {Observable, Subscription} from 'rxjs';

declare const ace;

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
  private $aceCaretPosition: Observable<{ [key: string]: Ace.Point }>;
  private aceCaretPositionSub: Subscription;
  private defaultPlaceHolder = '';

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
    private zone: NgZone,
  ) {
    this.typeJson = data.typeJson;
    if (this.typeJson) {
      this.defaultPlaceHolder = `e.g.:

{
  "location" : "london",
  "date" : "2019-01-31 22:41:03"
}`;
    }
    this.placeHolder = data.placeHolder;
    this.textData = data.textData ? (this.typeJson ? jsonPipe.transform(data.textData) : data.textData) : undefined;
    this.readOnly = data.readOnly;
    this.title = data.title;
    this.$aceCaretPosition = this.store.select(selectAceCaretPosition);
  }

  ngAfterViewInit() {
    window.setTimeout(() => this.initAceEditor(), 200);
    this.aceCaretPositionSub = this.$aceCaretPosition.subscribe((positions) => {
      this.aceEditor.moveCursorTo(positions[this.title]?.row || 0, positions[this.title]?.column || 0);
      this.aceEditor.scrollToLine(positions[this.title]?.row || 0, true, false, () => {
      });
    });
  }

  closeDialog(isConfirmed) {
    this.store.dispatch(saveAceCaretPosition({id: this.title, position: this.aceEditor.selection.getCursor()}));
    if (isConfirmed) {
      try {
        const text = this.aceEditor.getValue();
        this.dialogRef.close(text ? (this.typeJson ? JSON.parse(text) : text) : '');
      } catch
        (e) {
        this.store.dispatch(addMessage('warn', 'Not a valid JSON'));
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
      const aceEditor = ace.edit(this.aceEditorElement.nativeElement) as Ace.Editor;
      aceEditor.setOptions({
        readOnly: this.readOnly,
        showLineNumbers: false,
        showGutter: false,
        fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: 13,
        highlightActiveLine: false,
        highlightSelectedWord: false,
        showPrintMargin: false,
        placeholder: this.placeHolder || this.defaultPlaceHolder,
      } as Partial<Ace.VirtualRendererOptions>);


      aceEditor.renderer.setScrollMargin(12, 12, 12, 12);
      aceEditor.renderer.setPadding(12);
      (aceEditor.renderer.container.querySelector('.ace_cursor') as HTMLElement).style.color = 'white';

      aceEditor.setTheme('ace/theme/monokai');
      if (this.typeJson) {
        aceEditor.session.setMode('ace/mode/json');
      } else {
        aceEditor.session.setMode('ace/mode/text');
      }
      aceEditor.getSession().setValue(this.textData || '');
      this.aceEditor = aceEditor;
    });
  }
}
