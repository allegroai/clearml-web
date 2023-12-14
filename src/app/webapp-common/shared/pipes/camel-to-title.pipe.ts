import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'camelToTitle',
  pure: true
})
export class CamelToTitlePipe implements PipeTransform {

  transform(value: string): string {

    if (!value || typeof(value) !== 'string') {
      return value;
    }

    const words = value.match(/[A-Za-z][a-z]*/g);

    return words.map(this.capitalize).join(' ');
  }

  capitalize(word) {
    return word.charAt(0).toUpperCase() + word.substring(1);
  }

}
