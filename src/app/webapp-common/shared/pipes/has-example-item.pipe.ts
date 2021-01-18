import {Pipe, PipeTransform} from '@angular/core';
import {isReadOnly} from '../utils/shared-utils';

@Pipe({
  name: 'hasExampleItem'
})
export class HasExampleItemPipe implements PipeTransform {

  transform(value: Array<any>, args?: any): any {
    return value.find(item => isReadOnly(item));
  }

}
