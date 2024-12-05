import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'filterOut',
  standalone: true
})
export class FilterOutPipe implements PipeTransform {

  transform(arr: unknown[], field: string, value: string | boolean): unknown[] {
    if (!arr || !field || value === undefined) {
      return arr;
    }
    return arr.filter(item => item[field] !== value);
  }
}
