import {EventEmitter, Input, OnDestroy, OnInit, Output, Directive} from '@angular/core';
import {ImmutableForm} from './immutableForm.model';
import {ValidatorFn} from '@angular/forms';
import {isEmpty, isEqual} from 'lodash/fp';

@Directive()
export class ImmutableFormField implements OnInit, OnDestroy, ImmutableForm {
  protected _formData;

  @Input() set formData(formData: any) {
    this._formData = formData;
    this.formDataUpdated(formData);
  }

  get formData() {
    return this._formData;
  }

  @Input() fieldName: string;
  @Input() errors: Map<string, boolean> = <Map<string, boolean>>{};
  @Input() header: string; // the input title.
  @Input() placeHolder: string = ''; // the input title.
  @Input() validators: Array<ValidatorFn>;
  @Input() showErrors: boolean = true; // boolean to determine when the errors should be displayed.
  @Input() isReadonly: boolean;
  @Input() inputClassName: string = 'form-control';
  @Input() readonlyClassName: string;
  @Input() readonlyLabel: string;
  @Input() disabled: boolean;
  // a map of the error messages for each error when the key is the error key and the value is the error message.
  @Input() errorMessages;

  @Output() formDataChanged = new EventEmitter<{ field: string; value: any; event: Event }>();
  @Output() errorsChanged = new EventEmitter<{ field: string; errors: Map<string, boolean> }>();

  ngOnInit() {
    // if (!this.fieldName) {
    //   console.error('please specify field name');
    // }
    this.checkValidity(this.formData);
  }

  ngOnDestroy() {
    this.errorsChanged.emit({field: this.fieldName, errors: null});
  }

  fieldValueChanged(value, event) {
    this.checkValidity(value);
    this.formDataChanged.emit({field: this.fieldName, value: value, event});
  }

  hasErrors() {
    return !isEmpty(this.errors);
  }

  getCurrentError() {
    if (!this.showErrors || !this.errors || !this.errorMessages) {
      return '';
    }
    const activeErrors = this.errors;
    return activeErrors ? this.errorMessages[Object.keys(activeErrors)[0]] : null;
  }

  checkValidity(newValue) {
    if (this.validators) {
      let errors = <Map<string, boolean>>{};
      this.validators.forEach(validatorFn => {
        const err = validatorFn(<any>{value: newValue});
        errors = err ? {...errors, ...err} : errors;
      });

      errors = isEmpty(errors) ? null : errors;

      if (!isEqual(errors, this.errors)) {
        this.errorsChanged.emit({field: this.fieldName, errors});
      }
    }
  }

  formDataUpdated(formData) {
  }

}
