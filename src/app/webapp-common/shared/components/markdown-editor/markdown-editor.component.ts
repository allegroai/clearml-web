import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  Renderer2,
  SecurityContext,
  ViewChild
} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {MarkdownEditorComponent as MDComponent, MdEditorOption} from 'ngx-markdown-editor';
import {Ace} from 'ace-builds';

const BREAK_POINT = 990;


@Component({
  selector: 'sm-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.scss']
})
export class MarkdownEditorComponent {
  private originalInfo: string;
  private ready: boolean = false;
  private preview: Element;
  private editor: Element;
  public isDirty: boolean;
  public editorVisible: boolean;
  private _editMode: boolean;
  public options = {
    markedjsOpt: {
      sanitizer: this.sanitizer.sanitize.bind(SecurityContext.NONE)
    },
    enablePreviewContentClick: true,
    fontAwesomeVersion: '6',
    showPreviewPanel: true,
    resizable: false,
    hideIcons: ['TogglePreview', 'FullScreen']
  } as MdEditorOption;
  private ace: Ace.Editor;
  public isExpand: boolean = false;
  public duplicateNames: boolean;

  set editMode(editMode: boolean) {
    this._editMode = editMode;
    (window as any).holdIframe = editMode;
    this.editModeChanged.emit();
    window.setTimeout(() => this.ace?.resize(), 500);
  }

  get editMode() {
    return this._editMode;
  }

  @Input() data: string;
  @Input() readOnly: boolean;
  @Output() saveInfo = new EventEmitter<string>();
  @Output() editModeChanged = new EventEmitter();
  @ViewChild(MDComponent) editorComponent: MDComponent;

  @HostListener('window:resize', ['$event'])
  updateEditorVisibility() {
    if (!this.ready) {
      return;
    }

    if (window.innerWidth > BREAK_POINT) {
      if (this.editMode) {
        this.renderer.setStyle(this.preview, 'display', 'block');
        this.renderer.setStyle(this.editor, 'display', 'block');
      } else {
        this.renderer.setStyle(this.preview, 'display', 'block');
        this.renderer.setStyle(this.editor, 'display', 'none');
      }
    } else if (this.editMode) {
      this.renderer.setStyle(this.preview, 'display', 'none');
      this.renderer.setStyle(this.editor, 'display', 'block');
    } else {
      this.renderer.setStyle(this.preview, 'display', 'block');
      this.renderer.setStyle(this.editor, 'display', 'none');
    }
  }

  constructor(private renderer: Renderer2, protected sanitizer: DomSanitizer, protected cdr: ChangeDetectorRef) {
  }

  save() {
    this.saveInfo.emit(this.data);
    this.editMode = false;
    this.isDirty = false;
    this.updateEditorVisibility();
  }

  editClicked() {
    this.originalInfo = this.data;
    this.editMode = true;
    this.editorVisible = false;
    setTimeout(() => this.updateEditorVisibility());
  }

  cancelClicked() {
    this.data = this.originalInfo;
    this.editMode = false;
    this.isDirty = false;
    this.updateEditorVisibility();
  }

  editorReady(ace: Ace.Editor) {
    this.ace = ace;
    this.ace.setOptions({
      fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: 13,
    });
    this.ready = true;
    this.preview = document.querySelector('.preview-container');
    this.editor  = document.querySelector('.editor-container > div:first-child');
  }

  togglePreview() {
    this.renderer.setStyle(this.preview, 'display', this.editorVisible ? 'none' : 'block');
    this.renderer.setStyle(this.editor, 'display', !this.editorVisible ? 'none' : 'block');
    this.editorVisible = !this.editorVisible;
  }

  checkDirty() {
    this.isDirty = this.originalInfo !== this.data;
    this.getDuplicateIframes();
  }

  domFixes() {
    this.renderer.setProperty(this.editorComponent.previewContainer.nativeElement, 'id', 'print-element');

    if (this.data.indexOf('```language') > -1) {
      const range = this.ace.selection.getRange();
      this.data = this.data.replace('```language', '```py');
      this.cdr.detectChanges();
      range.end.column = range.start.column + 2;
      window.setTimeout(() => this.ace.selection.setRange(range));
    }
  }

  expandClicked() {
    this.isExpand = !this.isExpand;
    this.editModeChanged.emit();
  }

  private getDuplicateIframes() {
    const names = Array.from(this.data.matchAll(/<iframe[^>]*?name=(["\'])?((?:.(?!\1|>))*.?)\1?/g)).map(a=>a[2]);
    const uniqueNames = new Set(names);
    let duplicatedNames = [];
    for (const name of uniqueNames) {
      const dups = names.map(e => e === name ? name : '').filter(String).slice(1);
      duplicatedNames = duplicatedNames.concat(dups);
    }
    this.duplicateNames = duplicatedNames.length > 0;
  }
}

