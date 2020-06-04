import {Component, ElementRef, EventEmitter, Input, OnDestroy, Output, Renderer2, ViewChild} from '@angular/core';
import {ICONS} from '../../../../../app.constants';

@Component({
  selector   : 'sm-inline-edit',
  templateUrl: './inline-edit.component.html',
  styleUrls  : ['./inline-edit.component.scss']
})
export class InlineEditComponent implements OnDestroy {
  public readonly CANCEL_BUTTON = 'CANCEL_BUTTON';
  public readonly SAVE_BUTTON   = 'SAVE_BUTTON';
  public ICONS                  = ICONS;
  public active                 = false;
  public inlineValue: string;
  private shouldSave: boolean   = true;
  @Input() pattern;
  @Input() originalText;
  @Input() fieldValue; // TODO: remove me

  // *DEFAULTS*
  @Input() editable           = true;
  @Input() minWidth: number   = 100;
  @Input() multiline: boolean = false;
  @Input() rows: number       = 3; // Only relevant to multiline
  @Input() inlineDisabled     = false;

  @Output() inlineActiveStateChanged = new EventEmitter<boolean>();
  @Output() textChanged              = new EventEmitter<any>();
  @Output() inlineFocusOutEvent      = new EventEmitter<any>();
  @ViewChild('inlineInput') inlineInput: ElementRef;
  @ViewChild('inlineInputContainer') inlineInputContainer: ElementRef;
  @ViewChild('template', { static: true }) template;

  constructor(private renderer: Renderer2) {
  }

  public inlineCanceled() {
    this.inlineValue = this.originalText;
    this.active      = false;
    this.inlineActiveStateChanged.emit(false);
  }

  public inlineSaved() {
    this.inlineValue = this.inlineInput.nativeElement.value;
    if (this.inlineValue != this.originalText) {
      this.textChanged.emit(this.inlineValue);
    }
    this.active = false;
    this.inlineActiveStateChanged.emit(false);
  }

  public inlineActivated() {
    if (!this.editable) {
      return;
    }
    this.inlineValue = this.originalText;
    this.active      = true;
    this.inlineActiveStateChanged.emit(true);
    const inputWidth = (Math.max(this.template.nativeElement.offsetWidth, this.minWidth)) + 'px';
    this.renderer.setStyle(this.inlineInputContainer.nativeElement, 'width', inputWidth);
    setTimeout(() => this.inlineInput.nativeElement.focus());
  }

  cancelClicked() {
    this.shouldSave = false;
    this.inlineCanceled();
  }

  stopProp(e: MouseEvent) {
    e.stopPropagation();
  }

  ngOnDestroy(): void {
    this.inlineCanceled();
  }
}
