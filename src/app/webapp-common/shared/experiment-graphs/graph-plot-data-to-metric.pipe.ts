import { Pipe, PipeTransform } from '@angular/core';
import {convertPlots, groupIterations} from '../../tasks/tasks.utils';
import {MetricsPlotEvent} from '~/business-logic/model/events/metricsPlotEvent';
import {ExtFrame} from '../single-graph/plotly-graph-base';

@Pipe({
  name: 'graphPlotDataToMetric'
})
export class GraphPlotDataToMetric implements PipeTransform {

  transform(metricsPlots: MetricsPlotEvent[], taskId: string) {
    if (metricsPlots) {
      const groupedPlots = groupIterations(metricsPlots);
      return convertPlots({plots: groupedPlots, experimentId: taskId}).graphs;
    }
    return {} as { [title: string]: ExtFrame[] };
  }

}
