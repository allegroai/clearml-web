import { Pipe, PipeTransform } from '@angular/core';
import * as filesize from 'filesize/lib/filesize.es6';

export const fileSizeConfigStorage = {
  base: 2,
  round: 2,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  symbols: {kB: 'KB', k: 'K', B: 'B', KiB: 'KB', MiB: 'MB',  GiB: 'GB' }
};

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
    if(isNaN(value)) {
      return value;
    }
    return FileSizePipe.transformOne(value, options);
  }
}
