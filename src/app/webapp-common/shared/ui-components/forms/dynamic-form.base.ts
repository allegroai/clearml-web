import {AbstractControl, FormArray, FormControl, FormGroup} from '@angular/forms';
import { Input, OnInit, Directive } from '@angular/core';
import {clone} from 'lodash/fp';

@Directive()
export abstract class DynamicFormBase<T> implements OnInit {

  @Input() controlName: string;

  abstract form: FormGroup | FormArray | FormControl;
  protected _formData: T;
  protected _parentGroup: FormGroup;

  @Input() set parentGroup (parentGroup: FormGroup) {
    // for cases that the group is rebuild dynamically.
    this._parentGroup = parentGroup;
    if (!this._parentGroup || !this.formData || !this.controlName) {
      return;
    }

    // this._registerForm(this.formData);
  }

  get parentGroup() {
    return this._parentGroup;
  }

  @Input() set formData (formData) {
    // console.log('formData changed', formData);
  // && !isEqual(this.formData, formData)
  //   if (this.form) {
    this._updateFormData(formData);
    // } else {
    // }
    this._formData = clone(formData);
  }

  get formData() {
    return this._formData;
  }

  constructor() {}

  ngOnInit(): void {
    this._registerForm(this.formData);
  }

  addControl(control: AbstractControl, controlName: string, parentForm: FormGroup) {
    if (parentForm.contains(controlName)) {
      delete (parentForm.controls[controlName]);
    }
    parentForm.registerControl(controlName, control);
  }

  abstract _updateFormData(formData);

  abstract _registerForm(formData);

}
