import {Task} from '../../business-logic/model/tasks/task';
import {get, sortBy} from 'lodash/fp';
import {ExperimentGraph} from './tasks.model';
import {EventsGetMultiTaskPlotsResponse} from '../../business-logic/model/events/eventsGetMultiTaskPlotsResponse';

export interface IMultiplot {
  [key: string]: { // i.e ROC
    [key: number]: { // Iteration number
      [key: string]: { // experimentId
        name: string;
        plots: Array<IPlot>;
      };
    };
  };
}

export interface IPlot {
  iter: number;
  metric: string;
  plot_str: string;
  task: Task['id'];
  timestamp: number;
  type: string;
  variant: string;
  worker: string;
}


export function compare(a, b) {
  if (a.id < b.id) {
    return -1;
  }
  if (a.id > b.id) {
    return 1;
  }
  return 0;
}

export function mergeTasks(tableTask, task) {
  task.project = tableTask.project;
  task.user = tableTask.user;
  task.task = tableTask.task;
  return task;
}


export function getModelDesign(modelDesc: Task['execution']['model_desc']): { key: string, value: any } {
  const key = getModelDesignKey(modelDesc);
  return{key: key, value: key ? modelDesc[key] : modelDesc};
}

function getModelDesignKey(modelDes): string {
  const modelStr = typeof modelDes == 'string';
  if (!modelDes || modelStr) {
    return undefined;
  } else {
    const desKeys = Object.keys(modelDes);
    const firstNonEmptyKey = desKeys.find(key => !!modelDes[key]);
    return firstNonEmptyKey ? firstNonEmptyKey : desKeys[0];
  }
}

export function convertPlots(plots): { [key: string]: ExperimentGraph } {
  return Object.entries(plots).reduce((acc, graphGroup) => {
    const key = graphGroup[0];
    const graphs = graphGroup[1] as Array<any>;
    acc[key] = graphs.map(graph => {
      const json = JSON.parse(graph.plot_str);
      return prepareGraph(json.data, json.layout, json.config, graph);
    });
    return acc;
  }, {});
}

export function prepareGraph(data: object, layout: object, config: object, graph): ExperimentGraph {
  return {
    data     : data,
    layout   : layout,
    config   : config,
    iter     : graph.iter,
    metric   : graph.metric,
    task     : graph.task,
    timestamp: graph.timestamp,
    type     : graph.type,
    variant  : graph.variant,
    worker   : graph.worker,
  };
}

export function convertScalars(scalars): { [key: string]: ExperimentGraph } {
  return Object.entries(scalars).reduce((acc, graphGroup) => {
    const key = graphGroup[0];
    const graph = graphGroup[1];

    const chart_data = Object.entries(graph).sort((a, b) => a[0] > b[0] ? 1 : -1)
      .map(([variant, data]: [string, any]) => ({
        ...data,
        type: 'scatter'
      }));

    acc[key] = [prepareGraph(chart_data, {type: 'scalar', title: key, xaxis: {title: 'Iterations'}}, {}, {metric: key})];
    return acc;
  }, {});
}

export function groupIterations(plots: any[]): Map<string, any[]> {
  if (!plots.length) {
    return {} as Map<string, any[]>;
  }
  const sortedPlots = sortBy('iter', plots);
  return sortedPlots
    .reduce((groupedPlots, plot) => {
      const metric = plot.metric;
      groupedPlots[metric] = groupedPlots[metric] || [];
      const index = groupedPlots[metric].findIndex((existingGraph) => plot.iter === existingGraph.iter);
      const plotParsed = index > -1 && JSON.parse(plot.plot_str);
      if (index > -1 && plotParsed.data && plotParsed.data[0] && ['scatter', 'bar'].includes(plotParsed.data[0].type)) {
        const basePlotParsed = JSON.parse(groupedPlots[metric][index].plot_str);
        groupedPlots[metric][index].plot_str = _mergePlotsData(basePlotParsed, plotParsed);
      } else {
        groupedPlots[metric].push(plot);
      }
      return groupedPlots;
    }, {});
}

