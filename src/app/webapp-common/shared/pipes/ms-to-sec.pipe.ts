import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'msToSec',
  pure: true
})
export class MsToSecPipe implements PipeTransform {

  transform(value: any, args?: any): any {

    if (!value) {
      return '';
    } else {
      if (value < 1000) {
        return (value + ' ms');
      }
      const result = [];
      let seconds = value / 1000;
      // 2- Extract hours:
      //      const hours = ('0' + parseInt((seconds / 3600).toString(), 10)).slice(-2); // 3,600 seconds in 1 hour
      const hours = Math.floor(seconds / 3600) % 100;
      if (hours) {
        result.push(hours.toString().padStart(2, '0') + 'h');
      }

      seconds = seconds % 3600; // seconds remaining after extracting hours
      // 3- Extract minutes:
      const minutes = Math.floor(seconds / 60) % 100;
      if (minutes) {
        result.push(minutes.toString().padStart(2, '0') + 'm');
      }
      //      const minutes = ('0' + parseInt((seconds / 60).toString(), 10)).slice(-2); // 60 seconds in 1 minute
      // 4- Keep only seconds not extracted to minutes:
      result.push(Math.floor(seconds % 60).toString().padStart(2, '0') + 's');

      return result.join(' ');
    }
  }

}
