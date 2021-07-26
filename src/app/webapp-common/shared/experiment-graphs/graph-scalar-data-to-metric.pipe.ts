import { Pipe, PipeTransform } from '@angular/core';
import {convertScalars} from '../../tasks/tasks.utils';
import {ITask} from '../../../business-logic/model/al-task';
import {ExtFrame} from './single-graph/plotly-graph-base';

@Pipe({
  name: 'graphScalarDataToMetric'
})
export class GraphScalarDataToMetric implements PipeTransform {

  transform(scalars, taskId: ITask['id']) {
    if (scalars) {
      return convertScalars(scalars, taskId);
    }
    return {} as { [title: string]: ExtFrame[] };
  }

}
