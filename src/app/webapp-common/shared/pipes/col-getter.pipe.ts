import {Pipe, PipeTransform} from '@angular/core';
import {get} from 'lodash-es';
import {ISmCol} from '../ui-components/data/table/table.consts';

@Pipe({
  name: 'colGetter',
  standalone: true
})
export class ColGetterPipe implements PipeTransform {

  transform(entity: any, col: ISmCol): string {
    return get(entity, col.getter, '');
  }

}
