import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'numberToK'
})
export class NumberToKPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let showFloat = false;
    let number;
    if(value < 1000 || isNaN(value)) {
      return value;
    }
    let str = '';
    let power = 1;
    if (value >= 1000 && value < 1000 * 1000) {
      power = 3;
      str   = 'K';
      if(value > 999 && value <= 9999 ) {
        showFloat = true;
      }
    }
    else if(value >= 1000 * 1000 && value < 1000 * 1000 * 1000) {
      power = 6;
      str   = 'M';
    }
    else {
      power = 9;
        str   = 'B';
    }
    if( showFloat ) {
      number = parseFloat((value / (Math.pow(10, power))).toFixed(1));
    }
    else {
      number = Math.floor((value / (Math.pow(10, power))));
    }

    return number + '' + str;
  }

}
