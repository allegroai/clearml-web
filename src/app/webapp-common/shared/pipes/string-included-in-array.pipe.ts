import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'stringIncludedInArray',
  standalone: true
})
export class StringIncludedInArrayPipe implements PipeTransform {

  transform(value: string, stingsArr: string[] = []): boolean {
    if (!value) {
      return false;
    }
    return stingsArr?.includes(value);
  }

}
