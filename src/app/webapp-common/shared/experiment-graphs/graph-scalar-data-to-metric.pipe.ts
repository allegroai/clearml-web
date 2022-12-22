import { Pipe, PipeTransform } from '@angular/core';
import {convertScalars} from '../../tasks/tasks.utils';
import {ExtFrame} from '../single-graph/plotly-graph-base';

@Pipe({
  name: 'graphScalarDataToMetric'
})
export class GraphScalarDataToMetric implements PipeTransform {

  transform(scalars, taskId: string) {
    if (scalars) {
      return convertScalars(scalars, taskId);
    }
    return {} as { [title: string]: ExtFrame[] };
  }

}