export function sortMetricsList(list: string[]) {
  return list ? sortBy(item => item.replace(':', '~').toLowerCase(), list) : list;
}

export function sortByField(arr: any[], field: string) {
  return sortBy(item => item[field].replace(':', '~').toLowerCase(), arr);
}

export function mergeMultiMetrics(metrics): { [key: string]: ExperimentGraph } {
  const graphsMap = {};
  Object.keys(metrics).forEach(key => {
    Object.keys(metrics[key]).forEach(itemKey => {
      const chart_data = Object.entries(metrics[key][itemKey])
        .map(([variant, data]: [string, any]) => ({...data, type: 'scatter', task: variant}));
      graphsMap[key + itemKey] = [prepareGraph(chart_data, {type: 'multiScalar', title: key + ' / ' + itemKey}, {}, {})];
    });
  });
  return graphsMap;
}

export function convertMultiPlots(plots): { [key: string]: ExperimentGraph } {

  return Object.entries(plots).reduce((acc, graphGroup) => {
    const key = graphGroup[0];
    const graphs = graphGroup[1] as Array<any>;

    acc[key] = Object.values(graphs).map(graph => {
      return prepareGraph(graph.data, graph.layout, graph.config, {...graph, task: graph.task});
    });
    return acc;
  }, {});
}

export function prepareMultiPlots(multiPlots: EventsGetMultiTaskPlotsResponse['plots']) {
  if (!multiPlots) {
    return multiPlots;
  }
  return Object.entries(multiPlots).reduce((acc, graph) => {
    if (!graph[1]) {
      return acc;
    }
    const isMultipleVarients = Object.keys(graph[1]).length > 1;
    const graphsPerVariant = seperateMultiplotsVariants(graph[1] as IMultiplot, isMultipleVarients);
    return {...acc, ...graphsPerVariant};
  }, {});
}

export function seperateMultiplotsVariants(mixedPlot: IMultiplot, isMultipleVarients) {
  let charts = {};
  const values = Object.values(mixedPlot);
  if (!values || values.length === 0) {
    return mixedPlot;
  }
  for (const variant of values) {
    const duplicateNamesObject = Object.values(variant).reduce((acc, experiment) => {
      const experimentName = Object.values(experiment)[0].name;
      acc[experimentName] = acc[experimentName] !== undefined;
      return acc;
    }, {} as { [name: string]: boolean });

    Object.entries(variant).map(experiment => {
      const experimentId = experiment[0];
      const shortExpId = experimentId.substr(0, 6);
      const experimentData = experiment[1];

      const iterationKey = Object.keys(experimentData)[0];
      const iteration = (experimentData[iterationKey] as any);
      const experimentName = duplicateNamesObject[iteration.name] ? iteration.name + '.' + shortExpId : iteration.name;
      const plot = iteration.plots[0];
      const parsed = JSON.parse(plot.plot_str);
      const metric = isMultipleVarients ? plot.metric + '-' + plot.variant : plot.metric;
      charts = multiplotsAddChartToGroup(charts, parsed, metric, experimentName, experimentId);
    });
  }

  return charts;
}

export function multiplotsAddChartToGroup(charts, parsed, metric, experiment, experimentId) {
  const allowedTypes = ['scatter', 'bar'];
  let fullName: string;
  if (parsed.layout && parsed.layout.images) {
    if (!charts[metric]) {
      charts[metric] = {};
    }
    const index = Object.keys(charts[metric]).length;
    charts[metric][index] = parsed;
  }
  for (let i = 0; i < parsed.data.length; i++) {
    let isMultipleTasks = false;
    const variant = parsed.data.slice()[i];
    if (!variant) {
      continue;
    }
    const metricName = metric;
    if (!charts[metricName]) {
      charts[metricName] = {};
    }
    if ((!variant.type || allowedTypes.includes(variant.type)) && variant.name) {
      fullName = metric + '-' + variant.name;
      variant.name = (experiment);
      variant.task = (experimentId);
    } else {
      fullName = metric + '-' + experiment;
    }
    if (!charts[metricName][fullName]) {
      charts[metricName][fullName] = Object.assign({}, parsed);
      charts[metricName][fullName].data = [variant];
    } else {
      charts[metricName][fullName].data = _mergeVariants(charts[metricName][fullName].data.slice(), variant);
      isMultipleTasks = true;
    }
    charts[metricName][fullName].layout = Object.assign({}, {...charts[metricName][fullName].layout});
    charts[metricName][fullName].layout.title = fullName;
    charts[metricName][fullName].layout.barmode = isMultipleTasks ? 'group' : 'stack';
  }
  return charts;
}

