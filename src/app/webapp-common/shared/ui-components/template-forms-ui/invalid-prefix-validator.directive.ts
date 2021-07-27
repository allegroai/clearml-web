import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn} from '@angular/forms';

export function validatePrefix(invalidPrefix?: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const forbidden = control.value?.startsWith(invalidPrefix);
    return forbidden ? {invalidPrefix: {value: control.value}} : null;
  };
}

@Directive({
  selector: '[smInvalidPrefixValidator]',
  providers: [{provide: NG_VALIDATORS, useExisting: InvalidPrefixValidatorDirective, multi: true}]
})
export class InvalidPrefixValidatorDirective implements Validator {
  @Input('invalidPrefix') invalidPrefix: string;

  validate(control: AbstractControl): ValidationErrors | null {
    return validatePrefix(this.invalidPrefix)(control);
  }
}


