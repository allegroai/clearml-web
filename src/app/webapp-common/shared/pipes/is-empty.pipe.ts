import { Pipe, PipeTransform } from '@angular/core';
import {isEmpty} from 'lodash/fp';

@Pipe({
  name: 'isEmpty'
})
export class IsEmptyPipe implements PipeTransform {

  transform(value: unknown): unknown {
    return isEmpty(value);
  }

}
