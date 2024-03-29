import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'labelValueToStringArray',
  standalone: true
})
export class LabelValueToStringArrayPipe implements PipeTransform {
transform(labelValArr: Array<{ label: string; value: string }>): string[] {
    return labelValArr.map(item=> item.label);
  }

}
