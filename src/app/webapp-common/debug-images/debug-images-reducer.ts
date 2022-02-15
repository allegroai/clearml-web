import {
  fetchExperiments,
  getDebugImagesMetrics,
  resetDebugImages,
  resetDisplayer,
  setBeginningOfTime,
  setCurrentDebugImage,
  setDebugImageIterations,
  setDebugImages,
  setDebugImageViewerScrollId,
  setDisplayerBeginningOfTime,
  setDisplayerEndOfTime, setExperimentsNames, setMetrics, setSelectedMetric, setTimeIsNow
} from './debug-images-actions';
import {Task} from '../../business-logic/model/tasks/task';
import {createFeatureSelector, createReducer, createSelector, on} from '@ngrx/store';
import {omit} from 'lodash/fp';
import {EventsGetDebugImageIterationsResponse} from '../../business-logic/model/events/eventsGetDebugImageIterationsResponse';
import {EventsDebugImagesResponse} from '../../business-logic/model/events/eventsDebugImagesResponse';


export interface IDebugImagesState {
  debugImages: {[taskId: string]: EventsDebugImagesResponse};
  settingsList: Array<IDebugImagesSettings>;
  tasks: Array<Partial<Task>>;
  optionalMetrics: Array<ITaskOptionalMetrics>;
  searchTerm: string;
  scrollId: any;
  imageDisplayerScrollId: string;
  imageDisplayerBeginningOfTime: boolean;
  imageDisplayerEndOfTime: boolean;
  noMore: boolean;
  selectedMetric: any;
  timeIsNow: any;
  beginningOfTime: any;
  minMaxIterations: EventsGetDebugImageIterationsResponse;
  currentImageViewerDebugImage: any;
}

export interface IDebugImagesSettings {
  id: Task['id'];
  selectedDebugImages: string;
}

export interface ITaskOptionalMetrics {
  task: string;
  metrics: Array<string>;
}

export const initialState: IDebugImagesState = {
    debugImages: {},
    settingsList: [],
    searchTerm: '',
    tasks: [],
    optionalMetrics: [],
    scrollId: {},
    imageDisplayerScrollId: null,
    imageDisplayerBeginningOfTime: null,
    imageDisplayerEndOfTime: null,
    noMore: true,
    selectedMetric: null,
    timeIsNow: {},
    beginningOfTime: {},
    minMaxIterations: {},
    currentImageViewerDebugImage: null
  }
;

export const debugImages = createFeatureSelector<IDebugImagesState>('debugImages');
export const selectDebugImages = createSelector(debugImages, (state) => state.debugImages);
export const selectTaskNames = createSelector(debugImages, (state) => state.tasks);
export const selectNoMore = createSelector(debugImages, (state) => state.noMore);
export const selectOptionalMetrics = createSelector(debugImages, (state) => state.optionalMetrics);
export const selectTimeIsNow = createSelector(debugImages, (state) => state.timeIsNow);
export const selectBeginningOfTime = createSelector(debugImages, (state) => state.beginningOfTime);
export const selectMinMaxIterations = createSelector(debugImages, (state) => state.minMaxIterations);
export const selectCurrentImageViewerDebugImage = createSelector(debugImages, (state) => state.currentImageViewerDebugImage);
export const selectImageViewerScrollId = createSelector(debugImages, (state) => state.imageDisplayerScrollId);
export const selectDisplayerEndOfTime = createSelector(debugImages, (state) => state.imageDisplayerEndOfTime);
export const selectDisplayerBeginningOfTime = createSelector(debugImages, (state) => state.imageDisplayerBeginningOfTime);

export const debugSamplesReducer = createReducer(
  initialState,
  on(resetDebugImages, state => ({
    ...state,
    debugImages: initialState.debugImages,
    scrollId: initialState.scrollId,
    noMore: initialState.noMore
  })),
  on(setDebugImages, (state, action) => ({...state, debugImages: {...state.debugImages, [action.task]: action.res}})),
  on(setExperimentsNames, (state, action) => ({...state, tasks: action.tasks})),
  on(setMetrics, (state, action) => ({...state, optionalMetrics: action.metrics})),
  on(getDebugImagesMetrics, state => ({...state, optionalMetrics: initialState.optionalMetrics, debugImages: initialState.debugImages})),
  on(setSelectedMetric, (state, action) => ({
        ...state,
        debugImages: omit(action.payload.task, state.debugImages),
        timeIsNow: {...state.timeIsNow, [action.payload.task]: true},
        beginningOfTime: {...state.beginningOfTime, [action.payload.task]: false}
  })),
  on(setTimeIsNow, (state, action) => ({...state, timeIsNow: {...state.timeIsNow, [action.task]: action.timeIsNow}})),
  on(fetchExperiments, () => ({...initialState})),
  on(setBeginningOfTime, (state, action) => ({
        ...state,
        beginningOfTime: {...state.beginningOfTime, [action.task]: action.beginningOfTime}
  })),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  on(setDebugImageIterations, (state, action) => ({...state, minMaxIterations: {min_iteration: action.min_iteration, max_iteration: action.max_iteration}})),
  on(setCurrentDebugImage, (state, action) => ({...state, currentImageViewerDebugImage: action.event})),
  on(setDebugImageViewerScrollId, (state, action) => ({...state, imageDisplayerScrollId: action.scrollId})),
  on(setDisplayerEndOfTime, (state, action) => ({...state, imageDisplayerEndOfTime: action.endOfTime})),
  on(setDisplayerBeginningOfTime, (state, action) => ({...state, imageDisplayerBeginningOfTime: action.beginningOfTime})),
  on(resetDisplayer, state => ({
    ...state,
    imageDisplayerEndOfTime: null,
    imageDisplayerBeginningOfTime: null,
    imageDisplayerScrollId: null,
    minMaxIterations: null,
    currentImageViewerDebugImage: null
  })),
);
