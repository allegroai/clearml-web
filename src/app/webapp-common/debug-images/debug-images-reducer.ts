import {FETCH_EXPERIMENTS, GET_DEBUG_IMAGES_METRICS, GET_NEXT_DEBUG_IMAGES_BATCH, RESET_DEBUG_IMAGES, SET_BEGINNING_OF_TIME, SET_DEBUG_IMAGES, SET_DEBUG_IMAGES_METRICS, SET_DEBUG_IMAGES_SELECTED_METRIC, SET_DEBUG_IMAGES_SETTINGS, SET_EXPERIMENTS_NAMES, SET_TIME_IS_NOW} from './debug-images-actions';
import {Task} from '../../business-logic/model/tasks/task';
import {createFeatureSelector, createSelector} from '@ngrx/store';
import {omit} from 'lodash/fp';


export interface IDebugImagesState {
  debugImages: any;
  settingsList: Array<IDebugImagesSettings>;
  tasks: Array<Partial<Task>>;
  optionalMetrics: Array<ITaskOptionalMetrics>;
  searchTerm: string;
  scrollId: any;
  noMore: boolean;
  selectedMetric: any;
  timeIsNow: any;
  beginningOfTime: any;
}

export interface IDebugImagesSettings {
  id: Task['id'];
  selectedDebugImages: string;
}

export interface ITaskOptionalMetrics {
  task: string;
  metrics: Array<string>
}

export const initialState: IDebugImagesState = {
         debugImages: {},
         settingsList: [],
         searchTerm: '',
         tasks: [],
         optionalMetrics: [],
         scrollId: {},
         noMore: true,
         selectedMetric: null,
         timeIsNow: {},
         beginningOfTime: {}
       }
;

export const debugImages = createFeatureSelector<IDebugImagesState>('debugImages');
export const selectDebugImages = createSelector(debugImages, (state) => state.debugImages);
export const selectTaskNames = createSelector(debugImages, (state) => state.tasks);
export const selectNoMore = createSelector(debugImages, (state) => state.noMore);
export const selectOptionalMetrics = createSelector(debugImages, (state) => state.optionalMetrics);
export const selectTimeIsNow = createSelector(debugImages, (state) => state.timeIsNow);
export const selectBeginningOfTime = createSelector(debugImages, (state) => state.beginningOfTime);

export function debugImagesReducer(state = initialState, action): IDebugImagesState {
  switch (action.type) {
    case RESET_DEBUG_IMAGES:
      return {...state, debugImages: initialState.debugImages, scrollId: initialState.scrollId, noMore: initialState.noMore};
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
      return {...state, debugImages: omit(action.payload.task, state.debugImages), timeIsNow: {...state.timeIsNow, [action.payload.task]: true}, beginningOfTime: {...state.beginningOfTime, [action.payload.task]: false}};
    case SET_TIME_IS_NOW:
      return {...state, timeIsNow: {...state.timeIsNow, [action.payload.task]: action.payload.timeIsNow}};
    case FETCH_EXPERIMENTS:
      return {...initialState};
    case SET_BEGINNING_OF_TIME:
      return {...state, beginningOfTime: {...state.beginningOfTime, [action.payload.task]: action.payload.beginningOfTime}};
    default:
      return state;
  }
}

