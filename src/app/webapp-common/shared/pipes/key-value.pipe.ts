import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keyValue'
})
export class KeyValuePipe implements PipeTransform {

  transform(value: Map<any, any>, args?: any): Array<{key: any, value: any}> {
    return Object.entries(value).map(([key, val]) => ({key, value: val}));
  }

}
