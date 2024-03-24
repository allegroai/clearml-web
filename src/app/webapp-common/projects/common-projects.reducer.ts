import {ActionCreator, createReducer, createSelector, on, ReducerTypes} from '@ngrx/store';
import {Project} from '~/business-logic/model/projects/project';
import {TABLE_SORT_ORDER, TableSortOrderEnum} from '../shared/ui-components/data/table/table.consts';
import {
  addToProjectsList,
  checkProjectForDeletion,
  resetProjects,
  resetProjectsSearchQuery,
  resetReadyToDelete,
  setCurrentScrollId,
  setNoMoreProjects,
  setProjectsOrderBy,
  setProjectsSearchQuery,
  setTableModeAwareness,
  showExampleDatasets,
  showExamplePipelines,
  updateProjectSuccess
} from './common-projects.actions';
import {SearchState} from '../common-search/common-search.reducer';

export interface CommonReadyForDeletion {
  experiments: { total: number; archived: number; unarchived: number };
  models: { total: number; archived: number; unarchived: number };
  reports: { total: number; archived: number; unarchived: number };
  pipelines: { total: number; unarchived: number };
  datasets: { total: number; unarchived: number };
}

export interface CommonProjectReadyForDeletion extends CommonReadyForDeletion {
  project: Project;
}

export interface CommonProjectsState {
  orderBy: string;
  sortOrder: TableSortOrderEnum;
  searchQuery: SearchState['searchQuery'];
  projects: Project[];
  projectsNonFilteredList: Project[];
  selectedProjectId: string;
  selectedProject: Project;
  projectReadyForDeletion: CommonReadyForDeletion;
  validatedProject: Project;
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
  projectReadyForDeletion: null,
  validatedProject: null,
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
  on(addToProjectsList, (state, action) => ({
    ...state,
    projects: action.reset ? action.projects : [...(state.projects || []), ...action.projects]
  })),
  on(setCurrentScrollId, (state, action) => ({...state, scrollId: action.scrollId})),
  on(setNoMoreProjects, (state, action) => ({...state, noMoreProjects: action.payload})),
  on(updateProjectSuccess, (state, action) => ({
    ...state, projects: state.projects?.map(pr => pr.id === action.id ? {
      ...pr,
      ...action.changes,
      ...(!!action.changes?.name && {basename: action.changes?.name.split('/').at(-1)})
    } : pr)
  })),
  on(resetProjects, state => ({
    ...state,
    scrollId: null,
    noMoreProjects: commonProjectsInitState.noMoreProjects,
    projects: commonProjectsInitState.projects
  })),
  on(setProjectsOrderBy, (state, action) => ({
    ...state,
    orderBy: action.orderBy,
    sortOrder: getCorrectSortingOrder(state.sortOrder, state.orderBy, action.orderBy),
    scrollId: null,
    noMoreProjects: commonProjectsInitState.noMoreProjects,
    projects: commonProjectsInitState.projects
  })),
  on(setProjectsSearchQuery, (state, action) => ({
    ...state,
    searchQuery: (action as ReturnType<typeof setProjectsSearchQuery>),
    scrollId: null,
    noMoreProjects: commonProjectsInitState.noMoreProjects,
    projects: commonProjectsInitState.projects
  })),
  on(resetProjectsSearchQuery, state => ({
    ...state,
    // searchQuery: commonProjectsInitState.searchQuery,
    scrollId: null,
    noMoreProjects: commonProjectsInitState.noMoreProjects,
    projects: commonProjectsInitState.projects
  })),
  on(checkProjectForDeletion, (state, action) => ({
    ...state,
    validatedProject: action.project,
    projectReadyForDeletion: commonProjectsInitState.projectReadyForDeletion
  })),
  on(resetReadyToDelete, state => ({
    ...state,
    projectReadyForDeletion: commonProjectsInitState.projectReadyForDeletion,
    validatedProject: commonProjectsInitState.validatedProject
  })),
  on(setTableModeAwareness, (state, action) =>
    ({...state, tableModeAwareness: (action as ReturnType<typeof setTableModeAwareness>).awareness})),
  on(showExamplePipelines, state => ({...state, showPipelineExamples: true})),
  on(showExampleDatasets, state => ({...state, showDatasetExamples: true}))
] as ReducerTypes<CommonProjectsState, ActionCreator[]>[];
export const commonProjectsReducer = createReducer(commonProjectsInitState, ...commonProjectsReducers);

export const projects = state => state.projects as CommonProjectsState;


export const selectProjects = createSelector(projects, state => state?.projects);
export const selectNonFilteredProjectsList = createSelector(projects, state => state?.projectsNonFilteredList || []);
// export const selectSelectedProjectId = createSelector(selectRouterParams, (params: any) => params ? params.projectId : '');
export const selectProjectsOrderBy = createSelector(projects, state => state?.orderBy || '');
export const selectProjectsSortOrder = createSelector(projects, state => state?.sortOrder || TABLE_SORT_ORDER.DESC);
export const selectProjectsSearchQuery = createSelector(projects, state => state?.searchQuery);
export const selectValidatedProject = createSelector(projects, state => state?.validatedProject);
export const selectReadyForDeletion = createSelector(projects, state =>
  state?.projectReadyForDeletion);
export const selectProjectReadyForDeletion = createSelector(selectValidatedProject, selectReadyForDeletion,
  (project, projectReadyForDeletion) => projectReadyForDeletion ? {...projectReadyForDeletion, project} : null);
export const selectProjectForDelete = createSelector(projects, state => state?.validatedProject ? [state?.validatedProject]: []);
export const selectNoMoreProjects = createSelector(projects, state => state?.noMoreProjects);
export const selectProjectsScrollId = createSelector(projects, (state): string => state?.scrollId || null);
export const selectTableModeAwareness = createSelector(projects, state => state?.tableModeAwareness);
export const selectShowPipelineExamples = createSelector(projects, state => state?.showPipelineExamples);
export const selectShowDatasetExamples = createSelector(projects, state => state?.showDatasetExamples);
