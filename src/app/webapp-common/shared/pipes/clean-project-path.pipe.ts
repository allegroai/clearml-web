import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'cleanProjectPath'
})
export class CleanProjectPathPipe implements PipeTransform {

  transform(value: string, showLastSegment: boolean= true): string {
    if (!value) {
      return '';
    }
    let cleanPath = value.replace('.datasets/','').replace('.pipelines/', '');
    cleanPath = showLastSegment? cleanPath: cleanPath.substring(0, cleanPath.lastIndexOf('/'));
    return cleanPath;
  }
}
