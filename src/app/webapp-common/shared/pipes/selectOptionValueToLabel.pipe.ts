import {Pipe, PipeTransform} from '@angular/core';
import {IOption} from '../ui-components/inputs/select-autocomplete/select-autocomplete.component';

@Pipe({
  name: 'selectOptionValueToLabel',
})
export class SelectOptionValueToLabelPipe implements PipeTransform {
  transform(value: string, options: Array<IOption>): string {
    if (!options) {
      return value;
    }
    const option = options.find(option => option.value === value);
    return option ? option.label : value;
  }
}
