import {createAction, props} from '@ngrx/store';
import {Task} from '~/business-logic/model/tasks/task';
import {TaskMetric} from '~/business-logic/model/events/taskMetric';
import {EventsDebugImagesResponse} from '~/business-logic/model/events/eventsDebugImagesResponse';

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
  props<{ tasks: string[]; autoRefresh?: boolean }>()
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
  props<{ payload: TaskMetric; autoRefresh?: boolean }>()
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



