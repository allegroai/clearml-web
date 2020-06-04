import {Pipe, PipeTransform} from '@angular/core';
import {get} from 'lodash/fp';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {

  transform(arr: any[], query: string | string[], key?: string): any[] {
    if (!arr || !query) {
      return arr;
    }
    if (Array.isArray(query)) {
      return arr.filter(item => !(query as string[]).includes((key ? get(key, item) : item)));
    }
    return arr.filter(item => (key ? get(key, item) : item).toLowerCase().includes(query.toLowerCase()));
  }
}
