import {createAction, props} from '@ngrx/store';
import {Task} from '~/business-logic/model/tasks/task';
import {TaskMetric} from '~/business-logic/model/events/taskMetric';
import {EventsDebugImagesResponse} from '~/business-logic/model/events/eventsDebugImagesResponse';

export const DEBUG_IMAGES_PREFIX = '[DEBUG IMAGES] ';


export const resetDebugImages = createAction(DEBUG_IMAGES_PREFIX + 'reset debug images');

export const setDebugImages = createAction(
  DEBUG_IMAGES_PREFIX + 'set debug images',
  props<{ res: EventsDebugImagesResponse; task: string }>()
);
export const getDebugImagesMetrics = createAction(
  DEBUG_IMAGES_PREFIX + 'get debug images metrics',
  props<{ tasks: string[]; autoRefresh?: boolean }>()
);

export const refreshDebugImagesMetrics = createAction(
  DEBUG_IMAGES_PREFIX + 'refresh_debug_images_metrics',
  props<{ tasks: string[]; autoRefresh?: boolean }>()
);

export const fetchExperiments = createAction(
  DEBUG_IMAGES_PREFIX + 'fetch experiments',
  props<{ tasks: string[] }>()
);

export const setExperimentsNames = createAction(
  DEBUG_IMAGES_PREFIX + 'set experiments names',
  props<{ tasks: Partial<Task>[] }>()
);

export const setMetrics = createAction(
  DEBUG_IMAGES_PREFIX + 'set debug images metrics',
  props<{ metrics: any[] }>()
);

export const setSelectedMetric = createAction(
  DEBUG_IMAGES_PREFIX + 'set debug images selected metric',
  props<{ payload: TaskMetric }>()
);

export const refreshMetric = createAction(
  DEBUG_IMAGES_PREFIX + 'refresh images selected metric',
  props<{ payload: TaskMetric; autoRefresh?: boolean }>()
);

export const getNextBatch= createAction(
  DEBUG_IMAGES_PREFIX + 'get next debug images batch',
  props<{ payload: TaskMetric }>()
);

export const getPreviousBatch= createAction(
  DEBUG_IMAGES_PREFIX + 'get previous debug images batch',
  props<{ payload: TaskMetric }>()
);

export const setTimeIsNow = createAction(
  DEBUG_IMAGES_PREFIX + 'set time is now',
  props<{ task: string; timeIsNow: boolean }>()
);
