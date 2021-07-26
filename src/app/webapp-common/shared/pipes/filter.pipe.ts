import {Pipe, PipeTransform} from '@angular/core';
import {get} from 'lodash/fp';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {

  transform<T>(arr: T[], query: string | string[], key?: string): T[] {
    if (!arr || !query) {
      return arr;
    }

    if (Array.isArray(query)) {
      return arr.filter(item => !(query as string[]).includes((key ? get(key, item) : item)));
    } else if (typeof query === 'string') {
      return arr.filter(item => (key ? get(key, item) : item)?.toLowerCase().includes(query?.toLowerCase()));
    }
    return arr;
  }
}
