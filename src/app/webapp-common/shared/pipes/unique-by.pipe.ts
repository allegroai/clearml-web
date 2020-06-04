import {Pipe, PipeTransform} from '@angular/core';
import {uniqBy} from 'lodash/fp';

@Pipe({
  name: 'uniqueBy'})
export class UniqueByPipe implements PipeTransform {

  transform(arr: Array<any>, key: string | (any) | null): any {

    if (!Array.isArray(arr)) {
      return '';
    }

    return uniqBy(key, arr);
  }

}
