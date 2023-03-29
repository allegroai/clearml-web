import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'filterOut',
})
export class FilterOutPipe implements PipeTransform {

  transform(arr: any[], field: string, value: string): any[] {
    if (!arr || !field || !value) {
      return arr;
    }
    return arr.filter(item => item[field] !== value);
  }
}
