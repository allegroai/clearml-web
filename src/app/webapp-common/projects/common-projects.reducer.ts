import {createReducer, createSelector, on, ReducerTypes} from '@ngrx/store';
import {Project} from '~/business-logic/model/projects/project';
import {TABLE_SORT_ORDER, TableSortOrderEnum} from '../shared/ui-components/data/table/table.consts';
import {
  addToProjectsList, checkProjectForDeletion, resetProjects, resetProjectsSearchQuery, resetReadyToDelete, setCurrentScrollId, setNoMoreProjects, setProjectReadyForDeletion, setProjectsOrderBy,
  setProjectsSearchQuery, setTableModeAwareness, showExampleDatasets, showExamplePipelines, updateProjectSuccess
} from './common-projects.actions';
import {SearchState} from '../common-search/common-search.reducer';

export interface CommonProjectReadyForDeletion {
  project: Project;
  experiments: {archived: number; unarchived: number};
  models: {archived: number; unarchived: number};
}

export interface CommonProjectsState {
  orderBy: string;
  sortOrder: TableSortOrderEnum;
  searchQuery: SearchState['searchQuery'];
  projects: Project[];
  projectsNonFilteredList: Project[];
  selectedProjectId: string;
  selectedProject: Project;
  projectReadyForDeletion: CommonProjectReadyForDeletion;
  noMoreProjects: boolean;
  scrollId: string;
  tableModeAwareness: boolean;
  showPipelineExamples: boolean;
  showDatasetExamples: boolean;
}

export const commonProjectsInitState: CommonProjectsState = {
  projects: null,
  selectedProjectId: '',
  selectedProject: {},
  orderBy: 'last_update',
  sortOrder: TABLE_SORT_ORDER.DESC,
  searchQuery: null,
  projectsNonFilteredList: [],
  projectReadyForDeletion: {
    project: null,
    experiments: null,
    models: null
  },
  noMoreProjects: true,
  scrollId: null,
  tableModeAwareness: true,
  showPipelineExamples: false,
  showDatasetExamples: false,
};

const getCorrectSortingOrder = (currentSortOrder: TableSortOrderEnum, currentOrderField: string, nextOrderField: string) => {
  if (currentOrderField === nextOrderField) {
    return currentSortOrder === TABLE_SORT_ORDER.DESC ? TABLE_SORT_ORDER.ASC : TABLE_SORT_ORDER.DESC;
  } else {
    return nextOrderField === 'last_update' ? TABLE_SORT_ORDER.DESC : TABLE_SORT_ORDER.ASC;
  }
};

export const commonProjectsReducers = [
  on(addToProjectsList, (state, action) => ({...state, projects: action.reset? action.projects: [...(state.projects || []), ...action.projects]})),
  on(setCurrentScrollId, (state, action) => ({...state, scrollId: action.scrollId})),
  on(setNoMoreProjects, (state, action) => ({...state, noMoreProjects: action.payload})),
  on(updateProjectSuccess, (state, action) => ({...state, projects: state.projects?.map(ex => ex.id === action.id ? {...ex, ...action.changes} : ex)})),
  on(resetProjects, state => ({...state, scrollId: null, noMoreProjects: false, projects: commonProjectsInitState.projects})),
  on(setProjectsOrderBy, (state, action) => ({
    ...state,
    orderBy: action.orderBy,
    sortOrder: getCorrectSortingOrder(state.sortOrder, state.orderBy, action.orderBy),
    scrollId: null,
    noMoreProjects: false,
    projects: commonProjectsInitState.projects
  })),
  on(setProjectsSearchQuery, (state, action) => ({
    ...state,
    searchQuery: (action as ReturnType<typeof setProjectsSearchQuery>),
    scrollId: null,
    noMoreProjects: true,
    projects: commonProjectsInitState.projects
  })),
  on(resetProjectsSearchQuery, state => ({
    ...state,
    searchQuery: commonProjectsInitState.searchQuery,
    scrollId: null,
    noMoreProjects: true,
    projects: commonProjectsInitState.projects
  })),
  on(checkProjectForDeletion, (state, action) => ({
    ...state,
    projectReadyForDeletion: {
      ...commonProjectsInitState.projectReadyForDeletion,
      project: action.project
    }
  })),
  on(resetReadyToDelete, state => ({...state, projectReadyForDeletion: commonProjectsInitState.projectReadyForDeletion})),
  on(setProjectReadyForDeletion, (state, action) =>
    ({...state, projectReadyForDeletion: {...state.projectReadyForDeletion, ...action.readyForDeletion}})),
  on(setTableModeAwareness, (state, action) =>
    ({...state, tableModeAwareness: (action as ReturnType<typeof setTableModeAwareness>).awareness})),
  on(showExamplePipelines, state => ({...state, showPipelineExamples: true})),
  on(showExampleDatasets, state => ({...state, showDatasetExamples: true}))
] as ReducerTypes<CommonProjectsState, any>[];
export const commonProjectsReducer = createReducer(commonProjectsInitState, ...commonProjectsReducers);

export const projects = state => state.projects as CommonProjectsState;


export const selectProjects = createSelector(projects, state => state?.projects);
export const selectNonFilteredProjectsList = createSelector(projects, state => state?.projectsNonFilteredList || []);
// export const selectSelectedProjectId = createSelector(selectRouterParams, (params: any) => params ? params.projectId : '');
export const selectProjectsOrderBy = createSelector(projects, state => state?.orderBy || '');
export const selectProjectsSortOrder = createSelector(projects, state => state?.sortOrder || TABLE_SORT_ORDER.DESC);
export const selectProjectsSearchQuery = createSelector(projects, state => state?.searchQuery);
export const selectProjectReadyForDeletion = createSelector(projects, state => state?.projectReadyForDeletion);
export const selectProjectForDelete = createSelector(projects, state => [state?.projectReadyForDeletion.project]);
export const selectNoMoreProjects = createSelector(projects, state => state.noMoreProjects);
export const selectProjectsScrollId = createSelector(projects, (state): string => state?.scrollId || null);
export const selectTableModeAwareness = createSelector(projects, state => state?.tableModeAwareness);
export const selectShowPipelineExamples = createSelector(projects, state => state?.showPipelineExamples);
export const selectShowDatasetExamples = createSelector(projects, state => state?.showDatasetExamples);
