import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'noUnderscore',
  standalone: true
})
export class NoUnderscorePipe implements PipeTransform {

  transform(value: string, args?: any): any {
    if (value) {
      value = value.replace(/[_-]/g, ' ');
    }
    return value;
  }

}
