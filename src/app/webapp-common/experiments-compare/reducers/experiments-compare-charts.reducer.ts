import {createReducer, on} from '@ngrx/store';
import {Task} from '~/business-logic/model/tasks/task';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import * as actions from '../actions/experiments-compare-charts.actions';
import {ExperimentSettings} from '../../experiments/reducers/common-experiment-output.reducer';
import {IMultiplot} from '@common/tasks/tasks.utils';

export type MetricValueType = 'min_value' | 'max_value' | 'value';

export interface SelectedMetric {
  name: string;
  path: string;
}

export interface GroupedHyperParams {
  [section: string]: HyperParams;
}

export interface HyperParams {
  [name: string]: boolean;
}

export interface VariantOption {
  name: string;
  value: SelectedMetric;
}

export interface MetricOption {
  metricName: string;
  variants: VariantOption[];
}

export interface IExperimentCompareChartsState {
  metricsMultiScalarsCharts: any;
  metricsHistogramCharts: any;
  cachedAxisType: ScalarKeyEnum;
  metricsPlotsCharts: IMultiplot;
  settingsList: Array<ExperimentCompareSettings>;
  searchTerm: string;
  showSettingsBar: boolean;
  selectedExperiments: Array<string>;
}

export interface ExperimentCompareSettings extends Omit<ExperimentSettings, 'id' | 'selectedMetric'> {
  id: Task['id'][];
  selectedMetric: SelectedMetric;
}

export const initialState: IExperimentCompareChartsState = {
  metricsMultiScalarsCharts: null,
  metricsHistogramCharts: null,
  cachedAxisType: null,
  metricsPlotsCharts: null,
  settingsList: [],  // TODO, Make this an object with ID's as key YK
  searchTerm: '',
  showSettingsBar: false,
  selectedExperiments: [], // TODO: Move this to the general compare reducer
};

export const experimentsCompareChartsReducer = createReducer(
  initialState,
  on(actions.setSelectedExperiments, (state, action) => ({...state, selectedExperiments: action.selectedExperiments})),
  on(actions.setExperimentMetricsSearchTerm, (state, action) => ({...state, searchTerm: action.searchTerm})),
  on(actions.setExperimentHistogram, (state, action) => ({...state, metricsHistogramCharts: action.payload, cachedAxisType: action.axisType})),
  on(actions.setAxisCache, (state, action) => ({...state, cachedAxisType: (action as ReturnType<typeof actions.setAxisCache>).axis})),
  on(actions.setExperimentPlots, (state, action) => ({...state, metricsPlotsCharts: action.plots})),
  on(actions.setExperimentSettings, (state, action) => {
      let newSettings: ExperimentCompareSettings[];
      const changes = {...action.changes, id: action.id, lastModified: (new Date()).getTime()} as ExperimentCompareSettings;
      const ids = action.id.join();
      const experimentExists = state.settingsList.find((setting) => setting.id.join() === ids);
      const discardBefore = new Date();
      discardBefore.setMonth(discardBefore.getMonth() - 6);
      if (experimentExists) {
        newSettings = state.settingsList
          .filter(setting => discardBefore < new Date(setting.lastModified || 1648771200000))
          .map(setting => setting.id.join() === ids ? {...setting, ...changes} : setting);
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
    metricsMultiScalarsCharts: initialState.metricsMultiScalarsCharts,
    metricsHistogramCharts: initialState.metricsHistogramCharts,
    metricsPlotsCharts: initialState.metricsPlotsCharts,
    cachedAxisType: initialState.cachedAxisType
  })),
);
