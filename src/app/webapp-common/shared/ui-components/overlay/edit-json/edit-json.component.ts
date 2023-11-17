import {AfterViewInit, Component, ElementRef, HostListener, Inject, NgZone, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {JsonPipe} from '@angular/common';
import {Store} from '@ngrx/store';
import {addMessage, saveAceCaretPosition} from '@common/core/actions/layout.actions';
import {Ace} from 'ace-builds';
import {selectAceCaretPosition} from '@common/core/reducers/view.reducer';
import {filter, Observable} from 'rxjs';
import {map, take} from 'rxjs/operators';

declare const ace;
export interface EditJsonData {
  textData?: string | object;
  readOnly?: boolean;
  title: string;
  format?: 'json' | 'yaml' | 'hocon';
  placeHolder?: string;
  reorder?: boolean;
}

@Component({
  selector: 'sm-edit-json',
  templateUrl: './edit-json.component.html',
  styleUrls: ['./edit-json.component.scss'],
  providers: [{provide: JsonPipe, useClass: JsonPipe}]
})
export class EditJsonComponent implements AfterViewInit{
  public errors: Map<string, boolean>;
  public textData: string;
  public showErrors: boolean;

  private _readOnly: boolean;
  public placeHolder: string;
  public title: string;
  readonly typeJson: boolean;
  @ViewChild('aceEditor') private aceEditorElement: ElementRef;
  private aceEditor: Ace.Editor;
  private $aceCaretPosition: Observable<{ [key: string]: Ace.Point }>;
  private readonly defaultPlaceHolder: string;
  private readonly format?: 'json' | 'yaml' | 'hocon';

  set readOnly(readOnly: boolean) {
    this._readOnly = readOnly;
  }

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
    @Inject(MAT_DIALOG_DATA) public data: EditJsonData,
    private dialogRef: MatDialogRef<EditJsonComponent, string | null>,
    private jsonPipe: JsonPipe,
    private store: Store,
    private zone: NgZone,
  ) {
    this.format = data.format;
    this.typeJson = data.format === 'json';
    if (this.typeJson) {
      this.defaultPlaceHolder = `e.g.:

{
  "location" : "london",
  "date" : "2019-01-31 22:41:03"
}`;
    } else {
      this.defaultPlaceHolder = '';
    }
    this.placeHolder = data.placeHolder;
    if(!data.textData) {
      this.textData = undefined;
    } else if (this.typeJson && typeof data.textData !== 'string') {
      if (data.reorder) {
        this.textData = jsonPipe.transform(this.orderJson(data.textData));
      } else {
        this.textData = jsonPipe.transform(data.textData);
      }
    } else {
      this.textData = data.textData as string;
    }
    this.readOnly = data.readOnly;
    this.title = data.title;
    this.$aceCaretPosition = this.store.select(selectAceCaretPosition);
  }

  ngAfterViewInit() {
    window.setTimeout(() => this.initAceEditor(), 200);
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


      aceEditor.renderer.setScrollMargin(12, 12, 0, 12);
      aceEditor.renderer.setPadding(12);
      (aceEditor.renderer.container.querySelector('.ace_cursor') as HTMLElement).style.color = 'white';

      aceEditor.setTheme('ace/theme/monokai');
      switch (this.format) {
        case 'hocon':
          aceEditor.session.setMode('ace/mode/ini');
          break;
        case 'json':
          aceEditor.session.setMode('ace/mode/json');
          break;
        case 'yaml':
          aceEditor.session.setMode('ace/mode/yaml');
          break;
        default:
          aceEditor.session.setMode('ace/mode/text');
      }
      aceEditor.getSession().setValue(this.textData || '');
      this.aceEditor = aceEditor;
    });

    this.$aceCaretPosition
      .pipe(
        take(1),
        map(positions => positions[this.title]),
        filter(position => !!position)
      )
      .subscribe((position) => {
      this.aceEditor.moveCursorTo(position?.row || 0, position?.column || 0);
      this.aceEditor.scrollToLine(position?.row || 0, true, false, () => {
      });
    });
  }

  private orderJson(data) {
    if (data !== null && typeof data === 'object') {
      if (Array.isArray(data)) {
        return data.map(val => this.orderJson(val));
      }
      return Object.keys(data).sort().reduce((acc, key) => {
        acc[key] = this.orderJson(data[key]);
        return acc;
      }, {});
    }
    return data;
  }
}
