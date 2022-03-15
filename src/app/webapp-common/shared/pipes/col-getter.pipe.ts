import {Pipe, PipeTransform} from '@angular/core';
import {getOr} from 'lodash/fp';
import {ISmCol} from '../ui-components/data/table/table.consts';

@Pipe({
  name: 'colGetter'
})
export class ColGetterPipe implements PipeTransform {

  transform(entity: any, col: ISmCol): string {
    return getOr('',col.getter, entity);
  }

}
