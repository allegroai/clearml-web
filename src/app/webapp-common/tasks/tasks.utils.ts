import {Task} from '../../business-logic/model/tasks/task';
import {cloneDeep, sortBy} from 'lodash/fp';
import {SelectableListItem} from '@common/shared/ui-components/data/selectable-list/selectable-list.model';
import {GroupedList} from '@common/shared/ui-components/data/selectable-grouped-filter-list/selectable-grouped-filter-list.component';
import {Config} from 'plotly.js';
import {ExtData, ExtFrame, ExtLayout} from '../shared/experiment-graphs/single-graph/plotly-graph-base';
import {MetricsPlotEvent} from '../../business-logic/model/events/models';

export interface IMultiplot {
  [key: string]: { // i.e ROC
    [key: number]: { // Iteration number
      [key: string]: { // experimentId
        name: string;
        plots: ExtFrame[];
      };
    };
  };
}

export const compare = (a, b) => {
  if (a.id < b.id) {
    return -1;
  }
  if (a.id > b.id) {
    return 1;
  }
  return 0;
};

export const mergeTasks = (tableTask, task) => {
  task.project = tableTask.project;
  task.user = tableTask.user;
  task.task = tableTask.task;
  return task;
};

export const _mergeVariants = (base: Array<any>, variant) =>  base.slice().concat(variant);

export const _mergePlotsData = (base: any, toMerge: any) =>
  JSON.stringify({...base, data: _mergeVariants(base.data, toMerge.data)});

export const getModelDesignKey = (modelDes): string => {
  const modelStr = typeof modelDes == 'string';
  if (!modelDes || modelStr) {
    return undefined;
  } else {
    const desKeys = Object.keys(modelDes);
    const firstNonEmptyKey = desKeys.find(key => !!modelDes[key]);
    return firstNonEmptyKey ? firstNonEmptyKey : desKeys[0];
  }
};

export const getModelDesign = (modelDesc: Task['execution']['model_desc']): { key: string; value: any } => {
  const key = getModelDesignKey(modelDesc);
  return {key, value: key ? modelDesc[key] : modelDesc};
};

export const prepareGraph = (data: ExtData[], layout: Partial<ExtLayout>, config: Partial<Config>, graph: Partial<MetricsPlotEvent>): Partial<ExtFrame> =>
  ({
    data,
    layout,
    config,
    iter: graph.iter,
    metric: graph.metric,
    task: graph.task,
    timestamp: graph.timestamp,
    type: graph.type as unknown as string,
    variant: graph.variant,
    worker: graph['worker'],
});

export const convertPlots = ({plots, experimentId}: {plots: {[title: string]: MetricsPlotEvent[]}; experimentId: string}): { [title: string]: ExtFrame[] } =>
  Object.entries(plots).reduce((acc, [key, graphs]) => {
  acc[key] = graphs?.map(graph => {
    let json: {data: any; layout: any; config?: any};
    try {
      json = JSON.parse(graph.plot_str) as ExtFrame;
      json.data.task = json.data.task || experimentId;
    } catch (e) {
      json = {data: [], layout: {title: 'Unknown data'}};
    }
    return prepareGraph(json.data, json.layout, json.config, graph);
  });
  return acc;
}, {});

export const convertScalars = (scalars: GroupedList, experimentId: string): { [key: string]: ExtFrame[] } =>
  Object.entries(scalars).reduce((acc, graphGroup) => {
    const key = graphGroup[0];
    const graph = graphGroup[1];

    const chartData = Object.entries(graph).sort((a, b) => a[0] > b[0] ? 1 : -1)
    .map(([, data]: [string, any]) => ({
      task: experimentId,
      ...data,
      type: 'scatter'
    }));

    acc[key] = [prepareGraph(chartData, {type: 'scalar', title: key, xaxis: {title: 'Iterations'}}, {}, {metric: key})];
    return acc;
  }, {});

