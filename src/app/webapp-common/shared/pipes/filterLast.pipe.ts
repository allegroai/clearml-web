import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'filterLast',
  standalone: true
})
export class FilterLast implements PipeTransform {
  transform(items: any[]): any[] {
    const itemsCopy = [...items];
    itemsCopy.pop();
    return itemsCopy;
  }

}
