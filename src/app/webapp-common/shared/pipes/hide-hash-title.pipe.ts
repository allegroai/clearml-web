import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'hideHashTitle',
  standalone: true
})
export class HideHashTitlePipe implements PipeTransform {

  transform(value: string, args?: any): any {
    return value.replace(/^.{0,5}hash_/, '');
  }
}
