import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'groupHasErrors',
  standalone: true
})
export class GroupHasErrorsPipe implements PipeTransform {
  transform(formValueChanged, invalid): string {
    return invalid? 'Group configuration is invalid': '';
  }
}
