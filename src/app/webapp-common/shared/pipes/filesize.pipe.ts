import { Pipe, PipeTransform } from '@angular/core';
import {filesize} from 'filesize';

export const fileSizeConfigStorage = {
  base: 2,
  round: 2,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  symbols: {KiB: 'KB', kB: 'KB', k: 'K', B: 'B', MiB: 'MB', MB: 'MB', GiB: 'GB' }
};

export const fileSizeConfigCount = {
  base: 10,
  round: 2,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  symbols: {kB: 'K', k: 'K', B: ' ',  MB: 'M',  GB: 'G' }
};

@Pipe({
  name: 'filesize',
  standalone: true
})
export class FileSizePipe implements PipeTransform {
  private static transformOne(value: number, options?: any): string {
    return filesize(value, options) as string;
  }

  transform(value: number, options?: Parameters<typeof filesize>[1]) {
    if (Array.isArray(value)) {
      return value.map(val => this.transform(val, options));
    }
    if(typeof value !== 'number') {
      return value;
    }
    return FileSizePipe.transformOne(value, options);
  }
}
