import {createReducer, createSelector, on} from '@ngrx/store';
import {reportsPlotlyReady, setNoPermissions, setParallelCoordinateExperiments, setPlotData, setSampleData, setSignIsNeeded, setSingleValues, setTaskData} from './app.actions';
import {DebugSample} from '@common/shared/debug-sample/debug-sample.reducer';
import {MetricsPlotEvent} from '~/business-logic/model/events/metricsPlotEvent';
import {MetricValueType, SelectedMetric} from '@common/experiments-compare/experiments-compare.constants';
import {Task} from '~/business-logic/model/tasks/task';
import {  SingleValueTaskMetrics} from '~/business-logic/model/reports/singleValueTaskMetrics';

export interface ParCoords {
  metric: SelectedMetric;
  valueType: MetricValueType;
  parameters: string[];
}

export interface ReportsApiMultiplotsResponse {
  [metric: string]: {
    [variant: string]: {
      [expId: string]: {
        [iteration: string]: {
          name: string;
          plots: Array<MetricsPlotEvent>;
        };
      };
    };
  };
}


export const appFeatureKey = 'app';

export interface State {
  plotData: MetricsPlotEvent[] | ReportsApiMultiplotsResponse;
  sampleData: DebugSample;
  singleValuesData: SingleValueTaskMetrics;
  parallelCoordinateData: Task[];
  scaleFactor: number;
  plotlyReady: boolean;
  signIsNeeded: boolean;
  noPermissions: boolean;
  taskData: {
    sourceProject: string;
    sourceTasks: string[];
    appId: string;
  };
}

export const initialState: State = {
  plotData: null,
  sampleData: null,
  singleValuesData: null,
  parallelCoordinateData: null,
  scaleFactor: 100,
  plotlyReady: false,
  signIsNeeded: false,
  noPermissions: false,
  taskData: null
};

export const appReducer = createReducer(
  initialState,
  on(reportsPlotlyReady, (state) => ({...state, plotlyReady: true})),
  on(setPlotData, (state, action) => ({...state, plotData: action.data as ReportsApiMultiplotsResponse})),
  on(setSampleData, (state, action) => ({...state, sampleData: action.data})),
  on(setSingleValues, (state, action) => ({...state, singleValuesData: action.data})),
  on(setParallelCoordinateExperiments, (state, action) => ({...state, parallelCoordinateData: action.data})),
  on(setSignIsNeeded, (state) => ({...state, signIsNeeded: true})),
  on(setNoPermissions, (state) => ({...state, noPermissions: true})),
  on(setTaskData, (state, action) => ({...state, taskData:
      {appId: action.appId, sourceTasks: action.sourceTasks, sourceProject: action.sourceProject}})
  ),
);

export const selectFeature = state => state.appReducer as State;

export const selectScaleFactor = createSelector(selectFeature, state => state.scaleFactor);
export const selectReportsPlotlyReady = createSelector(selectFeature, state => state.plotlyReady);
export const selectPlotData = createSelector(selectFeature, state => state.plotData);
export const selectSampleData = createSelector(selectFeature, state => state.sampleData);
export const selectSingleValuesData = createSelector(selectFeature, state => state.singleValuesData);
export const selectParallelCoordinateExperiments = createSelector(selectFeature, state => state.parallelCoordinateData);
export const selectSignIsNeeded = createSelector(selectFeature, state => state.signIsNeeded);
export const selectNoPermissions = createSelector(selectFeature, state => state.noPermissions);
export const selectTaskData = createSelector(selectFeature, (state): {
  sourceProject: string;
  sourceTasks: string[];
  appId: string;
} => state.taskData);
