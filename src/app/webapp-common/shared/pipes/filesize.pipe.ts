import { Pipe, PipeTransform } from '@angular/core';
import {filesize} from 'filesize';

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
    return filesize(value, options) as string;
  }

  transform(value: number | number[], options?: any) {
    if (Array.isArray(value)) {
      return value.map(val => this.transform(val, options));
    }
    if(typeof value !== 'number') {
      return value;
    }
    return FileSizePipe.transformOne(value, options);
  }
}
