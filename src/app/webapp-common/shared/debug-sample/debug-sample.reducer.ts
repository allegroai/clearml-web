import {createFeatureSelector, createReducer, createSelector, on} from '@ngrx/store';
import {EventsGetDebugImageIterationsResponse} from '~/business-logic/model/events/eventsGetDebugImageIterationsResponse';
import {setSelectedMetric} from '@common/debug-images/debug-images-actions';
import {
  resetViewer, setBeginningOfTime, setCurrentDebugImage, setDebugImageIterations, setDebugImageViewerScrollId, setViewerBeginningOfTime, setViewerEndOfTime
} from '@common/shared/debug-sample/debug-sample.actions';


export interface DebugSample {
  iter: number;
  metric: string;
  task: string;
  timestamp: number;
  type: string;
  variant: string;
  worker: string;
  url: string;
}

export const debugSampleFeatureKey = 'debugSample';

export interface DebugSampleState {
  beginningOfTime: any;
  minMaxIterations: EventsGetDebugImageIterationsResponse;
  imageViewerScrollId: string;
  imageViewerBeginningOfTime: boolean;
  imageViewerEndOfTime: boolean;
  currentImageViewerDebugImage: any;
}

export const initialState: DebugSampleState = {
  imageViewerScrollId: null,
  imageViewerBeginningOfTime: null,
  imageViewerEndOfTime: null,
  beginningOfTime: {},
  minMaxIterations: {},
  currentImageViewerDebugImage: null
};

export const debugSampleReducer = createReducer(
  initialState,
  on(setSelectedMetric, (state, action) => ({
    ...state,
    // timeIsNow: {...state.timeIsNow, [action.payload.task]: true},
    beginningOfTime: {...state.beginningOfTime, [action.payload.task]: false}
  })),
  on(setBeginningOfTime, (state, action) => ({
    ...state,
    beginningOfTime: {...state.beginningOfTime, [action.task]: action.beginningOfTime}
  })),
  on(setDebugImageViewerScrollId, (state, action) => ({...state, imageViewerScrollId: action.scrollId})),
  on(setViewerEndOfTime, (state, action) => ({...state, imageViewerEndOfTime: action.endOfTime})),
  on(setViewerBeginningOfTime, (state, action) => ({...state, imageViewerBeginningOfTime: action.beginningOfTime})),
  on(setDebugImageIterations, (state, action) => ({...state, minMaxIterations: {min_iteration: action.min_iteration, max_iteration: action.max_iteration}})),
  on(setCurrentDebugImage, (state, action) => ({...state, currentImageViewerDebugImage: action.event})),
  on(resetViewer, state => ({
    ...state,
    imageViewerEndOfTime: null,
    imageViewerBeginningOfTime: null,
    imageViewerScrollId: null,
    minMaxIterations: null,
    currentImageViewerDebugImage: null
  })),
);

export const debugSample = createFeatureSelector<DebugSampleState>('debugSample');
export const selectBeginningOfTime = createSelector(debugSample, (state) => state.beginningOfTime);
export const selectViewerEndOfTime = createSelector(debugSample, (state) => state.imageViewerEndOfTime);
export const selectMinMaxIterations = createSelector(debugSample, (state) => state.minMaxIterations);
export const selectImageViewerScrollId = createSelector(debugSample, (state) => state.imageViewerScrollId);
export const selectViewerBeginningOfTime = createSelector(debugSample, (state) => state.imageViewerBeginningOfTime);
export const selectCurrentImageViewerDebugImage = createSelector(debugSample, (state) => state.currentImageViewerDebugImage);
