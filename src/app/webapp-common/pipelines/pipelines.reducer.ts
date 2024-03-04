import {ActionCreator, createReducer, createSelector, on, ReducerTypes} from '@ngrx/store';

import {TABLE_SORT_ORDER, TableSortOrderEnum} from '../shared/ui-components/data/table/table.consts';
import {
  addToPipelinesList,
  checkPipelineForDeletion,
  resetPipelines,
  resetPipelinesSearchQuery,
  resetReadyToDelete,
  setCurrentScrollId,
  setExperimentsResults,
  setNoMorePipelines,
  setPipelinesOrderBy,
  setPipelinesSearchQuery,
  setSelectedPipeline,
  setTableModeAwareness,
  showExampleDatasets,
  showExamplePipelines,
  updatePipelineSuccess
} from './pipelines.actions';
import {SearchState} from '../common-search/common-search.reducer';
import { Pipeline } from '~/business-logic/model/pipelines/pipeline';
import { Task } from '~/business-logic/model/tasks/task';


export const PIPELINES_KEY = 'pipelines';

export interface CommonReadyForDeletion {
  experiments: { total: number; archived: number; unarchived: number };
  models: { total: number; archived: number; unarchived: number };
  reports: { total: number; archived: number; unarchived: number };
  pipelines: { total: number; unarchived: number };
  datasets: { total: number; unarchived: number };
}

export interface CommonProjectReadyForDeletion extends CommonReadyForDeletion {
  project: Pipeline;
}

export interface PipelineState {
  orderBy: string;
  sortOrder: TableSortOrderEnum;
  searchQuery: SearchState['searchQuery'];
  pipelines: Pipeline[];
  pipelinesNonFilteredList: Pipeline[];
  selectedProjectId: string;
  selectedPipeline: Pipeline;
  projectReadyForDeletion: CommonReadyForDeletion;
  validatedProject: Pipeline;
  noMorePipelines: boolean;
  scrollId: string;
  tableModeAwareness: boolean;
  showPipelineExamples: boolean;
  showDatasetExamples: boolean;
  experiments: Task[];
}

export const pipelinesInitState: PipelineState = {
  pipelines: null,
  selectedProjectId: '',
  selectedPipeline: {},
  orderBy: 'last_update',
  sortOrder: TABLE_SORT_ORDER.DESC,
  searchQuery: null,
  pipelinesNonFilteredList: [],
  projectReadyForDeletion: null,
  validatedProject: null,
  noMorePipelines: true,
  scrollId: null,
  tableModeAwareness: true,
  showPipelineExamples: false,
  showDatasetExamples: false,
  experiments: null
};

const getCorrectSortingOrder = (currentSortOrder: TableSortOrderEnum, currentOrderField: string, nextOrderField: string) => {
  if (currentOrderField === nextOrderField) {
    return currentSortOrder === TABLE_SORT_ORDER.DESC ? TABLE_SORT_ORDER.ASC : TABLE_SORT_ORDER.DESC;
  } else {
    return nextOrderField === 'last_update' ? TABLE_SORT_ORDER.DESC : TABLE_SORT_ORDER.ASC;
  }
};

