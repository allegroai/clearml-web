import {AfterViewInit, Directive, ElementRef, Host, Optional, Renderer2, Self} from '@angular/core';
import {MatFormField} from '@angular/material/form-field';

@Directive({
  selector: '[smNochedFormField], mat-form-field[appearance="outline"]',
  standalone: true
})
export class LabeledFormFieldDirective implements AfterViewInit {

  constructor(
    private hostElement: ElementRef,
    private renderer: Renderer2,
    @Host() @Self() @Optional() private formField: MatFormField
  ) {}

  ngAfterViewInit() {
    if (this.formField.getLabelId()) {
      this.renderer.addClass(this.hostElement.nativeElement, 'notched');
    }
  }
}
