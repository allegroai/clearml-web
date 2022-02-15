import { Pipe, PipeTransform } from '@angular/core';
import {get} from 'lodash/fp';

@Pipe({
  name: 'getVariantWithoutRound'
})
export class GetVariantWithoutRoundPipe implements PipeTransform {

  transform(col, metrics): number {
    return get(`${col.metric_hash}.${col.variant_hash}.${col.valueType}`, metrics);
  }

}
