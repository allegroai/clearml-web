import {AbstractControl, ValidationErrors} from '@angular/forms';

export function ValidateName(control: AbstractControl): ValidationErrors | null {
  if (control.value.trim().length < 3) {
    return {validName: true};
  }
  return null;
}


export function ValidateNoSpaces(control: AbstractControl): ValidationErrors | null {
  if (!control.value.includes(' ')) {
    return {validNoSpace: true};
  }
  return null;
}


export function AlFormsValidateName(value: string): ValidationErrors | null {
  if (value.trim().length < 3) {
    return {validName: true};
  }
  return null;
}
