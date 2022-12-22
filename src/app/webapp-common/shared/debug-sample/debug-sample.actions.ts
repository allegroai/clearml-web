import { createAction, props } from '@ngrx/store';
import {EventsGetDebugImageIterationsResponse} from '~/business-logic/model/events/eventsGetDebugImageIterationsResponse';

export const debugSampleDebugSamples = createAction(
  '[DebugSample] DebugSample DebugSamples'
);

export const setBeginningOfTime = createAction(
  '[DebugSample] SET_BEGINNING_OF_TIME',
  props<{ task: string; beginningOfTime: boolean }>()
);

export const getDebugImageSample = createAction('[DebugSample] GET_DEBUG_IMAGES_FOR_ITERATION', props<{ task: string; metric: string; variant: string; iteration: number; isAllMetrics: boolean }>());
export const getNextDebugImageSample = createAction(
  '[DebugSample] GET_NEXT_DEBUG_IMAGE',
  props<{ task: string; navigateEarlier: boolean; iteration?: boolean }>()
);
export const setDebugImageViewerScrollId = createAction('[DebugSample] SET_DEBUG_IMAGE_VIEWER_SCROLL_ID', props<{ scrollId: string }>());
export const setViewerEndOfTime = createAction('[DebugSample] SET_VIEWER_END_OF_TIME', props<{ endOfTime: boolean }>());
export const setViewerBeginningOfTime = createAction('[DebugSample] SET_VIEWER_BEGINNING_OF_TIME', props<{ beginningOfTime: boolean }>());
export const setDebugImageIterations = createAction('[DebugSample] SET_DEBUG_IMAGE_ITERATIONS', props<EventsGetDebugImageIterationsResponse>());
export const setCurrentDebugImage = createAction('[DebugSample] SET_DEBUG_IMAGES_FOR_ITERATION', props<{ event: any }>());
export const resetViewer = createAction('[DebugSample] RESET_VIEWER');