export const groupIterations = (plots: MetricsPlotEvent[]): {[title: string]: MetricsPlotEvent[]} => {
  if (!plots.length) {
    return {};
  }
  const sortedPlots = sortBy('iter', plots);
  return sortedPlots
    .reduce((groupedPlots, plot) => {
      const metric = plot.metric;
      groupedPlots[metric] = cloneDeep(groupedPlots[metric]) || [];
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
};

export const prepareScalarList = (metricsScalar): GroupedList =>
  Object.keys(metricsScalar || []).reduce((acc, curr) => {
    acc[curr] = {};
    return acc;
}, {});

export const sortMetricsList = (list: string[]) =>
  list ? sortBy(item => item.replace(':', '~').toLowerCase(), list) : list;

export const preparePlotsList = (groupedPlots: Map<string, any[]>): Array<SelectableListItem> => {
  const list = groupedPlots ? Object.keys(groupedPlots) : [];
  const sortedList = sortMetricsList(list);
  return sortedList.map((item) => ({name: item, value: item}));
};


export const sortByField = (arr: any[], field: string) =>
  sortBy(item => item[field].replace(':', '~').toLowerCase(), arr);

export const mergeMultiMetrics = (metrics): { [key: string]: ExtFrame[] } => {
  const graphsMap = {};
  Object.keys(metrics).forEach(key => {
    Object.keys(metrics[key]).forEach(itemKey => {
      const chartData = Object.entries(metrics[key][itemKey])
        .map(([variant, data]: [string, any]) => ({...data, type: 'scatter', task: variant}));
      graphsMap[key + itemKey] = [prepareGraph(chartData, {
        type: 'multiScalar',
        title: key + ' / ' + itemKey
      }, {}, {})];
    });
  });
  return graphsMap;
};

export const mergeMultiMetricsGroupedVariant = (metrics): { [key: string]: ExtFrame[] } => {
  const graphsMap = {};
  Object.keys(metrics).forEach(metric => {
    const chartData = [];
    Object.keys(metrics[metric]).forEach(variant => {
      chartData.push(Object.entries(metrics[metric][variant])
        .map(([taskId, data]: [string, any]) => ({
          ...data,
          type: 'scatter',
          task: taskId,
          name: `${variant} - ${data.name}`
        }))
      );
    });
    graphsMap[metric] = [prepareGraph((chartData as any).flat(), {type: 'multiScalar', title: metric}, {}, {})];
  });
  return graphsMap;
};

export const convertMultiPlots = (plots): { [key: string]: ExtFrame[] } =>
  Object.entries(plots).reduce((acc, graphGroup) => {
    const key = graphGroup[0];
    const graphs = graphGroup[1] as Array<any>;
    acc[key] = Object.values(graphs).map(
      graph => prepareGraph(graph.data, graph.layout, graph.config, {...graph, task: graph.task})
    );
    return acc;
  }, {});

export const seperateMultiplotsVariants = (mixedPlot: IMultiplot, isMultipleVarients) => {
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
};

export const prepareMultiPlots = (multiPlots: MetricsPlotEvent) => {
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
};

export const multiplotsAddChartToGroup = (charts, parsed, metric, experiment, experimentId) => {
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
};

export const wordWrap = (str, maxWidth) => {

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
      if (i > 0 && _testWhite(str.charAt(i))) {
        res = res + [str.slice(0, i), newLineStr].join('');
        str = str.slice(i + 1 || 1);
        found = true;
        break;
      }
    }
    // Inserts new line at maxWidth position, the word is too long to wrap
    if (!found) {
      res += [str.slice(0, maxWidth), newLineStr].join('');
      str = str.slice(maxWidth);
    }

    if (str.length < maxWidth) {
      done = true;
    }
  } while (!done);

  return res + str;
};

export const _testWhite = (x) => {
  const white = new RegExp(/^[\s\-_]$/);
  return white.test(x.charAt(0));
};

export const stripHtml = (s) => s.replace(/<[^>]*>?/gm, '');

export const timeInWords = (milliseconds: number, granularityLevel = 3) => {
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
};

export const chooseTimeUnit = (data) => {
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
};
