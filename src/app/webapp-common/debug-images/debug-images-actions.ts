import {Action, createAction, props} from '@ngrx/store';
import {IDebugImagesState} from './debug-images-reducer';
import {Task} from '../../business-logic/model/tasks/task';
import {TaskMetric} from '../../business-logic/model/events/taskMetric';
import {EventsDebugImagesResponse} from '../../business-logic/model/events/eventsDebugImagesResponse';
import {EXPERIMENTS_PREFIX} from "../experiments/actions/common-experiments-view.actions";
import {EventsGetDebugImageIterationsResponse} from "../../business-logic/model/events/eventsGetDebugImageIterationsResponse";

export const DEBUG_IMAGES_PREFIX = 'DEBUG_IMAGES_';

// COMMANDS:

export const SET_DEBUG_IMAGES = DEBUG_IMAGES_PREFIX + 'SET_DEBUG_IMAGES';
export const RESET_DEBUG_IMAGES = DEBUG_IMAGES_PREFIX + 'RESET_DEBUG_IMAGES';
export const SET_EXPERIMENTS_NAMES = DEBUG_IMAGES_PREFIX + 'SET_EXPERIMENTS_NAMES';
export const SET_DEBUG_IMAGES_METRICS = DEBUG_IMAGES_PREFIX + 'SET_DEBUG_IMAGES_METRICS';
export const SET_DEBUG_IMAGES_SELECTED_METRIC = DEBUG_IMAGES_PREFIX + 'SET_DEBUG_IMAGES_SELECTED_METRIC';
export const REFRESH_IMAGES_SELECTED_METRIC = DEBUG_IMAGES_PREFIX + 'REFRESH_IMAGES_SELECTED_METRIC';
export const GET_NEXT_DEBUG_IMAGES_BATCH = DEBUG_IMAGES_PREFIX + 'GET_NEXT_DEBUG_IMAGES_BATCH';
export const GET_PREVIOUS_DEBUG_IMAGES_BATCH = DEBUG_IMAGES_PREFIX + 'GET_PREVIOUS_DEBUG_IMAGES_BATCH';
export const SET_TIME_IS_NOW = DEBUG_IMAGES_PREFIX + 'SET_TIME_IS_NOW ';
export const SET_BEGINNING_OF_TIME = DEBUG_IMAGES_PREFIX + 'SET_BEGINNING_OF_TIME ';

// EVENTS:

export const SET_DEBUG_IMAGES_SETTINGS = DEBUG_IMAGES_PREFIX + 'SET_DEBUG_IMAGES_SETTINGS';
export const DEBUG_IMAGES_REQUESTED = DEBUG_IMAGES_PREFIX + 'DEBUG_IMAGES_REQUESTED';
export const GET_DEBUG_IMAGES_METRICS = DEBUG_IMAGES_PREFIX + 'GET_DEBUG_IMAGES_METRICS';
export const REFRESH_DEBUG_IMAGES_METRICS = DEBUG_IMAGES_PREFIX + 'REFRESH_DEBUG_IMAGES_METRICS';
export const FETCH_EXPERIMENTS = DEBUG_IMAGES_PREFIX + 'FETCH_EXPERIMENTS';


export class ResetDebugImages implements Action {
  readonly type = RESET_DEBUG_IMAGES;
}

export class SetDebugImages implements Action {
  readonly type = SET_DEBUG_IMAGES;

  constructor(public payload: { res: EventsDebugImagesResponse; task: string }) {
  }
}

export class DebugImagesRequested implements Action {
  readonly type = DEBUG_IMAGES_REQUESTED;

  constructor(public payload: {
    ids: Array<Task['id']>;
    iterationsToFetch: number;
    autoRefresh?: boolean;
  }) {
  }
}

export class GetDebugImagesMetrics implements Action {
  readonly type = GET_DEBUG_IMAGES_METRICS;

  constructor(public payload: {
    tasks: Array<Task['id']>;
  }) {
  }
}

export class RefreshDebugImagesMetrics implements Action {
  readonly type = REFRESH_DEBUG_IMAGES_METRICS;

  constructor(public payload: {
    tasks: Array<Task['id']>;
  }) {
  }
}

export class FetchExperiments implements Action {
  readonly type = FETCH_EXPERIMENTS;

  constructor(public payload: Array<string>) {
  }
}

export class SetExperimentsNames implements Action {
  readonly type = SET_EXPERIMENTS_NAMES;

  constructor(public payload: { tasks: Array<Partial<Task>> }) {
  }
}

export class SetMetrics implements Action {
  readonly type = SET_DEBUG_IMAGES_METRICS;

  constructor(public payload: { metrics: Array<any> }) {
  }
}

export class SelectMetric implements Action {
  readonly type = SET_DEBUG_IMAGES_SELECTED_METRIC;

  constructor(public payload: TaskMetric) {
  }
}

export class RefreshMetric implements Action {
  readonly type = REFRESH_IMAGES_SELECTED_METRIC;

  constructor(public payload: TaskMetric) {
  }
}

export class GetNextBatch implements Action {
  readonly type = GET_NEXT_DEBUG_IMAGES_BATCH;

  constructor(public payload: TaskMetric) {
  }
}

export class GetPreviousBatch implements Action {
  readonly type = GET_PREVIOUS_DEBUG_IMAGES_BATCH;

  constructor(public payload: TaskMetric) {
  }
}

export class SetTimeIsNow implements Action {
  readonly type = SET_TIME_IS_NOW;

  constructor(public payload: { task: string; timeIsNow: boolean }) {
  }
}

export class SetBeginningOfTime implements Action {
  readonly type = SET_BEGINNING_OF_TIME;

  constructor(public payload: { task: string; beginningOfTime: boolean }) {
  }
}


export class SetDebugImagesSettings implements Action {
  readonly type = SET_DEBUG_IMAGES_SETTINGS;

  constructor(public payload: { id: string; changes: Partial<IDebugImagesState> }) {
  }
}

export const getDebugImageSample = createAction(DEBUG_IMAGES_PREFIX + 'GET_DEBUG_IMAGES_FOR_ITERATION', props<{ task: string; metric: string; variant: string; iteration: number }>());
export const getNextDebugImageSample = createAction(DEBUG_IMAGES_PREFIX + 'GET_NEXT_DEBUG_IMAGE', props<{ task: string; navigateEarlier: boolean }>());
export const setCurrentDebugImage = createAction(DEBUG_IMAGES_PREFIX + 'SET_DEBUG_IMAGES_FOR_ITERATION', props<{ event: any }>());
export const setDebugImageViewerScrollId = createAction(DEBUG_IMAGES_PREFIX + 'SET_DEBUG_IMAGE_VIEWER_SCROLL_ID', props<{ scrollId: string }>());
export const setDebugImageIterations = createAction(DEBUG_IMAGES_PREFIX + 'SET_DEBUG_IMAGE_ITERATIONS', props<EventsGetDebugImageIterationsResponse>());
export const setDisplayerEndOfTime = createAction(DEBUG_IMAGES_PREFIX + 'SET_DISPLAYER_END_OF_TIME', props<{ endOfTime: boolean }>());
export const setDisplayerBeginningOfTime = createAction(DEBUG_IMAGES_PREFIX + 'SET_DISPLAYER_BEGINNING_OF_TIME', props<{ beginningOfTime: boolean }>());
export const resetDisplayer = createAction(DEBUG_IMAGES_PREFIX + 'RESET_DISPLAYER');


