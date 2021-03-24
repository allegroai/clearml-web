import {
  FETCH_EXPERIMENTS,
  GET_DEBUG_IMAGES_METRICS,
  GET_NEXT_DEBUG_IMAGES_BATCH,
  RESET_DEBUG_IMAGES, resetDisplayer,
  SET_BEGINNING_OF_TIME,
  SET_DEBUG_IMAGES,
  SET_DEBUG_IMAGES_METRICS,
  SET_DEBUG_IMAGES_SELECTED_METRIC,
  SET_DEBUG_IMAGES_SETTINGS,
  SET_EXPERIMENTS_NAMES,
  SET_TIME_IS_NOW, setCurrentDebugImage,
  setDebugImageIterations, setDebugImageViewerScrollId, setDisplayerBeginningOfTime, setDisplayerEndOfTime
} from './debug-images-actions';
import {Task} from '../../business-logic/model/tasks/task';
import {createFeatureSelector, createSelector} from '@ngrx/store';
import {omit} from 'lodash/fp';
import {EventsGetDebugImageIterationsResponse} from '../../business-logic/model/events/eventsGetDebugImageIterationsResponse';


export interface IDebugImagesState {
  debugImages: any;
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

export function debugImagesReducer(state = initialState, action): IDebugImagesState {
  switch (action.type) {
    case RESET_DEBUG_IMAGES:
      return {
        ...state,
        debugImages: initialState.debugImages,
        scrollId: initialState.scrollId,
        noMore: initialState.noMore
      };
    case SET_DEBUG_IMAGES_SETTINGS: {
      let newSettings: IDebugImagesSettings[];
      const isExperimentExists = state.settingsList.find((setting) => setting.id === action.payload.id);
      if (isExperimentExists) {
        newSettings = state.settingsList.map(setting => setting.id === action.payload.id ? {...setting, ...action.payload.changes} : setting);
      } else {
        newSettings = state.settingsList.slice();
        newSettings.push({id: action.payload.id, ...action.payload.changes});
      }
      return {...state, settingsList: newSettings};
    }
    case SET_DEBUG_IMAGES: {
      return {...state, debugImages: {...state.debugImages, [action.payload.task]: action.payload.res}};
    }
    case SET_EXPERIMENTS_NAMES:
      return {...state, tasks: action.payload.tasks};
    case SET_DEBUG_IMAGES_METRICS:
      return {...state, optionalMetrics: action.payload.metrics};
    case GET_DEBUG_IMAGES_METRICS:
      return {...state, optionalMetrics: initialState.optionalMetrics, debugImages: initialState.debugImages};
    case SET_DEBUG_IMAGES_SELECTED_METRIC:
      return {
        ...state,
        debugImages: omit(action.payload.task, state.debugImages),
        timeIsNow: {...state.timeIsNow, [action.payload.task]: true},
        beginningOfTime: {...state.beginningOfTime, [action.payload.task]: false}
      };
    case SET_TIME_IS_NOW:
      return {...state, timeIsNow: {...state.timeIsNow, [action.payload.task]: action.payload.timeIsNow}};
    case FETCH_EXPERIMENTS:
      return {...initialState};
    case SET_BEGINNING_OF_TIME:
      return {
        ...state,
        beginningOfTime: {...state.beginningOfTime, [action.payload.task]: action.payload.beginningOfTime}
      };
    case setDebugImageIterations.type:
      return {...state, minMaxIterations: {min_iteration: action.min_iteration, max_iteration: action.max_iteration}};
    case setCurrentDebugImage.type:
      return {...state, currentImageViewerDebugImage: action.event};
    case setDebugImageViewerScrollId.type:
      return {...state, imageDisplayerScrollId: action.scrollId};
    case setDisplayerEndOfTime.type:
      return {...state, imageDisplayerEndOfTime: action.endOfTime};
    case setDisplayerBeginningOfTime.type:
      return {...state, imageDisplayerBeginningOfTime: action.beginningOfTime};

    case resetDisplayer.type:
      return {
        ...state,
        imageDisplayerEndOfTime: null,
        imageDisplayerBeginningOfTime: null,
        imageDisplayerScrollId: null,
        minMaxIterations: null,
        currentImageViewerDebugImage: null
      };
    default:
      return state;
  }
}

