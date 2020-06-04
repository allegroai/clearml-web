import {Pipe, PipeTransform} from '@angular/core';
import {capitalizeFirstLetter} from '../utils/shared-utils';

@Pipe({
  name: 'labelValue'
})
export class LabelValuePipe implements PipeTransform {
  constructor() {
  }

  transform(value: string[], args?: any): Array<{ label: string, value: string }> {
    if (!value) {
      return;
    }
    return value.map(item => {
      return {label: capitalizeFirstLetter(item), value: item};
    });
  }

}
