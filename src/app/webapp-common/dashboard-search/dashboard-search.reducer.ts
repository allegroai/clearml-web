import {createFeatureSelector, createSelector, ReducerTypes, on, createReducer} from '@ngrx/store';
import {Project} from '~/business-logic/model/projects/project';
import {User} from '~/business-logic/model/users/user';
import {Task} from '~/business-logic/model/tasks/task';
import {Model} from '~/business-logic/model/models/model';
import {
  clearSearchResults,
  searchActivate,
  searchClear,
  searchDeactivate,
  searchSetTerm, setExperimentsResults, setModelsResults, setOpenDatasetsResults,
  setPipelinesResults,
  setProjectsResults, setReportsResults, setResultsCount
} from './dashboard-search.actions';
import {SearchState} from '../common-search/common-search.reducer';
import {ActiveSearchLink, activeSearchLink} from '~/features/dashboard-search/dashboard-search.consts';
import {IReport} from "@common/reports/reports.consts";

export interface DashboardSearchState {
  projects: Project[];
  experiments: Task[];
  models: Model[];
  pipelines: Project[];
  reports: IReport[];
  openDatasets: Project[];
  users: User[];
  term: SearchState['searchQuery'];
  forceSearch: boolean;
  active: boolean;
  resultsCount: Map<ActiveSearchLink, number>;
  scrollIds: Map<ActiveSearchLink, string>;
}


export const searchInitialState: DashboardSearchState = {
  term: null,
  forceSearch: false,
  projects: [],
  pipelines: [],
  openDatasets: [],
  users: [],
  experiments: [],
  models: [],
  reports: [],
  resultsCount: null,
  scrollIds: null,
  active: false
};

export const dashboardSearchReducers = [
  on(searchActivate, (state) => ({...state, active: true})),
  on(searchDeactivate, (state) => ({
    ...state,
    active: false,
    term: searchInitialState.term,
    forceSearch: false,
    scrollIds: null,
    resultsCount: null
  })),
  on(searchSetTerm, (state, action) => ({...state, term: action, forceSearch: action.force, scrollIds: null})),
  on(setProjectsResults, (state, action) => ({
    ...state,
    projects: action.scrollId === state.scrollIds?.[activeSearchLink.projects] ? state.projects.concat(action.projects) : action.projects,
    scrollIds: {...state.scrollIds, [activeSearchLink.projects]: action.scrollId}
  })),
  on(setPipelinesResults, (state, action) => ({
    ...state,
    pipelines: action.scrollId === state.scrollIds?.[activeSearchLink.pipelines] ? state.pipelines.concat(action.pipelines) : action.pipelines,
    scrollIds: {...state.scrollIds, [activeSearchLink.pipelines]: action.scrollId}
  })),
  on(setOpenDatasetsResults, (state, action) => ({
    ...state,
    openDatasets: action.scrollId === state.scrollIds?.[activeSearchLink.openDatasets] ? state.openDatasets.concat(action.openDatasets) : action.openDatasets,
    scrollIds: {...state.scrollIds, [activeSearchLink.openDatasets]: action.scrollId}
  })),
  on(setExperimentsResults, (state, action) => ({
    ...state,
    experiments: action.scrollId === state.scrollIds?.[activeSearchLink.experiments] ? state.experiments.concat(action.experiments) : action.experiments,
    scrollIds: {...state.scrollIds, [activeSearchLink.experiments]: action.scrollId}
  })),
  on(setModelsResults, (state, action) => ({
    ...state,
    models: action.scrollId === state.scrollIds?.[activeSearchLink.models] ? state.models.concat(action.models) : action.models,
    scrollIds: {...state.scrollIds, [activeSearchLink.models]: action.scrollId}
  })),
  on(setReportsResults, (state, action) => ({
    ...state,
    reports: action.scrollId === state.scrollIds?.[activeSearchLink.reports] ? state.reports.concat(action.reports) : action.reports,
    scrollIds: {...state.scrollIds, [activeSearchLink.reports]: action.scrollId}
  })),
  on(setResultsCount, (state, action) => ({...state, resultsCount: action.counts})),
  on(clearSearchResults, (state) => ({
    ...state,
    [activeSearchLink.models]: [],
    [activeSearchLink.experiments]: [],
    [activeSearchLink.pipelines]: [],
    [activeSearchLink.projects]: [],
  })),
  on(searchClear, (state) => ({...state, ...searchInitialState})),
] as ReducerTypes<DashboardSearchState, any>[];

export const dashboardSearchReducer = createReducer(
  searchInitialState,
  ...dashboardSearchReducers
);

export const selectSearch = createFeatureSelector<DashboardSearchState>('search');
export const selectProjectsResults = createSelector(selectSearch, (state: DashboardSearchState): Array<Project> => state.projects);
export const selectExperimentsResults = createSelector(selectSearch, (state: DashboardSearchState): Array<Task> => state.experiments);
export const selectModelsResults = createSelector(selectSearch, (state: DashboardSearchState): Array<Model> => state.models);
export const selectReportsResults = createSelector(selectSearch, (state: DashboardSearchState): Array<IReport> => state.reports);
export const selectPipelinesResults = createSelector(selectSearch, (state: DashboardSearchState): Array<Project> => state.pipelines);
export const selectDatasetsResults = createSelector(selectSearch, (state: DashboardSearchState): Array<Project> => state.openDatasets);
export const selectActiveSearch = createSelector(selectSearch, (state: DashboardSearchState): boolean => state.term?.query?.length >= 3 || state.forceSearch);
export const selectSearchTerm = createSelector(selectSearch, (state: DashboardSearchState): SearchState['searchQuery'] => state.term);
export const selectResultsCount = createSelector(selectSearch, (state: DashboardSearchState): Map<ActiveSearchLink, number> => state.resultsCount);
export const selectSearchScrollIds = createSelector(selectSearch, (state: DashboardSearchState): Map<ActiveSearchLink, string> => state.scrollIds);
