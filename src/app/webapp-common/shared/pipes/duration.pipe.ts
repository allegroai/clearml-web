import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'duration',
  pure: true
})
export class DurationPipe implements PipeTransform {

  transform(value: any, args?: any): any {

    if (!value && value !== 0) {
      return '';
    }
    if (value === 0) {
      return '>1 s';
    } else {
      const result = [];
      const originalVal = value;
      let seconds = value;
      // 2- Extract hours:
      const days = Math.floor(seconds / 86400) % 100;
      if (days) {
        result.push(days.toString().padStart(2, '0'));
      }
      seconds = seconds % 86400;
      const hours = Math.floor(seconds / 3600) % 100;
      if (hours) {
        result.push(hours.toString().padStart(2, '0'));
      }
      seconds = seconds % 3600; // seconds remaining after extracting hours
      // 3- Extract minutes:
      const minutes = Math.floor(seconds / 60) % 100;
      if (minutes) {
        result.push(minutes.toString().padStart(2, '0'));
      }
      // 4- Keep only seconds not extracted to minutes:
      if (originalVal < 86400) {
        result.push(Math.floor(seconds % 60).toString().padStart(2, '0'));
      }
      return result.join(':') + (originalVal < 86400 ? 's' : 'm');
    }
  }

}
