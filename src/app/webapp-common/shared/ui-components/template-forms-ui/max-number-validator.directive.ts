import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn} from '@angular/forms';

@Directive({
  selector : '[smMaxNumberValidator]',
  providers: [{provide: NG_VALIDATORS, useExisting: MaxNumberValidatorDirective, multi: true}]
})
export class MaxNumberValidatorDirective implements Validator {
  @Input() smMaxNumberValidator: number;

  validate(control: AbstractControl): ValidationErrors | null {
    return this.smMaxNumberValidator ? maxNumberValidator(this.smMaxNumberValidator)(control) : null;
  }
}

export function maxNumberValidator(maxNumber): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const forbidden = control.value > maxNumber;
    return forbidden ? {maxNumber: {value: control.value}} : null;
  };
}
