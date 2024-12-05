import {
  fetchExperiments,
  getDebugImagesMetrics,
  resetDebugImages,
  setDebugImages,
  setExperimentsNames,
  setMetrics, setSelectedMetric,
  setTimeIsNow
} from './debug-images-actions';
import {Task} from '~/business-logic/model/tasks/task';
import {createFeatureSelector, createReducer, createSelector, on} from '@ngrx/store';
import {EventsDebugImagesResponse} from '~/business-logic/model/events/eventsDebugImagesResponse';

type taskId = string;

export interface DebugImagesState {
  debugImages: Record<taskId, EventsDebugImagesResponse>;
  settingsList: IDebugImagesSettings[];
  tasks: Partial<Task>[];
  optionalMetrics: ITaskOptionalMetrics[];
  selectedMetricsForTask: Record<taskId, string>;
  searchTerm: string;
  scrollId: Record<taskId, string>;
  noMore: boolean;
  timeIsNow: Record<taskId, boolean>;
}

export interface IDebugImagesSettings {
  id: Task['id'];
  selectedDebugImages: string;
}

export interface ITaskOptionalMetrics {
  task: string;
  metrics: string[];
}

export const initialState: DebugImagesState = {
    debugImages: null,
    settingsList: [],
    searchTerm: '',
    tasks: [],
    optionalMetrics: [],
    scrollId: {},
    noMore: true,
    selectedMetricsForTask: {},
    timeIsNow: {}
  }
;

export const debugImages = createFeatureSelector<DebugImagesState>('debugImages');
export const selectDebugImages = createSelector(debugImages, (state) => state.debugImages);
export const selectTaskNames = createSelector(debugImages, (state) => state.tasks);
export const selectNoMore = createSelector(debugImages, (state) => state.noMore);
export const selectOptionalMetrics = createSelector(debugImages, (state) => state.optionalMetrics);
export const selectSelectedMetricForTask = createSelector(debugImages, (state) => state.selectedMetricsForTask);
export const selectTimeIsNow = createSelector(debugImages, (state) => state.timeIsNow);


export const debugSamplesReducer = createReducer(
  initialState,
  on(resetDebugImages, state => ({
    ...state,
    debugImages: initialState.debugImages,
    scrollId: initialState.scrollId,
    noMore: initialState.noMore
  })),
  on(setDebugImages, (state, action): DebugImagesState => ({...state, debugImages: {...state.debugImages, [action.task]: action.res}})),
  on(setExperimentsNames, (state, action): DebugImagesState => ({...state, tasks: action.tasks})),
  on(setMetrics, (state, action): DebugImagesState => ({...state, optionalMetrics: action.metrics})),
  on(setSelectedMetric, (state, action): DebugImagesState => ({...state, selectedMetricsForTask: {...state.selectedMetricsForTask, [action.payload.task]: action.payload.metric}})),
  on(getDebugImagesMetrics, (state, action): DebugImagesState => ({...state, ...(!action.autoRefresh && {optionalMetrics: initialState.optionalMetrics, debugImages: initialState.debugImages})})),
  on(setTimeIsNow, (state, action): DebugImagesState => ({...state, timeIsNow: {...state.timeIsNow, [action.task]: action.timeIsNow}})),
  on(fetchExperiments, (): DebugImagesState => ({...initialState})),


);
