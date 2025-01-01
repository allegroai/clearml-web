import {AbstractControl, ValidatorFn} from '@angular/forms';

export const binaryValidationRegexp = /(\/(bash|zsh|sh)|^(bash|zsh|sh))$/;

export const shellBinaryValidator: ValidatorFn = (control: AbstractControl) => {
  const found = binaryValidationRegexp.test(control.value);
  return found ? null : {shellBinary: {value: control.value}};
}