export const pipelinesReducers = [
  on(addToPipelinesList, (state, action) => ({
    ...state,
    pipelines: action.reset
      ? action.pipelines
      : [...(state.pipelines || []), ...action.pipelines],
  })),
  on(setCurrentScrollId, (state, action) => ({
    ...state,
    scrollId: action.scrollId,
  })),
  on(setNoMorePipelines, (state, action) => ({
    ...state,
    noMorePipelines: action.payload,
  })),
  on(updatePipelineSuccess, (state, action) => ({
    ...state,
    pipelines: state.pipelines?.map((pr) =>
      pr.id === action.changes.id
        ? {
            ...pr,
            ...action.changes,
            ...(!!action.changes?.name && {
              basename: action.changes?.name.split("/").at(-1),
            }),
          }
        : pr
    ),
    selectedPipeline:
      state.selectedPipeline.id === action.changes.id
        ? { ...state.selectedPipeline, ...action.changes }
        : state.selectedPipeline,
  })),
  on(setSelectedPipeline, (state, action) => ({
    ...state,
    selectedPipeline: { ...action.data },
  })),
  on(resetPipelines, (state) => ({
    ...state,
    scrollId: null,
    noMorePipelines: pipelinesInitState.noMorePipelines,
    pipelines: pipelinesInitState.pipelines,
    selectedProjectId: pipelinesInitState.selectedProjectId,
    selectedPipeline: pipelinesInitState.selectedPipeline
  })),
  on(setPipelinesOrderBy, (state, action) => ({
    ...state,
    orderBy: action.orderBy,
    sortOrder: getCorrectSortingOrder(
      state.sortOrder,
      state.orderBy,
      action.orderBy
    ),
    scrollId: null,
    noMorePipelines: pipelinesInitState.noMorePipelines,
    pipelines: pipelinesInitState.pipelines,
  })),
  on(setPipelinesSearchQuery, (state, action) => ({
    ...state,
    searchQuery: action as ReturnType<typeof setPipelinesSearchQuery>,
    scrollId: null,
    noMorePipelines: pipelinesInitState.noMorePipelines,
    pipelines: pipelinesInitState.pipelines,
  })),
  on(resetPipelinesSearchQuery, (state) => ({
    ...state,
    // searchQuery: pipelinesInitState.searchQuery,
    scrollId: null,
    noMorePipelines: pipelinesInitState.noMorePipelines,
    pipelines: pipelinesInitState.pipelines,
  })),
  on(checkPipelineForDeletion, (state, action) => ({
    ...state,
    validatedProject: action.pipeline,
    projectReadyForDeletion: pipelinesInitState.projectReadyForDeletion,
  })),
  on(resetReadyToDelete, (state) => ({
    ...state,
    projectReadyForDeletion: pipelinesInitState.projectReadyForDeletion,
    validatedProject: pipelinesInitState.validatedProject,
  })),
  on(setTableModeAwareness, (state, action) => ({
    ...state,
    tableModeAwareness: (action as ReturnType<typeof setTableModeAwareness>)
      .awareness,
  })),
  on(showExamplePipelines, (state) => ({
    ...state,
    showPipelineExamples: true,
  })),
  on(showExampleDatasets, (state) => ({ ...state, showDatasetExamples: true })),
  on(setExperimentsResults, (state, action) => ({
    ...state,
    experiments: [...action.experiments],
  })),
] as ReducerTypes<PipelineState, ActionCreator[]>[];
export const pipelinesReducer = createReducer(pipelinesInitState, ...pipelinesReducers);

export const pipelines = state => state.pipelines as PipelineState;


export const selectPipelines = createSelector(pipelines, state => state[PIPELINES_KEY]);
export const selectNonFilteredPipelinesList = createSelector(pipelines, state => state?.pipelinesNonFilteredList || []);
export const selectSelectedPipeline = createSelector(pipelines,  state => state?.selectedPipeline);
export const selectPipelinesOrderBy = createSelector(pipelines, state => state?.orderBy || '');
export const selectPipelinesSortOrder = createSelector(pipelines, state => state?.sortOrder || TABLE_SORT_ORDER.DESC);
export const selectPipelinesSearchQuery = createSelector(pipelines, state => state?.searchQuery);
export const selectValidatedProject = createSelector(pipelines, state => state.validatedProject);
export const selectReadyForDeletion = createSelector(pipelines, state =>
  state.projectReadyForDeletion);
export const selectProjectReadyForDeletion = createSelector(selectValidatedProject, selectReadyForDeletion,
  (project, projectReadyForDeletion) => projectReadyForDeletion ? {...projectReadyForDeletion, project} : null);
export const selectProjectForDelete = createSelector(pipelines, state => [state?.validatedProject]);
export const selectNoMorePipelines = createSelector(pipelines, state => state.noMorePipelines);
export const selectPipelinesScrollId = createSelector(pipelines, (state): string => state?.scrollId || null);
export const selectTableModeAwareness = createSelector(pipelines, state => state?.tableModeAwareness);
export const selectShowPipelineExamples = createSelector(pipelines, state => state?.showPipelineExamples);
export const selectShowDatasetExamples = createSelector(pipelines, state => state?.showDatasetExamples);
export const selectExperiments = createSelector(pipelines, state => state?.experiments);