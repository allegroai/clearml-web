import { Pipe, PipeTransform } from '@angular/core';
import * as filesize from 'filesize/lib/filesize.es6';

@Pipe({
  name: 'filesize'
})
export class FileSizePipe implements PipeTransform {
  private static transformOne(value: number, options?: any): string {
    return filesize(value, options);
  }

  transform(value: number | number[], options?: any) {
    if (Array.isArray(value)) {
      return value.map(val => FileSizePipe.transformOne(val, options));
    }

    return FileSizePipe.transformOne(value, options);
  }
}
