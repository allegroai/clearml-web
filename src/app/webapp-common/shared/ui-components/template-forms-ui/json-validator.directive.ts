import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, Validator, ValidatorFn} from '@angular/forms';


@Directive({
  selector: '[jsonValidator]',
  providers: [{provide: NG_VALIDATORS, useExisting: JsonValidatorDirective, multi: true}]
})

export class JsonValidatorDirective implements Validator {
  @Input('enableJsonValidator') enableJsonValidator;

  validate(control: AbstractControl): { [key: string]: any } | null {
    return (control.value && this.enableJsonValidator) ? jsonValidatorFunc(control.value)(control)
      : null;
  }
}

export function jsonValidatorFunc(jsonString: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    try {
      JSON.parse(jsonString);
      return null;
    } catch (e) {
      return {'jsonValidator': {value: control.value}};
    }
  };
}

