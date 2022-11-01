import {Task} from '~/business-logic/model/tasks/task';
import * as actions from '../actions/common-experiment-output.actions';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {sortBy, reverse} from 'lodash/fp';
import {ChartHoverModeEnum, LOG_BATCH_SIZE} from '../shared/common-experiments.const';
import {MetricsPlotEvent} from '~/business-logic/model/events/metricsPlotEvent';
import {ExtFrame} from '@common/shared/experiment-graphs/single-graph/plotly-graph-base';
import {EventsGetTaskSingleValueMetricsResponseValues} from '~/business-logic/model/events/eventsGetTaskSingleValueMetricsResponseValues';
import {on, createReducer} from '@ngrx/store';
import {HistogramCharts} from '../actions/common-experiment-output.actions';

export type GroupByCharts = 'metric' | 'none';

export const groupByCharts = {
  metric: 'metric' as GroupByCharts,
  none: 'none' as GroupByCharts
};

export interface Log {
  timestamp: number;
  type: 'log';
  task: Task['id'];
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  worker: string;
  msg: string;
  metric: string;
  variant: string;
}

export interface CommonExperimentOutputState {
  metricsMultiScalarsCharts: any;
  metricsHistogramCharts: HistogramCharts;
  fullScreenDetailedChart: ExtFrame;
  fetchingFullScreenData: boolean;
  fullScreenXtype: ScalarKeyEnum;
  isFullScreenOpen: boolean;
  cachedAxisType: ScalarKeyEnum;
  metricsPlotsCharts: MetricsPlotEvent[];
  experimentLog: Log[];
  totalLogLines: number;
  beginningOfLog: boolean;
  settingsList: Array<ExperimentSettings>;
  searchTerm: string;
  logFilter: string;
  logLoading: boolean;
  showSettings: boolean;
  minMaxIterations: { minIteration: number; maxIteration: number };
  currentPlotViewer: any;
  scalarSingleValue: Array<EventsGetTaskSingleValueMetricsResponseValues>;
  plotViewerScrollId: string;
  plotViewerEndOfTime: boolean;
  plotViewerBeginningOfTime: boolean;
  scalarsHoverMode: ChartHoverModeEnum;
  graphsPerRow: number;
}

export interface ExperimentSettings {
  id: Task['id'];
  hiddenMetricsScalar: Array<string>;
  hiddenMetricsPlot: Array<string>;
  selectedHyperParams: Array<string>;
  selectedMetric: string;
  selectedScalar: string;
  selectedPlot: string;
  smoothWeight: number;
  xAxisType: ScalarKeyEnum;
  groupBy: GroupByCharts;
  lastModified?: number;
}

export const initialCommonExperimentOutputState: CommonExperimentOutputState = {
  metricsMultiScalarsCharts: null,
  metricsHistogramCharts: null,
  fullScreenDetailedChart: null,
  fullScreenXtype: null,
  fetchingFullScreenData: false,
  cachedAxisType: null,
  metricsPlotsCharts: null,
  isFullScreenOpen: false,
  experimentLog: null,
  totalLogLines: null,
  beginningOfLog: false,
  settingsList: [],
  scalarSingleValue:[],
  searchTerm: '',
  logFilter: null,
  logLoading: false,
  showSettings: false,
  currentPlotViewer: null,
  minMaxIterations: null,
  plotViewerScrollId: null,
  plotViewerEndOfTime: null,
  plotViewerBeginningOfTime: null,
  scalarsHoverMode: 'x',
  graphsPerRow: 2
};

