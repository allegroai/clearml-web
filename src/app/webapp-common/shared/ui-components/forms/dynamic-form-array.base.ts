import {FormArray, FormGroup} from '@angular/forms';
import {DynamicFormBase} from './dynamic-form.base';
import * as fb from './utils/sm-form-builder.service';
import {EventEmitter} from '@angular/core';

export abstract class DynamicFormArrayBase<T> extends DynamicFormBase<Array<T>> {

  // abstract controlName: string;
  abstract defaultFormRow: T;
  public form: FormArray;

  constructor() {
    super();
  }

  _updateFormData(formData) {
    // TODO: ?
    this._registerForm(formData);
  }

  _registerForm(formData) {
    if (!this.parentGroup) {
      throw new Error('please provide parentGroup');
    }

    if (!Array.isArray(formData)) {
      throw new Error('formData must be type of array, value provided: ' + formData);
    }

    // TODO: hack for cases that the control get destroyed...
    if (this.parentGroup.contains(this.controlName)) {
      delete (this.parentGroup.controls[this.controlName]);
    }

    this.form = new FormArray([]);

    formData.forEach((groupData) => this.form.push(fb.group(groupData)));

    if (this.parentGroup.contains(this.controlName)) {
      delete (this.parentGroup.controls[this.controlName]);
    }

    this.parentGroup.registerControl(this.controlName, this.form);
  }

  addNewRow() {
    // TODO: super dirty hack... making this commented row work will fix that:
    // (this.form.valueChanges as EventEmitter<Array<T>>).emit(this.formData.concat([this.defaultFormRow]));
    this.form.push(fb.group(this.defaultFormRow));
    // this.formData = this.formData.concat([this.defaultFormRow]);
    // setTimeout(() => {
    //   this.form.updateValueAndValidity();
    // });
  }

  setRow(index: number, rowData) {
    const newFormData = this.formData.map((row: any, i) =>
      (i === index ? rowData : {...row}));
    this.form.setValue(newFormData);
  }

  removeRow(index: number) {
    this.form.removeAt(index);
  }

}
