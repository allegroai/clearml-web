import {Pipe, PipeTransform} from '@angular/core';
import {IOption} from '@common/shared/ui-components/inputs/select-autocomplete-with-chips/select-autocomplete-with-chips.component';

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
