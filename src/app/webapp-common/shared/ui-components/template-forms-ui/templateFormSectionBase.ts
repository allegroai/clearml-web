import { Input, ViewChild, Directive } from '@angular/core';
import {ControlValueAccessor, NgForm} from '@angular/forms';

@Directive()
export class TemplateFormSectionBase implements ControlValueAccessor {
  public disabled: boolean;
  public ngModelValue = null;
  @Input() inEditMode: boolean;
  @ViewChild('templateForm', {static: true}) templateForm: NgForm;
  onChange: any = () => {
  };
  onTouch: any = () => {
  };

  set value(val) {  // this value is updated by programmatic changes if( ngModelValue !== undefined && this.ngModelValue !== ngModelValue){
    if (val !== this.ngModelValue) {
      this.ngModelValue = val;
    }
  }

// this method sets the value from outside
  writeValue(value: any) {
    this.value = value;
  }

// upon UI element value changes, this method gets triggered
  registerOnChange(fn: any) {
    this.onChange = fn;
  }

// upon touching the element, this method gets triggered
  registerOnTouched(fn: any) {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
