import { Injectable } from '@angular/core';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { forEach } from 'lodash/fp';

@Injectable()
export class SmFormBuilderService {

  create(formData: any, updateOn?: any) {
    if (Array.isArray(formData)) {
      const arr = formData.map(data => this.create(data));
      return new FormArray(arr, { updateOn });
    } else if (typeof formData === 'function') {
      return formData();
    } else if (formData instanceof Object) {
      if (formData.value) {
        return new FormControl(formData.value);
      } else {
        const obj = {};
        Object.entries(formData).forEach(([key, value]) => obj[key] = this.create(value));
        return new FormGroup(obj, { updateOn });
      }

    } else {
      return new FormControl(formData);
    }
  }
  // @ts-ignore
  getFormErrors(form: FormGroup | FormArray, errors: any = {}) {
    // @ts-ignore
    forEach(control => {
      // @ts-ignore
      errors[control.name] = control.errors;
    }, form.controls);

    return errors;
  }

  recursive(formData: any, updateOn?: any) {
    this.create(formData, updateOn);
  }

  array(formData: Array<Object>) {
    const arr = formData.map(data => this.group(data));
    return new FormArray(arr);
  }

  group(formData: Object) {
    const formGroup = new FormGroup({});
    Object.entries(formData).forEach(([key, value]) => formGroup.addControl(key, new FormControl(value)));

    return formGroup;
  }

}
