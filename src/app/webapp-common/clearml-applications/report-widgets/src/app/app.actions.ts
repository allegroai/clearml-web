import {createAction, props} from '@ngrx/store';
import {ExtFrame} from '@common/shared/single-graph/plotly-graph-base';
import {DebugSample} from '@common/shared/debug-sample/debug-sample.reducer';
import {ReportsApiMultiplotsResponse} from '@common/clearml-applications/report-widgets/src/app/app.reducer';

export const getPlot = createAction('[App] getPlot', props<{
  tasks: string[];
  iterations: number[];
  metrics: string[];
  variants: string[];
  company: string;
}>());

export const getScalar = createAction('[App] getScalar', props<{
  tasks: string[];
  iterations: number[];
  metrics: string[];
  variants: string[];
  company: string;
}>());
export const getSample = createAction('[App] getSample', props<{
  tasks: string[];
  iterations: number[];
  metrics: string[];
  variants: string[];
  company: string;
}>());

export const setPlotData = createAction('[App] setPlot', props<{ data: ReportsApiMultiplotsResponse }>());
export const setScalarData = createAction('[App] setScalar', props<{ data: ExtFrame[] }>());
export const setSampleData = createAction('[App] setSample', props<{ data: DebugSample }>());

export const reportsPlotlyReady = createAction('[App] plotly ready');
export const setSignIsNeeded = createAction('[App] set sign is needed');
