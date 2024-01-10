import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'breadcrumbsEllipsis',
  standalone: true
})
export class BreadcrumbsEllipsisPipe implements PipeTransform {

  transform(value: string) {

    const count = (value.match(/\//g) || []).length;

    if (count > 1) {
      return `<div class="sub-path">${value.substring(0, value.indexOf('/'))}</div>/<i class="al-ico-dots al-icon sm"></i><div class="sub-path">${value.substring(value.lastIndexOf('/'))}</div>`;
    }
    return `<div class="sub-path double-width">${value}</div>`;
  }

}
