import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn} from '@angular/forms';

export function uniqueNameValidator(names): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const forbidden = names.includes(control.value?.label || control.value);
    return forbidden ? {'uniqueName': {value: control.value}} : null;
  };
}

@Directive({
  selector : '[smUniqueNameValidator]',
  providers: [{provide: NG_VALIDATORS, useExisting: UniqueNameValidatorDirective, multi: true}]
})
export class UniqueNameValidatorDirective implements Validator {
  @Input('existingNames') existingNames: Array<string>;

  validate(control: AbstractControl): ValidationErrors | null {
    return this.existingNames ? uniqueNameValidator(this.existingNames)(control) : null;
  }
}
