import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'filterById',
  standalone: true
})
export class FilterByIdPipe implements PipeTransform {

  transform(obj: any, id: string, mapTo: string): any[] {
    if (!obj || !id) {
      return obj;
    }
    return obj.filter(parameter=> parameter.id!== id).map(parameter => parameter[mapTo])
  }

}
