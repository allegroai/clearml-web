import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, Renderer2, ViewChild} from '@angular/core';
import {ICONS} from '@common/constants';
import {NgModel} from '@angular/forms';

@Component({
  selector: 'sm-inline-edit',
  templateUrl: './inline-edit.component.html',
  styleUrls: ['./inline-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineEditComponent implements OnDestroy {
  public readonly cancelButton = 'CANCEL_BUTTON';
  public readonly saveButton = 'SAVE_BUTTON';
  public icons = ICONS;
  public active = false;
  public inlineValue: string;
  private shouldSave: boolean = true;
  private _forbiddenString: string[];

  @Input() pattern;
  @Input() required: boolean;
  @Input() minLength = 0;
  @Input() originalText;
  @Input() set forbiddenString(forbiddenString: string[]) {
    this._forbiddenString = forbiddenString?.filter(fs => fs !== this.originalText);
  }

  get forbiddenString() {
    return this._forbiddenString;
  }
  // *DEFAULTS*
  @Input() editable = true;
  @Input() fixedWidth;
  @Input() multiline: boolean = false;
  @Input() rows: number = 3; // Only relevant to multiline
  @Input() inlineDisabled = false;
  @Input() warning: string;

  @Output() inlineActiveStateChanged = new EventEmitter<boolean>();
  @Output() textChanged = new EventEmitter<string>();
  @Output() inlineFocusOutEvent = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter();
  @Output() cancelClick = new EventEmitter<Event>();
  @ViewChild('inlineInput') inlineInput: NgModel;
  @ViewChild('inlineInput', { read: ElementRef }) inlineInputRef: ElementRef;

  @ViewChild('template', {static: true}) template: ElementRef;

  @HostListener('document:click', [])
  clickOut() {
    if (this.active) {
      this.inlineCanceled();
    }
  }

  constructor(private renderer: Renderer2, private cdr: ChangeDetectorRef) {
  }

  public inlineCanceled() {
    this.inlineValue = this.originalText;
    this.active = false;
    this.inlineActiveStateChanged.emit(false);
    this.cancel.emit();
    this.cdr.detectChanges();
  }

  public inlineSaved() {
    this.inlineValue = this.inlineInput.value;
    if (this.inlineValue != this.originalText) {
      this.textChanged.emit(this.inlineValue);
    }
    this.active = false;
    this.inlineActiveStateChanged.emit(false);
    this.cdr.detectChanges();
  }

  public inlineActivated(event?: Event) {
    if (!this.editable) {
      return;
    }

    const templateWidth = this.fixedWidth || Math.max(this.template.nativeElement.getBoundingClientRect().width - (this.multiline ? 0 : 120), 200);
    this.renderer.setStyle(this.inlineInputRef.nativeElement, 'width', `${templateWidth}px`);
    this.inlineValue = this.originalText;
    event?.stopPropagation();
    setTimeout(() => {
      this.active = true;
      this.inlineActiveStateChanged.emit(true);
      this.cdr.detectChanges();
      this.inlineInputRef.nativeElement.focus();
    }, 50);
  }

  cancelClicked(event: Event) {
    this.cancelClick.emit(event);
    this.shouldSave = false;
    this.inlineCanceled();
  }


  ngOnDestroy(): void {
    this.inlineCanceled();
    this.inlineInput = null;
    this.template = null;
  }
}
