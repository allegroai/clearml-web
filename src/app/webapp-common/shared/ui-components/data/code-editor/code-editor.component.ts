import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  Output,
  ViewChild,
} from '@angular/core';
import {Ace} from 'ace-builds';
import {Store} from '@ngrx/store';
import {selectAceReady} from '@common/core/reducers/view.reducer';
import {filter} from 'rxjs/operators';
import {addMessage} from '@common/core/actions/layout.actions';
import {MESSAGES_SEVERITY} from '@common/constants';
import {NgIf} from '@angular/common';
import {ClipboardModule} from 'ngx-clipboard';
declare const ace;

@Component({
  selector: 'sm-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    ClipboardModule
  ]
})
export class CodeEditorComponent implements AfterViewInit {
  _mode: string = 'ace/mode/python';

  @Input() set mode(mode) {
    this.aceEditor?.session?.setMode(mode);
    this._mode = mode;
  }

  get mode() {
    return this._mode;
  }

  @Input() readonly = false;
  @Output() codeChanged = new EventEmitter<string>();
  @Input() showCopyButton = false;
  private _code: string;
  @Input() set code(text: string) {
    this._code = text;
    if (this.aceEditor) {
      this.aceEditor.getSession().setValue(this.code);
    }
  }

  get code() {
    return this._code;
  }

  get aceCode() {
    return this.aceEditor.getSession().getValue();
  }

  @ViewChild('aceEditor') private aceEditorElement: ElementRef<HTMLDivElement>;
  private aceEditor: Ace.Editor;

  constructor(private zone: NgZone, private store: Store) {
  }

  private initAceEditor() {
    if (!this.aceEditorElement) {
      this.aceEditor = null;
      return;
    }
    this.zone.runOutsideAngular(() => {
      const aceEditor = ace.edit(this.aceEditorElement.nativeElement) as Ace.Editor;
      ace.config.set('basePath', '/node_modules/ace-builds/src-min-noconflict');
      this.aceEditor = aceEditor;
      aceEditor.setOptions({
        readOnly: this.readonly,
        showLineNumbers: false,
        showGutter: false,
        fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
        fontSize: 13,
        highlightActiveLine: false,
        highlightSelectedWord: false,
        showPrintMargin: false,
        useWorker: true,
      });
      this.aceEditor.getSession().on('change', () => {
        this.codeChanged.emit(this.aceEditor.getSession().getValue());
      });

      aceEditor.renderer.setScrollMargin(12, 12, 12, 12);
      aceEditor.renderer.setPadding(24);
      aceEditor.session.setMode(this.mode);
      aceEditor.setTheme('ace/theme/monokai');

      if (this.readonly) {
        aceEditor.renderer.hideCursor();
      } else {
        (aceEditor.renderer.container.querySelector('.ace_cursor') as HTMLElement).style.color = 'white';
      }

      aceEditor.getSession().setValue(this.code);

      this.aceEditor = aceEditor;
    });
  }

  ngAfterViewInit(): void {
    this.store.select(selectAceReady)
      .pipe(
        filter((ready: boolean) => ready),
      )
      .subscribe(() => this.initAceEditor());
  }

  copySuccess() {
    this.store.dispatch(addMessage(MESSAGES_SEVERITY.SUCCESS, 'Code copied to clipboard'));
  }
}
