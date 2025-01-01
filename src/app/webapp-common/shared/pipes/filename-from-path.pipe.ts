import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'FilenameFromPath',
  standalone: true
})
export class FilenameFromPath implements PipeTransform {

  transform(value: string, args?: any): any {
    if (value) {
      value = value.replace(/.*[^\/]\//, '').replace(/\?.*$/, '');
    }
    return value || '';

  }

}
