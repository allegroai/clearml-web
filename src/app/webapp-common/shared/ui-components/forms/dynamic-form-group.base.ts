import {FormGroup} from '@angular/forms';
import {DynamicFormBase} from './dynamic-form.base';
import * as fb from './utils/sm-form-builder.service';

export abstract class DynamicFormGroupBase<T> extends DynamicFormBase<T> {

  public form: FormGroup;

  _updateFormData(formData) {
    // if (this.form) {
    this._registerForm(formData);
    // }
  }

  _registerForm(formData) {
    if (!this.parentGroup) {
      throw new Error('please provide parentGroup');
    }
    this.form = fb.group(formData);

    if (this.parentGroup.contains(this.controlName)) {
      delete (this.parentGroup.controls[this.controlName]);
    }

    this.parentGroup.registerControl(this.controlName, this.form);
    // console.log(this.controlName, ': ', this.form);
    // console.log(this.controlName, ' parent: ', this.parentGroup);
  }

}
