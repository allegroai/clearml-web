import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn} from '@angular/forms';

export function uniqueNameValidator(names, forbiddenPrefix?): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value?.label || control.value?.name || control.value;
    const forbidden = names.includes(forbiddenPrefix ? forbiddenPrefix + value : value);
    return forbidden ? {'uniqueName': {value: control.value}} : null;
  };
}

@Directive({
  selector: '[smUniqueNameValidator]',
  providers: [{provide: NG_VALIDATORS, useExisting: UniqueNameValidatorDirective, multi: true}]
})
export class UniqueNameValidatorDirective implements Validator {
  @Input() existingNames: Array<string>;
  @Input() forbiddenPrefix: string;

  validate(control: AbstractControl): ValidationErrors | null {
    return this.existingNames ? uniqueNameValidator(this.existingNames, this.forbiddenPrefix)(control) : null;
  }
}


