import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'filterInternal',
  standalone: true
})
export class FilterInternalPipe implements PipeTransform {
  transform(arr) {
    return arr?.filter(item=> !item.key.startsWith('_'));
  }
}
