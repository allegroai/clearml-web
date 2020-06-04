import {Pipe, PipeTransform} from '@angular/core';
import {sortByField} from '../../tasks/tasks.utils';

@Pipe({
  name: 'sort'
})
export class SortPipe implements PipeTransform {

  transform(arr: Array<any>, field: string): any[] {
    return field ? sortByField(arr, field) : [...arr].sort();
  }
}
