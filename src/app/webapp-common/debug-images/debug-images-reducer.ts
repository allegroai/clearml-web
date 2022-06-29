import {
  fetchExperiments,
  getDebugImagesMetrics,
  resetDebugImages,
  resetViewer,
  setBeginningOfTime,
  setCurrentDebugImage,
  setDebugImageIterations,
  setDebugImages,
  setDebugImageViewerScrollId,
  setViewerBeginningOfTime,
  setViewerEndOfTime, setExperimentsNames, setMetrics, setSelectedMetric, setTimeIsNow
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
  imageViewerScrollId: string;
  imageViewerBeginningOfTime: boolean;
  imageViewerEndOfTime: boolean;
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
    imageViewerScrollId: null,
    imageViewerBeginningOfTime: null,
    imageViewerEndOfTime: null,
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
export const selectImageViewerScrollId = createSelector(debugImages, (state) => state.imageViewerScrollId);
export const selectViewerEndOfTime = createSelector(debugImages, (state) => state.imageViewerEndOfTime);
export const selectViewerBeginningOfTime = createSelector(debugImages, (state) => state.imageViewerBeginningOfTime);

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
  on(setDebugImageViewerScrollId, (state, action) => ({...state, imageViewerScrollId: action.scrollId})),
  on(setViewerEndOfTime, (state, action) => ({...state, imageViewerEndOfTime: action.endOfTime})),
  on(setViewerBeginningOfTime, (state, action) => ({...state, imageViewerBeginningOfTime: action.beginningOfTime})),
  on(resetViewer, state => ({
    ...state,
    imageViewerEndOfTime: null,
    imageViewerBeginningOfTime: null,
    imageViewerScrollId: null,
    minMaxIterations: null,
    currentImageViewerDebugImage: null
  })),
);
