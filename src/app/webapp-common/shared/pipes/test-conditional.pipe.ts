import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'testConditional',
})
export class TestConditionalPipe implements PipeTransform {

  transform(form: any, groupedApplicationForm: [string, any[]][], conditional: {
    op: string, entries: [{
      name: string,
      value: string
    }]
  }, groupName?: string, groupIndex?: number): boolean {
    let conditions = []
    conditional?.entries?.forEach(ent => {
        const fieldVal = groupName ?
          groupedApplicationForm.filter(group => group[0] === groupName)[0][1][groupIndex].fields.filter(field => field.name === ent.name)[0].val :
          groupedApplicationForm.filter(field => field[0] === ent.name)[0][1][0].fields[0].val
        const r = new RegExp(ent.value);
        conditions.push(r.test(fieldVal));
      }
    )
    if (conditional?.op === 'or') {
      return conditions.some(con => con);
    } else {
      return conditions.filter((con) => !con).length === 0;
    }
  }

}
