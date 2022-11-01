import { Injectable } from '@angular/core';
import {UntypedFormControl, UntypedFormGroup, UntypedFormArray} from '@angular/forms';

import {forEach} from 'lodash/fp';

@Injectable()
export class SmFormBuilderService {

  create(formData: any, updateOn?: any) {
    if (Array.isArray(formData)) {
      const arr = formData.map( data => this.create(data));
      return new UntypedFormArray(arr, {updateOn});
    } else if (typeof formData === 'function') {
      return formData();
    } else if (formData instanceof Object) {
      if (formData.value) {
        return new UntypedFormControl(formData.value);
      } else {
        const obj = {};
        Object.entries(formData).forEach(([key, value]) => obj[key] = this.create(value));
        return new UntypedFormGroup(obj, {updateOn});
      }

    } else {
      return new UntypedFormControl(formData);
    }
  }
// @ts-ignore
  getFormErrors(form: UntypedFormGroup | UntypedFormArray, errors?: any): any {
    // @ts-ignore
    forEach((control: any) => {
      // @ts-ignore
      errors[control.name] = control.errors;
    }, form.controls);

    return errors;
  }

  recursive(formData: any, updateOn?: any) {
    this.create(formData, updateOn);
  }

  array(formData: Array<any>, updateOn: any = 'change') {
    const arr = formData.map( data => this.group(data, updateOn));
    return new UntypedFormArray(arr, {updateOn: 'blur'});
  }

  group(formData: any, updateOn: any = 'change') {
    const formGroup = new UntypedFormGroup({}, {updateOn});
    Object.entries(formData).forEach(([key, value]) => formGroup.addControl(key, new UntypedFormControl(value)));

    return formGroup;
  }

}