export function wordWrap(str, maxWidth) {

  if (str.length <= maxWidth) {
    return str;
  }
  const newLineStr = '<br>';
  let done = false;
  let found;
  let res = '';
  do {
    found = false;
    // Inserts new line at first whitespace of the line
    for (let i = maxWidth - 1; i >= 0; i--) {
      if (_testWhite(str.charAt(i))) {
        res = res + [str.slice(0, i), newLineStr].join('');
        str = str.slice(i || 1);
        found = true;
        break;
      }
    }
    // Inserts new line at maxWidth position, the word is too long to wrap
    if (!found) {
      res += [str.slice(0, maxWidth), newLineStr].join('');
      str = str.slice(maxWidth);
    }

    if (str.length < maxWidth)
      done = true;
  } while (!done);

  return res + str;
}

function _testWhite(x) {
  const white = new RegExp(/^[\s\-_]$/);
  return white.test(x.charAt(0));
}

function _mergePlotsData(base: any, toMerge: any) {
  return JSON.stringify({...base, data: _mergeVariants(base.data, toMerge.data)});
}

export function _mergeVariants(base: Array<any>, variant) {
  const data_array = base.slice();
  return data_array.concat(variant);
}

export function stripHtml(s) {
  return s.replace(/<[^>]*>?/gm, '');
}

export function timeInWords(milliseconds, granularityLevel = 3) {
  let remaining = Math.floor(milliseconds / 1000);
  if (remaining <= 0) {
    return '0';
  }
  const output = [];
  const timesConst = [12 * 30 * 24 * 60 * 60, 30 * 24 * 60 * 60, 24 * 60 * 60, 60 * 60, 60, 1];
  const timeStringPlural = ['Years', 'Months', 'Days', 'Hours', 'Minutes', 'Seconds'];
  const timeStringSingle = ['Year', 'Month', 'Day', 'Hour', 'Minute', 'Second'];
  for (let i = 0; i < timesConst.length; i++) {
    const unitCount = Math.floor(remaining / timesConst[i]);
    if (unitCount === 0) {
      continue;
    }
    remaining %= timesConst[i];
    const unitString = unitCount > 1 ? `${unitCount} ${timeStringPlural[i]}` : `${unitCount} ${timeStringSingle[i]}`;
    output.push(unitString);
    if (output.length >= granularityLevel) {
      break;
    }
  }
  return output.join(' ');
}

export function chooseTimeUnit(data) {
  if (!data[0]?.x || !data[0]?.x[0] || !data[0]?.x[1]) {
    return {time: 1000, str: 'Seconds'};
  }
  const first = data[0].x[0];
  const last = data[0].x[data[0].x.length - 1];
  const seconds = Math.floor((last - first) / 1000);
  const timesConst = [12 * 30 * 24 * 60 * 60, 30 * 24 * 60 * 60, 24 * 60 * 60, 60 * 60, 60, 1];
  const timeStringPlural = ['Years', 'Months', 'Days', 'Hours', 'Minutes', 'Seconds'];
  for (let i = 0; i < timesConst.length; i++) {
    if (seconds / timesConst[i + 1] > 100) {
      return {time: timesConst[i] * 1000, str: timeStringPlural[i]};
    }
  }
  const lastIndex = timesConst.length - 1;
  return {time: timesConst[lastIndex] * 1000, str: timeStringPlural[lastIndex]};
}
