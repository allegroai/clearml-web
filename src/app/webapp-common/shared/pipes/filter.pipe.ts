import {Pipe, PipeTransform} from '@angular/core';
import {get} from 'lodash-es';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {

  transform(arr, query: string | string[], key?: string) {
    if (!arr || !query) {
      return arr;
    }

    if (Array.isArray(query)) {
      return arr.filter(item => !(query as string[]).includes((key ? get(item,key) : item)));
    } else if (typeof query === 'string') {
      return arr.filter(item => (key ? get(item,key) : item)?.toLowerCase().includes(query?.toLowerCase()));
    }
    return arr;
  }
}
