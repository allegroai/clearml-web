import {createReducer, createSelector, on} from '@ngrx/store';
import {reportsPlotlyReady, setPlotData, setSampleData, setSignIsNeeded} from './app.actions';
import {DebugSample} from '@common/shared/debug-sample/debug-sample.reducer';
import {MetricsPlotEvent} from '~/business-logic/model/events/metricsPlotEvent';

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
  scaleFactor: number;
  plotlyReady: boolean;
  signIsNeeded: boolean;
}

export const initialState: State = {
  plotData: null,
  sampleData: null,
  scaleFactor: 100,
  plotlyReady: false,
  signIsNeeded: false
};

export const appReducer = createReducer(
  initialState,
  on(reportsPlotlyReady, (state) => ({...state, plotlyReady: true})),
  on(setPlotData, (state, action) => ({...state, plotData: action.data as ReportsApiMultiplotsResponse})),
  on(setSampleData, (state, action) => ({...state, sampleData: action.data})),
  on(setSignIsNeeded, (state) => {
    debugger
    return ({...state, signIsNeeded: true})
  }),
);

export const selectFeature = state => state.appReducer as State;

export const selectScaleFactor = createSelector(selectFeature, state => state.scaleFactor);
export const selectReportsPlotlyReady = createSelector(selectFeature, state => state.plotlyReady);
export const selectPlotData = createSelector(selectFeature, state => state.plotData);
export const selectSampleData = createSelector(selectFeature, state => state.sampleData);
export const selectSignIsNeeded = createSelector(selectFeature, state => state.signIsNeeded);
