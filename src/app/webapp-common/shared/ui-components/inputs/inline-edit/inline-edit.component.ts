import {Component, ElementRef, EventEmitter, Input, OnDestroy, Output, Renderer2, ViewChild} from '@angular/core';
import { ICONS } from '../../../../constants';

@Component({
  selector: 'sm-inline-edit',
  templateUrl: './inline-edit.component.html',
  styleUrls: ['./inline-edit.component.scss']
})
export class InlineEditComponent implements OnDestroy {
  public readonly CANCEL_BUTTON = 'CANCEL_BUTTON';
  public readonly SAVE_BUTTON = 'SAVE_BUTTON';
  public ICONS = ICONS;
  public active = false;
  public inlineValue: string;
  private shouldSave: boolean = true;

  @Input() pattern;
  @Input() minLength = 0;
  @Input() originalText;

  // *DEFAULTS*
  @Input() editable = true;
  @Input() minWidth: number = 100;
  @Input() multiline: boolean = false;
  @Input() rows: number = 3; // Only relevant to multiline
  @Input() inlineDisabled = false;

  @Output() inlineActiveStateChanged = new EventEmitter<boolean>();
  @Output() textChanged = new EventEmitter<string>();
  @Output() inlineFocusOutEvent = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter();
  @Output() cancelClick = new EventEmitter<Event>();
  @ViewChild('inlineInput') inlineInput: ElementRef;
  @ViewChild('template', {static: true}) template: ElementRef;

  constructor(private renderer: Renderer2) {
  }

  public inlineCanceled() {
    this.inlineValue = this.originalText;
    this.active = false;
    this.inlineActiveStateChanged.emit(false);
    this.cancel.emit();
  }

  public inlineSaved() {
    this.inlineValue = this.inlineInput.nativeElement.value;
    if (this.inlineValue != this.originalText) {
      this.textChanged.emit(this.inlineValue);
    }
    this.active = false;
    this.inlineActiveStateChanged.emit(false);
  }

  public inlineActivated(event?: Event) {
    if (!this.editable) {
      return;
    }

    const templateWidth = Math.max(this.template.nativeElement.getBoundingClientRect().width, 250);
    this.renderer.setStyle(this.inlineInput.nativeElement, 'width', `${templateWidth}px`);
    this.inlineValue = this.originalText;
    this.active = true;
    this.inlineActiveStateChanged.emit(true);
    event?.stopPropagation();
    setTimeout(() => this.inlineInput.nativeElement.focus(), 50);
  }

  cancelClicked(event: Event) {
    this.cancelClick.emit(event);
    this.shouldSave = false;
    this.inlineCanceled();
  }

  stopProp(e: MouseEvent) {
    e.stopPropagation();
  }

  ngOnDestroy(): void {
    this.inlineCanceled();
    this.inlineInput = null;
    this.template = null;
  }
}
