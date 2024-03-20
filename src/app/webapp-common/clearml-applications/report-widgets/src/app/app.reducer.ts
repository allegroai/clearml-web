import {createFeature, createReducer, on} from '@ngrx/store';
import {reportsPlotlyReady, setNoPermissions, setParallelCoordinateExperiments, setPlotData, setSampleData, setSignIsNeeded, setSingleValues, setTaskData} from './app.actions';
import {DebugSample} from '@common/shared/debug-sample/debug-sample.reducer';
import {MetricsPlotEvent} from '~/business-logic/model/events/metricsPlotEvent';
import {MetricValueType, SelectedMetric} from '@common/experiments-compare/experiments-compare.constants';
import {Task} from '~/business-logic/model/tasks/task';
import {SingleValueTaskMetrics} from '~/business-logic/model/reports/singleValueTaskMetrics';
import {ReportsApiMultiplotsResponse} from '@common/constants';

export interface ParCoords {
  metric: SelectedMetric;
  valueType: MetricValueType;
  parameters: string[];
}


export const appFeatureKey = 'app';

export interface State {
  plotData: MetricsPlotEvent[] | ReportsApiMultiplotsResponse;
  sampleData: DebugSample;
  singleValuesData: SingleValueTaskMetrics[];
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

export const appFeature = createFeature({
  name: 'app',
  reducer: createReducer(
    initialState,
    on(reportsPlotlyReady, (state): State => ({...state, plotlyReady: true})),
    on(setPlotData, (state, action): State => ({...state, plotData: action.data as ReportsApiMultiplotsResponse})),
    on(setSampleData, (state, action): State => ({...state, sampleData: action.data})),
    on(setSingleValues, (state, action): State => ({...state, singleValuesData: action.data})),
    on(setParallelCoordinateExperiments, (state, action): State => ({...state, parallelCoordinateData: action.data})),
    on(setSignIsNeeded, (state): State => ({...state, signIsNeeded: true})),
    on(setNoPermissions, (state): State => ({...state, noPermissions: true})),
    on(setTaskData, (state, action): State => ({
        ...state, taskData:
          {appId: action.appId, sourceTasks: action.sourceTasks, sourceProject: action.sourceProject}
      })
    ),
  ),
});
