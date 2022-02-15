import {createAction, props} from '@ngrx/store';
import {Task} from '../../business-logic/model/tasks/task';
import {TaskMetric} from '../../business-logic/model/events/taskMetric';
import {EventsDebugImagesResponse} from '../../business-logic/model/events/eventsDebugImagesResponse';
import {EventsGetDebugImageIterationsResponse} from '../../business-logic/model/events/eventsGetDebugImageIterationsResponse';

export const DEBUG_IMAGES_PREFIX = 'DEBUG_IMAGES_';


export const resetDebugImages = createAction(DEBUG_IMAGES_PREFIX + 'RESET_DEBUG_IMAGES');

export const setDebugImages = createAction(
  DEBUG_IMAGES_PREFIX + 'SET_DEBUG_IMAGES',
  props<{ res: EventsDebugImagesResponse; task: string }>()
);
export const getDebugImagesMetrics = createAction(
  DEBUG_IMAGES_PREFIX + 'GET_DEBUG_IMAGES_METRICS',
  props<{ tasks: string[] }>()
);

export const refreshDebugImagesMetrics = createAction(
  DEBUG_IMAGES_PREFIX + 'REFRESH_DEBUG_IMAGES_METRICS',
  props<{ tasks: string[] }>()
);

export const fetchExperiments = createAction(
  DEBUG_IMAGES_PREFIX + 'FETCH_EXPERIMENTS',
  props<{ tasks: string[] }>()
);

export const setExperimentsNames = createAction(
  DEBUG_IMAGES_PREFIX + 'SET_EXPERIMENTS_NAMES',
  props<{ tasks: Partial<Task>[] }>()
);

export const setMetrics = createAction(
  DEBUG_IMAGES_PREFIX + 'SET_DEBUG_IMAGES_METRICS',
  props<{ metrics: any[] }>()
);

export const setSelectedMetric = createAction(
  DEBUG_IMAGES_PREFIX + 'SET_DEBUG_IMAGES_SELECTED_METRIC',
  props<{ payload: TaskMetric }>()
);

export const refreshMetric = createAction(
  DEBUG_IMAGES_PREFIX + 'REFRESH_IMAGES_SELECTED_METRIC',
  props<{ payload: TaskMetric }>()
);

export const getNextBatch= createAction(
  DEBUG_IMAGES_PREFIX + 'GET_NEXT_DEBUG_IMAGES_BATCH',
  props<{ payload: TaskMetric }>()
);

export const getPreviousBatch= createAction(
  DEBUG_IMAGES_PREFIX + 'GET_PREVIOUS_DEBUG_IMAGES_BATCH',
  props<{ payload: TaskMetric }>()
);

export const setTimeIsNow = createAction(
  DEBUG_IMAGES_PREFIX + 'SET_TIME_IS_NOW',
  props<{ task: string; timeIsNow: boolean }>()
);

export const setBeginningOfTime = createAction(
  DEBUG_IMAGES_PREFIX + 'SET_BEGINNING_OF_TIME',
  props<{ task: string; beginningOfTime: boolean }>()
);

export const getDebugImageSample = createAction(DEBUG_IMAGES_PREFIX + 'GET_DEBUG_IMAGES_FOR_ITERATION', props<{ task: string; metric: string; variant: string; iteration: number }>());
export const getNextDebugImageSample = createAction(DEBUG_IMAGES_PREFIX + 'GET_NEXT_DEBUG_IMAGE', props<{ task: string; navigateEarlier: boolean }>());
export const setCurrentDebugImage = createAction(DEBUG_IMAGES_PREFIX + 'SET_DEBUG_IMAGES_FOR_ITERATION', props<{ event: any }>());
export const setDebugImageViewerScrollId = createAction(DEBUG_IMAGES_PREFIX + 'SET_DEBUG_IMAGE_VIEWER_SCROLL_ID', props<{ scrollId: string }>());
export const setDebugImageIterations = createAction(DEBUG_IMAGES_PREFIX + 'SET_DEBUG_IMAGE_ITERATIONS', props<EventsGetDebugImageIterationsResponse>());
export const setDisplayerEndOfTime = createAction(DEBUG_IMAGES_PREFIX + 'SET_DISPLAYER_END_OF_TIME', props<{ endOfTime: boolean }>());
export const setDisplayerBeginningOfTime = createAction(DEBUG_IMAGES_PREFIX + 'SET_DISPLAYER_BEGINNING_OF_TIME', props<{ beginningOfTime: boolean }>());
export const resetDisplayer = createAction(DEBUG_IMAGES_PREFIX + 'RESET_DISPLAYER');