export const commonExperimentOutputReducer = createReducer(
  initialCommonExperimentOutputState,
  on(actions.resetOutput, state  => ({
    ...state,
    experimentLog: initialCommonExperimentOutputState.experimentLog,
    metricsMultiScalarsCharts: initialCommonExperimentOutputState.metricsMultiScalarsCharts,
    metricsHistogramCharts: initialCommonExperimentOutputState.metricsHistogramCharts,
    metricsPlotsCharts: initialCommonExperimentOutputState.metricsPlotsCharts
  })),
  on(actions.setGraphDisplayFullDetailsScalars, (state, action) => ({...state, fullScreenDetailedChart: action.data})),
  on(actions.setGraphDisplayFullDetailsScalarsIsOpen, (state, action) => ({
    ...state,
    isFullScreenOpen: action.isOpen,
    fullScreenDetailedChart: null,
    currentPlotViewer: null,
    plotViewerScrollId: null,
    minMaxIterations: null
  })),
  on(actions.getGraphDisplayFullDetailsScalars, state  => ({...state, fetchingFullScreenData: true})),
  on(actions.setXtypeGraphDisplayFullDetailsScalars, (state, action) => ({...state, fullScreenXtype: action.xAxisType})),
  on(actions.mergeGraphDisplayFullDetailsScalars, (state, action) => ({
    ...state,
    fullScreenDetailedChart: {...state.fullScreenDetailedChart, data: action.data},
    fetchingFullScreenData: false
  })),
  on(actions.getExperimentLog, (state, action) => ({...state, logLoading: !action.autoRefresh})),
  on(actions.setExperimentLogLoading, (state, action) => ({...state, logLoading: action.loading})),
  on(actions.setExperimentLog, (state, action) => {
    const events = reverse(action.events);
    let currLog: any[];
    let atStart = false;
    if (action.direction) {
      if (action.refresh) {
        currLog = events;
      } else if (action.direction === 'prev') {
        if (action.events?.length < LOG_BATCH_SIZE) {
          atStart = true;
        }
        currLog = sortBy('timestamp', events.concat(state.experimentLog));
        if (currLog.length > 300) {
          currLog = currLog.slice(0, 300);
        }
      } else {
        currLog = sortBy('timestamp', state.experimentLog?.concat(events));
        if (currLog.length > 300) {
          currLog = currLog.slice(currLog.length - 300, currLog.length);
        }
      }
    } else {
      currLog = events;
    }
    return {
      ...state,
      experimentLog: currLog,
      totalLogLines: action.total,
      beginningOfLog: atStart,
      logLoading: false
    };
  }),
  on(actions.setExperimentLogAtStart, (state, action) => ({...state, beginningOfLog: action.atStart, logLoading: false})),
  on(actions.setExperimentMetricsSearchTerm, (state, action) => ({...state, searchTerm: action.searchTerm})),
  on(actions.setHistogram, (state, action) => ({...state, metricsHistogramCharts: action.histogram, cachedAxisType: action.axisType})),
  on(actions.setExperimentPlots, (state, action) => ({...state, metricsPlotsCharts: action.plots})),
  on(actions.setCurrentPlot, (state, action) => ({...state, currentPlotViewer: action.event})),
  on(actions.setExperimentScalarSingleValue, (state, action) => ({...state, scalarSingleValue: action.values})),
  on(actions.setPlotIterations, (state, action) => ({...state, minMaxIterations: {minIteration: action.min_iteration, maxIteration: action.max_iteration}})),
  on(actions.setPlotViewerScrollId, (state, action) => ({...state, plotViewerScrollId: action.scrollId})),
  on(actions.setViewerEndOfTime, (state, action) => ({...state, plotViewerEndOfTime: action.endOfTime})),
  on(actions.setViewerBeginningOfTime, (state, action) => ({...state, plotViewerBeginningOfTime: action.beginningOfTime})),
  on(actions.setExperimentSettings, (state, action) => {
    let newSettings: ExperimentSettings[];
    const changes = {...action.changes, lastModified: (new Date()).getTime()} as ExperimentSettings;
    const experimentExists = state.settingsList.find(setting => setting.id === action.id);
    const discardBefore = new Date();
    discardBefore.setMonth(discardBefore.getMonth() - 6);
    if (experimentExists) {
      newSettings = state.settingsList
        .filter(setting => discardBefore < new Date(setting.lastModified || 1648771200000))
        .map(setting => setting.id === action.id ? {...setting, ...changes} : setting);
    } else {
      newSettings = [
        ...state.settingsList.filter(setting => discardBefore < new Date(setting.lastModified || 1648771200000)),
        {id: action.id, ...changes}
      ];
    }
    return {...state, settingsList: newSettings};
  }),
  on(actions.resetExperimentMetrics, state => ({
    ...state,
    metricsMultiScalarsCharts: initialCommonExperimentOutputState.metricsMultiScalarsCharts,
    metricsHistogramCharts: initialCommonExperimentOutputState.metricsHistogramCharts,
    metricsPlotsCharts: initialCommonExperimentOutputState.metricsPlotsCharts,
    cachedAxisType: initialCommonExperimentOutputState.cachedAxisType,
    searchTerm: ''
  })),
  on(actions.setLogFilter, (state, action) => ({...state, logFilter: (action as ReturnType<typeof actions.setLogFilter>).filter})),
  on(actions.resetLogFilter, state => ({...state, logFilter: null})),
  on(actions.toggleSettings, state => ({...state, showSettings: !state.showSettings})),
  on(actions.setScalarsHoverMode, (state, action) => ({...state, scalarsHoverMode: action.hoverMode})),
  on(actions.setGraphsPerRow, (state, action) => ({...state, graphsPerRow: action.graphsPerRow})),
);
