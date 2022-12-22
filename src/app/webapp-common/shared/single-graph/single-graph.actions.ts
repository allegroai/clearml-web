import {createAction, props} from '@ngrx/store';
import {EventsScalarMetricsIterRawRequest} from '~/business-logic/model/events/eventsScalarMetricsIterRawRequest';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {PlotSampleResponse} from '~/business-logic/model/events/plotSampleResponse';

export const getPlotSample = createAction(
  '[SingleGraph] GET_PLOT_FOR_ITERATION',
  props<{ task: string; metric: string; iteration: number }>()
);

export const getGraphDisplayFullDetailsScalars = createAction(
  '[SingleGraph] GET_FULL_DETAILS_SCALAR',
  props<EventsScalarMetricsIterRawRequest>()
);
export const convertXtypeGraphDisplayFullDetailsScalars = createAction(
  '[SingleGraph] convertXtype_FULL_DETAILS_SCALAR',
  props<{ xAxisType: ScalarKeyEnum }>()
);
export const setXtypeGraphDisplayFullDetailsScalars = createAction(
  '[SingleGraph] SET_Xtype_FULL_DETAILS_SCALAR',
  props<{ xAxisType: ScalarKeyEnum }>()
);
export const setGraphDisplayFullDetailsScalars = createAction(
  '[SingleGraph] SET_FULL_DETAILS_SCALAR',
  props<{ data }>()
);
export const setGraphDisplayFullDetailsScalarsIsOpen = createAction(
  '[SingleGraph] SET_FULL_DETAILS_SCALAR_IS_OPEN',
  props<{ isOpen: boolean }>()
);
export const mergeGraphDisplayFullDetailsScalars = createAction(
  '[SingleGraph] MERGE_FULL_DETAILS_SCALAR',
  props<{ data }>()
);

export const getNextPlotSample = createAction(
  '[SingleGraph] GET_NEXT_PLOT',
  props<{ task: string; navigateEarlier: boolean; iteration?: boolean }>());

export const setPlotIterations = createAction('[SingleGraph] SET_PLOT_ITERATIONS', props<PlotSampleResponse>());
export const setPlotViewerScrollId = createAction('[SingleGraph] SET_PLOT_VIEWER_SCROLL_ID', props<{ scrollId: string }>());
export const setViewerEndOfTime = createAction('[SingleGraph] SET_VIEWER_END_OF_TIME', props<{ endOfTime: boolean }>());
export const setViewerBeginningOfTime = createAction('[SingleGraph] SET_VIEWER_BEGINNING_OF_TIME', props<{ beginningOfTime: boolean }>());
export const resetViewer = createAction('[SingleGraph] RESET_VIEWER');
export const setCurrentPlot = createAction('[SingleGraph] SET_PLOT_FOR_ITERATION', props<{ event: any }>());
