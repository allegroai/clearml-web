import {Directive} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator} from '@angular/forms';


@Directive({
  selector: '[smRequiredAutocompleteSelectionValidator]',
  providers: [{provide: NG_VALIDATORS, useExisting: RequiredAutocompleteSelectionValidatorDirective, multi: true}],
  standalone: true,
})
export class RequiredAutocompleteSelectionValidatorDirective implements Validator {

  validate(control: AbstractControl): ValidationErrors | null {
    return (typeof control.value === 'string' && control.value !== '') ? {requiredAutocompleteSelection: {value: control.value}} : null;
  }
}


