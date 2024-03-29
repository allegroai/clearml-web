import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'safeUrlParameter',
  standalone: true
})
export class safeAngularUrlParameterPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (!value) {
      return;
    }
    return encodeURIComponent(value);
  }

}
