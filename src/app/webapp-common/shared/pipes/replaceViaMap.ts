import {Pipe, PipeTransform} from '@angular/core';
import {getOr} from 'lodash/fp';

@Pipe({
  name: 'replaceViaMapPipe',
})
export class ReplaceViaMapPipe implements PipeTransform {

  transform(value: string, replaceMap: { [key: string]: string }): string {
    if (!value || !replaceMap) {
      return value;
    }
    return getOr(value, value, replaceMap);
  }

}
