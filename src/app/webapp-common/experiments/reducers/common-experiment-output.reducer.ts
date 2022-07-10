import {Task} from '~/business-logic/model/tasks/task';
import * as actions from '../actions/common-experiment-output.actions';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {sortBy, reverse} from 'lodash/fp';
import {LOG_BATCH_SIZE} from '../shared/common-experiments.const';
import {MetricsPlotEvent} from '~/business-logic/model/events/metricsPlotEvent';
import {ExtFrame} from '@common/shared/experiment-graphs/single-graph/plotly-graph-base';
import { EventsGetTaskSingleValueMetricsResponseValues } from '~/business-logic/model/events/eventsGetTaskSingleValueMetricsResponseValues';

export type GroupByCharts = 'metric' | 'none';

export const GroupByCharts = {
  Metric: 'metric' as GroupByCharts,
  None: 'none' as GroupByCharts
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

export interface SeriesData {
  name: string;
  x: number[];
  y: number[];
}

export interface HistogramCharts {
  [metric: string]: { [variant: string]: SeriesData };
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
  showSettings: boolean;
  minMaxIterations: { minIteration: number; maxIteration: number };
  currentPlotViewer: any;
  scalarSingleValue: Array<EventsGetTaskSingleValueMetricsResponseValues>;
  plotViewerScrollId: string;
  plotViewerEndOfTime: boolean;
  plotViewerBeginningOfTime: boolean;
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
  showSettings: false,
  currentPlotViewer: null,
  minMaxIterations: null,
  plotViewerScrollId: null,
  plotViewerEndOfTime: null,
  plotViewerBeginningOfTime: null
};

export function commonExperimentOutputReducer(state = initialCommonExperimentOutputState, action): CommonExperimentOutputState {
  switch (action.type) {
    case actions.RESET_OUTPUT:
      return {
        ...state,
        experimentLog: initialCommonExperimentOutputState.experimentLog,
        metricsMultiScalarsCharts: initialCommonExperimentOutputState.metricsMultiScalarsCharts,
        metricsHistogramCharts: initialCommonExperimentOutputState.metricsHistogramCharts,
        metricsPlotsCharts: initialCommonExperimentOutputState.metricsPlotsCharts
      };
    case actions.setGraphDisplayFullDetailsScalars.type:
      return {...state, fullScreenDetailedChart: action.data};
    case actions.setGraphDisplayFullDetailsScalarsIsOpen.type:
      return {
        ...state,
        isFullScreenOpen: action.isOpen,
        fullScreenDetailedChart: null,
        currentPlotViewer: null,
        plotViewerScrollId: null,
        minMaxIterations: null
      };
    case actions.getGraphDisplayFullDetailsScalars.type:
      return {...state, fetchingFullScreenData: true};
    case actions.setXtypeGraphDisplayFullDetailsScalars.type:
      return {...state, fullScreenXtype: action.xAxisType};
    case actions.mergeGraphDisplayFullDetailsScalars.type:
      return {
        ...state,
        fullScreenDetailedChart: {...state.fullScreenDetailedChart, data: action.data},
        fetchingFullScreenData: false
      };
    case actions.setExperimentLog.type: {
      const events = reverse(action.events);
      let currLog: any[];
      let atStart = false;
      if (action.direction) {
        if (action.refresh) {
          currLog = events;
        } else if (action.direction === 'prev') {
          if (action.events < LOG_BATCH_SIZE) {
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
        beginningOfLog: atStart
      };
    }
    case actions.SET_EXPERIMENT_METRICS_SEARCH_TERM:
      return {...state, searchTerm: action.payload.searchTerm};
    case actions.SET_EXPERIMENT_HISTOGRAM:
      return {...state, metricsHistogramCharts: action.payload, cachedAxisType: action.axisType};
    case actions.SET_EXPERIMENT_PLOTS:
      return {...state, metricsPlotsCharts: action.payload};
    case actions.setCurrentPlot.type:
      return {...state, currentPlotViewer: action.event};
    case actions.setExperimentScalarSingleValue.type:
      return {...state, scalarSingleValue: action.values};
    case actions.setPlotIterations.type:
      return {...state, minMaxIterations: {minIteration: action.min_iteration, maxIteration: action.max_iteration}};
    case actions.setPlotViewerScrollId.type:
      return {...state, plotViewerScrollId: action.scrollId};
    case actions.setViewerEndOfTime.type:
      return {...state, plotViewerEndOfTime: action.endOfTime};
    case actions.setViewerBeginningOfTime.type:
      return {...state, plotViewerBeginningOfTime: action.beginningOfTime};
    case actions.UPDATE_EXPERIMENT_SETTINGS: {
      let newSettings: ExperimentSettings[];
      const changes = {...action.payload.changes, lastModified: (new Date()).getTime()} as ExperimentSettings;
      const experimentExists = state.settingsList.find(setting => setting.id === action.payload.id);
      const discardBefore = new Date();
      discardBefore.setMonth(discardBefore.getMonth() - 6);
      if (experimentExists) {
        newSettings = state.settingsList
          .filter(setting => discardBefore < new Date(setting.lastModified || 1648771200000))
          .map(setting => setting.id === action.payload.id ? {...setting, ...changes} : setting);
      } else {
        newSettings = [
          ...state.settingsList.filter(setting => discardBefore < new Date(setting.lastModified || 1648771200000)),
          {id: action.payload.id, ...changes}
        ];
      }
      return {...state, settingsList: newSettings};
    }
    case actions.RESET_EXPERIMENT_METRICS:
      return {
        ...state,
        metricsMultiScalarsCharts: initialCommonExperimentOutputState.metricsMultiScalarsCharts,
        metricsHistogramCharts: initialCommonExperimentOutputState.metricsHistogramCharts,
        metricsPlotsCharts: initialCommonExperimentOutputState.metricsPlotsCharts,
        cachedAxisType: initialCommonExperimentOutputState.cachedAxisType,
        searchTerm: ''
      };
    case actions.SET_LOG_FILTER:
      return {...state, logFilter: (action as actions.SetLogFilter).filterString};
    case actions.RESET_LOG_FILTER:
      return {...state, logFilter: null};
    case actions.toggleSettings.type:
      return {...state, showSettings: !state.showSettings};
    default:
      return state;
  }
}
