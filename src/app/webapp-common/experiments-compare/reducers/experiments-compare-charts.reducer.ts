import {createReducer, on} from '@ngrx/store';
import {Task} from '~/business-logic/model/tasks/task';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import * as actions from '../actions/experiments-compare-charts.actions';
import {ExperimentSettings} from '../../experiments/reducers/experiment-output.reducer';
import {IMultiplot} from '@common/tasks/tasks.utils';
import {SelectedMetric} from '@common/experiments-compare/experiments-compare.constants';
import {EventsGetTaskSingleValueMetricsResponseTasks} from '~/business-logic/model/events/eventsGetTaskSingleValueMetricsResponseTasks';
import {ChartHoverModeEnum} from "@common/experiments/shared/common-experiments.const";

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
  multiSingleValues: EventsGetTaskSingleValueMetricsResponseTasks[];
  cachedAxisType: ScalarKeyEnum;
  metricsPlotsCharts: IMultiplot;
  settingsList: Array<ExperimentCompareSettings>;
  searchTerm: string;
  showSettingsBar: boolean;
  selectedExperiments: Array<string>;
  globalLegendData: {name: string, tags: string[], systemTags: string[], id: string, project: {id: string}}[]
  scalarsHoverMode: ChartHoverModeEnum
}

export interface ExperimentCompareSettings extends Omit<ExperimentSettings, 'id' | 'selectedMetric'> {
  id: Task['id'][];
  selectedMetric: SelectedMetric;
}

export const initialState: IExperimentCompareChartsState = {
  metricsMultiScalarsCharts: null,
  metricsHistogramCharts: null,
  multiSingleValues: null,
  cachedAxisType: null,
  metricsPlotsCharts: null,
  settingsList: [],  // TODO, Make this an object with ID's as key YK
  searchTerm: '',
  showSettingsBar: false,
  selectedExperiments: [], // TODO: Move this to the general compare reducer
  globalLegendData: null,
  scalarsHoverMode: "x"
};

export const experimentsCompareChartsReducer = createReducer(
  initialState,
  on(actions.setSelectedExperiments, (state, action) => ({...state, selectedExperiments: [...action.selectedExperiments].sort()})),
  on(actions.setExperimentMetricsSearchTerm, (state, action) => ({...state, searchTerm: action.searchTerm})),
  on(actions.setExperimentHistogram, (state, action) => ({...state, metricsHistogramCharts: action.payload, cachedAxisType: action.axisType})),
  on(actions.setExperimentMultiScalarSingleValue, (state, action) => ({...state, multiSingleValues: action.tasks})),
  on(actions.setAxisCache, (state, action) => ({...state, cachedAxisType: (action as ReturnType<typeof actions.setAxisCache>).axis})),
  on(actions.setExperimentPlots, (state, action) => ({...state, metricsPlotsCharts: action.plots})),
  on(actions.setExperimentSettings, (state, action) => {
      let newSettings: ExperimentCompareSettings[];
      const sortedIds = [...(action.id ?? [])].sort();
      const changes = {...action.changes, id: sortedIds, lastModified: (new Date()).getTime()} as ExperimentCompareSettings;
      const ids = sortedIds.join();
      const experimentExists = state.settingsList.find((setting) => setting.id?.join() === ids);
      const discardBefore = new Date();
      discardBefore.setMonth(discardBefore.getMonth() - 6);
      if (experimentExists) {
        newSettings = state.settingsList
          .filter(setting => discardBefore < new Date(setting.lastModified || 1648771200000))
          .map(setting => setting.id?.join() === ids ? {...setting, ...changes} : setting);
      } else {
        newSettings = [
          ...state.settingsList.filter(setting => discardBefore < new Date(setting.lastModified || 1648771200000)),
          {id: sortedIds, ...changes}
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
  on(actions.setGlobalLegendData, (state, action) => ({
    ...state,
    globalLegendData: action.data
  })),
  on(actions.setScalarsHoverMode, (state, action) => ({...state, scalarsHoverMode: action.hoverMode})),

);
