import {Pipe, PipeTransform} from '@angular/core';
import * as uuid from 'uuid';

@Pipe({
  name: 'uuid'
})
export class UuidPipe implements PipeTransform {

  transform(value: string): string {
    return `${value}-${uuid.v4()}`;
  }

}
