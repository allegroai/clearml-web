import {Task} from '../../../business-logic/model/tasks/task';
import * as actions from '../actions/common-experiment-output.actions';
import {ScalarKeyEnum} from '../../../business-logic/model/events/scalarKeyEnum';
import {sortBy, reverse} from 'lodash/fp';
import {LOG_BATCH_SIZE} from '../shared/common-experiments.const';
import {MetricsPlotEvent} from '../../../business-logic/model/events/metricsPlotEvent';

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
  cachedAxisType: ScalarKeyEnum;
  metricsPlotsCharts: MetricsPlotEvent[];
  experimentLog: Log[];
  totalLogLines: number;
  beginningOfLog: boolean;
  settingsList: Array<IExperimentSettings>;
  searchTerm: string;
  logFilter: string;
  showSettings: boolean;
}

export interface IExperimentSettings {
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
}

export const initialCommonExperimentOutputState: CommonExperimentOutputState = {
  metricsMultiScalarsCharts: null,
  metricsHistogramCharts: null,
  cachedAxisType: null,
  metricsPlotsCharts: null,
  experimentLog: [],
  totalLogLines: null,
  beginningOfLog: false,
  settingsList: [],
  searchTerm: '',
  logFilter: null,
  showSettings: false
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
          currLog = sortBy('timestamp', state.experimentLog.concat(events));
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
    case actions.UPDATE_EXPERIMENT_SETTINGS: {
      let newSettings;
      const experimentExists = state.settingsList.find((setting) => setting.id === action.payload.id);
      if (experimentExists) {
        newSettings = state.settingsList.map(setting => setting.id === action.payload.id ? {...setting, ...action.payload.changes} : setting);
      } else {
        newSettings = state.settingsList.slice();
        newSettings.push({id: action.payload.id, ...action.payload.changes});
      }
      return {...state, settingsList: newSettings};
    }
    case actions.RESET_EXPERIMENT_METRICS:
      return {
        ...state,
        metricsMultiScalarsCharts: initialCommonExperimentOutputState.metricsMultiScalarsCharts,
        metricsHistogramCharts: initialCommonExperimentOutputState.metricsHistogramCharts,
        metricsPlotsCharts: initialCommonExperimentOutputState.metricsPlotsCharts,
        cachedAxisType: initialCommonExperimentOutputState.cachedAxisType
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
