import {FormArray, FormControl} from '@angular/forms';
import { EventEmitter, Input, Output, Directive } from '@angular/core';
import {ValidatorFn} from '@angular/forms';
import {DynamicFormBase} from './dynamic-form.base';

@Directive()
export abstract class DynamicFormControlBase<T> extends DynamicFormBase<T> {

  // abstract controlName: string;
  public control: FormControl;
  public form: FormControl;

  @Input() header: string; // the input title.
  @Input() placeHolder: string = ''; // the input title.
  @Input() validators: Array<ValidatorFn>;
  @Input() showErrors: boolean = true; // boolean to determine when the errors should be displayed.
  @Input() isReadonly: boolean;
  @Input() inputClassName: string = 'form-control';
  // a map of the error messages for each error when the key is the error key and the value is the error message.
  @Input()  errorMessages;

  @Output() inputClicked = new EventEmitter();

  constructor() {
    super();
  }

  _updateFormData(formData) {
    this._registerForm(formData);
  }

  _registerForm(formData) {
    if (!this.controlName) {
      throw new Error('please provide control name: ');
    }

    if (!this.parentGroup) {
      throw new Error('please provide parentGroup to control: ' + this.controlName);
    }

    if (formData === undefined) {
      throw new Error('please provide form data to control: ' + this.controlName);
    }

    this.control = new FormControl(formData);
    if (this.validators) {
      this.control.setValidators(this.validators);
      this.control.updateValueAndValidity();
    }

    if (this.parentGroup instanceof FormArray) {
      this.registerInArray();
    } else {
      this.registerInGroup();
    }
  }

  registerInArray() {
    (this.parentGroup as any).push(this.control);
  }

  registerInGroup() {
    // TODO: hack for cases that the control get destroyed...
    if (this.parentGroup.contains(this.controlName)) {
      delete (this.parentGroup.controls[this.controlName]);
    }

    this.parentGroup.registerControl(this.controlName, this.control);
    if (this.control.invalid) {
      // this.control.updateValueAndValidity();
      // (this.control.statusChanges as any).emit();
    }
  }

  getCurrentError() {
    if (!this.showErrors) {return ''}
    const activeErrors = this.control.errors;
    return activeErrors ? this.errorMessages[Object.keys(activeErrors)[0]] : null;
  }
}
