import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'formgroupHasRequiredField',
  standalone: true
})
export class FormgroupHasRequiredFieldPipe implements PipeTransform {

  transform(formGroup: any): string {
    return formGroup.fields.some(field => field.required)? '*': '';
  }

}
