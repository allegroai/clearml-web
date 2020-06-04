import {Task} from '../../../business-logic/model/tasks/task';
import * as actions from '../actions/common-experiment-output.actions';
import {ScalarKeyEnum} from '../../../business-logic/model/events/scalarKeyEnum';
import {last, getOr} from 'lodash/fp';

export interface CommonExperimentOutputState {
  metricsMultiScalarsCharts: any;
  metricsHistogramCharts: any;
  metricsPlotsCharts: any;
  experimentLog: Array<any>;
  logScrollID: string;
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
}

export const initialCommonExperimentOutputState: CommonExperimentOutputState = {
  metricsMultiScalarsCharts: null,
  metricsHistogramCharts   : null,
  metricsPlotsCharts       : null,
  experimentLog            : null,
  logScrollID              : null,
  settingsList             : [],
  searchTerm               : '',
  logFilter                : null,
  showSettings: false
};

export function commonExperimentOutputReducer(state = initialCommonExperimentOutputState, action): CommonExperimentOutputState {
  switch (action.type) {
    case actions.RESET_OUTPUT:
      return {...state,
        experimentLog: initialCommonExperimentOutputState.experimentLog,
        logScrollID: initialCommonExperimentOutputState.logScrollID,
        metricsMultiScalarsCharts: initialCommonExperimentOutputState.metricsMultiScalarsCharts,
        metricsHistogramCharts: initialCommonExperimentOutputState.metricsHistogramCharts,
        metricsPlotsCharts: initialCommonExperimentOutputState.metricsPlotsCharts
      };
    case actions.SET_EXPERIMENT_LOG:
      const events = (<actions.SetExperimentLog>action).events;
      let currLog: any[];
      let lastTimestamp: number;
      if (state.experimentLog && state.experimentLog.length > 0 &&
          last(state.experimentLog).timestamp >= getOr(9999999999999, '[0].timestamp', events)) {
        currLog = state.experimentLog;
        lastTimestamp = last(currLog).timestamp
      } else {
        currLog = [];
        lastTimestamp = 0;
      }
      return {...state,
        experimentLog: currLog.concat(events.filter(event => event.timestamp > lastTimestamp)),
        logScrollID: (<actions.SetExperimentLog>action).scrollID
      };
    case actions.SET_EXPERIMENT_METRICS_SEARCH_TERM:
      return {...state, searchTerm: action.payload.searchTerm};
    case actions.SET_EXPERIMENT_HISTOGRAM:
      return {...state, metricsHistogramCharts: action.payload};
    case actions.SET_EXPERIMENT_PLOTS:
      return {...state, metricsPlotsCharts: action.payload};
    case actions.UPDATE_EXPERIMENT_SETTINGS:
      let newSettings;
      const isExperimentExists = state.settingsList.find((setting) => setting.id === action.payload.id);
      if (isExperimentExists) {
        newSettings = state.settingsList.map(setting => setting.id === action.payload.id ? {...setting, ...action.payload.changes} : setting);
      } else {
        newSettings = state.settingsList.slice();
        newSettings.push({id: action.payload.id, ...action.payload.changes});
      }
      return {...state, settingsList: newSettings};
    case actions.RESET_EXPERIMENT_METRICS:
      return {...state, metricsMultiScalarsCharts: null, metricsHistogramCharts: null, metricsPlotsCharts: null};
    case actions.SET_LOG_FILTER:
      return {...state, logFilter: (<actions.SetLogFilter>action).filterString};
    case actions.RESET_LOG_FILTER:
      return {...state, logFilter: null};
    case actions.toggleSettings.type:
      return {...state, showSettings: !state.showSettings};
    default:
      return state;
  }
}
