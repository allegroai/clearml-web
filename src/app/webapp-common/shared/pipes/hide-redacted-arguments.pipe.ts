import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'hideRedactedArguments',
  pure: true
})
export class HideRedactedArgumentsPipe implements PipeTransform {

  transform(value: string, redactedArguments: { key: string }[]): string {
    if (!value || typeof (value) !== 'string' || !redactedArguments) {
      return value;
    }
    redactedArguments.forEach(redactedArgument => {
      if(value.includes(redactedArgument.key+ ' =')||value.includes(redactedArgument.key+ '=') ){
         const splitValue = value.split('=');
         const redactedArgumentValue = splitValue[splitValue.findIndex(val=> val.trim().endsWith(redactedArgument.key))+1].split(' ')[0];
         value = value.replace(redactedArgumentValue.trim(), '**************************');
      }
    });
    return value;
  }

}
