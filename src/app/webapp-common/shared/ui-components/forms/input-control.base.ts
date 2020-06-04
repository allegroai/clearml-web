import { EventEmitter, Input, OnInit, Output, Directive } from '@angular/core';
import {ValidatorFn} from '@angular/forms';
import {FormControl, FormGroup} from '@angular/forms';
// TODO: create common interface

@Directive()
export class InputControlBase implements OnInit {
  public formControl: FormControl;
  protected _parentGroup: FormGroup;

  @Input() header: string; // the input title.
  @Input() validators: Array<ValidatorFn>;
  @Input() controlName: string; // the formControl name.
  @Input() showErrors: boolean = true; // boolean to determine when the errors should be displayed.
  @Input() isReadonly: boolean;
  @Input() inputClassName: string = 'form-control';
  @Input() placeHolder: string;
  // a map of the error messages for each error when the key is the error key and the value is the error message.
  @Input()  errorMessages;
  // the parent form group instance.
  @Input() set parentGroup (parentGroup: FormGroup) {
    // TODO: hack for cases that the group is rebuild dynamically.
    this._parentGroup = parentGroup;
    if (this._parentGroup) {
      this.initialFormControl();
    }
  }

  get parentGroup() {
    return this._parentGroup;
  }

  @Output() inputClicked = new EventEmitter();

  constructor() { }

  ngOnInit() {
    if (!this.controlName) {
      throw new Error('please specify input name.');
    }
    if (!this.parentGroup || !this.parentGroup.controls) {
      throw new Error('please add form group.');
    }

    this.initialFormControl();
  }

  initialFormControl() {
    if (!this.parentGroup.controls[this.controlName]) {
      throw new Error('there is no control name: ' + this.controlName + ' in group');
    }
    this.formControl = this.parentGroup.controls[this.controlName] as FormControl;

    if (this.validators) {
      this.formControl.setValidators(this.validators);
      this.formControl.updateValueAndValidity();
    }
  }

  getCurrentError() {
    const activeErrors = this.formControl.errors;
    return activeErrors ? this.errorMessages[Object.keys(activeErrors)[0]] : null;
  }
}
