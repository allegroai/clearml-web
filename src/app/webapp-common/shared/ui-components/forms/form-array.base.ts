import {OnInit, Self} from '@angular/core';
import {FormArray, NgControl, ValidatorFn} from '@angular/forms';
import {ControlValueAccessor} from '@angular/forms';
import {get} from 'lodash/fp';
import {isEqual} from 'lodash/fp';
import {SmFormBuilderService} from '../../../core/services/sm-form-builder.service';

// TODO: create common interface
export abstract class FormArrayBase<T> implements OnInit {

  abstract defaultFormRow: T;

  get formData() {
    return get('control.value', this.controlDir) || [];
  }

  public formGroup: FormArray;
  private onChangeFn;

  constructor(@Self() public controlDir: NgControl, private fb: SmFormBuilderService) {
    this.controlDir.valueAccessor = this as ControlValueAccessor;
  }

  ngOnInit() {
    const control = this.controlDir.control;
    const validators: ValidatorFn[] = control.validator ? [control.validator] : [];

    control.setValidators(validators);

    this.buildForm();
  }

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState(isDisabled: boolean): void {
  }

  writeValue(arr: Array<T>): void {
    if (!this.formGroup || isEqual(this.formGroup.value, arr)) {
      return;
    }

    this.buildForm();
  }

  updateValue(arr) {
    this.formGroup.controls.forEach((control, i) => {
      control.setValue(arr[i]);
    });
  }

  buildForm() {

    if (!Array.isArray(this.formData)) {
      throw new Error('formData must be type of array');
    }

    this.formGroup = this.fb.array(<any>this.formData, 'change');
    this.formGroup.valueChanges.subscribe(values => {
      this.onChangeFn(values);
    });
  }

  addNewRow() {
    this.onChangeFn(this.formData.concat([this.defaultFormRow]));
    // this.controlDir.control.setValue();
  }

  removeRow(index: number) {
    this.onChangeFn(this.formData.filter((val, i) => i !== index));
  }

  // addNewRow() {
  //   this.controlDir.control.setValue(this.formData.concat([this.defaultFormRow]));
  // }
  //
  // removeRow(index: number) {
  //   this.controlDir.control.setValue(this.formData.filter((val, i) => i !== index));
  // }

}
