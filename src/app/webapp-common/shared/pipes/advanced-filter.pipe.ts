import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'advancedFilter',
  standalone: true
})
export class AdvancedFilterPipe implements PipeTransform {

  transform(arr: any[], query: string): any[] {
    if (!arr || !query) {
      return arr;
    }
    return arr.filter(item => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()));
  }

}
