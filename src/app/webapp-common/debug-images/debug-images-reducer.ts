import {
  fetchExperiments, getDebugImagesMetrics, resetDebugImages, setDebugImages, setExperimentsNames, setMetrics, setTimeIsNow
} from './debug-images-actions';
import {Task} from '~/business-logic/model/tasks/task';
import {createFeatureSelector, createReducer, createSelector, on} from '@ngrx/store';
import {EventsDebugImagesResponse} from '~/business-logic/model/events/eventsDebugImagesResponse';


export interface IDebugImagesState {
  debugImages: {[taskId: string]: EventsDebugImagesResponse};
  settingsList: Array<IDebugImagesSettings>;
  tasks: Array<Partial<Task>>;
  optionalMetrics: Array<ITaskOptionalMetrics>;
  searchTerm: string;
  scrollId: any;
  noMore: boolean;
  selectedMetric: any;
  timeIsNow: any;

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
    debugImages: null,
    settingsList: [],
    searchTerm: '',
    tasks: [],
    optionalMetrics: [],
    scrollId: {},
    noMore: true,
    selectedMetric: null,
    timeIsNow: {}
  }
;

export const debugImages = createFeatureSelector<IDebugImagesState>('debugImages');
export const selectDebugImages = createSelector(debugImages, (state) => state.debugImages);
export const selectTaskNames = createSelector(debugImages, (state) => state.tasks);
export const selectNoMore = createSelector(debugImages, (state) => state.noMore);
export const selectOptionalMetrics = createSelector(debugImages, (state) => state.optionalMetrics);
export const selectTimeIsNow = createSelector(debugImages, (state) => state.timeIsNow);


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

  on(setTimeIsNow, (state, action) => ({...state, timeIsNow: {...state.timeIsNow, [action.task]: action.timeIsNow}})),
  on(fetchExperiments, () => ({...initialState})),
  // eslint-disable-next-line @typescript-eslint/naming-convention

);
