import {OnInit, Self} from '@angular/core';
import {FormGroup, NgControl, ValidatorFn} from '@angular/forms';
import {ControlValueAccessor} from '@angular/forms';
import {SmFormBuilderService} from '../../../core/services/sm-form-builder.service';

// TODO: create common interface
export abstract class FormGroupBase<T> implements OnInit {

  formData: T;
  public formGroup: FormGroup;
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

  writeValue(obj: any): void {
    this.formData = obj;
    if (!this.formGroup) {
      return;
    }
    this.formGroup.setValue(obj);
    // this.formGroup.patchValue({value: obj, option: {selfOnly: true, emitEvent: false}});
  }

  buildForm() {
    if (typeof this.formData !== 'object') {
      throw new Error('formData must be an object');
    }
    this.formGroup = this.fb.group(<any>this.formData);
    this.formGroup.valueChanges.subscribe(values => {
      this.onChangeFn(values);
    });

    if (this.formData) {
      this.writeValue(this.formData);
    }

    this.formGroup.statusChanges.subscribe(status => {
      const errors = (status === 'INVALID') ? this.getGroupErrors(this.formGroup) : null;
      this.controlDir.control.setErrors(errors);
    });
  }

  getGroupErrors(group) {
    const errors = {};
    Object.entries(this.formGroup.controls).forEach(([key, err]) => errors[key] = err);

    return errors;
  }

}
