import {createFeatureSelector, createSelector} from '@ngrx/store';
import {Project} from '../../business-logic/model/projects/project';
import {TABLE_SORT_ORDER, TableSortOrderEnum} from '../shared/ui-components/data/table/table.consts';
import {PROJECTS_ACTIONS} from './common-projects.consts';

export interface IProjectReadyForDeletion {
  experiments: number;
  models: number;
}

export interface ICommonProjectsState {
  orderBy: string;
  sortOrder: TableSortOrderEnum;
  searchQuery: string;
  data: Project[];
  projectsNonFilteredList: Project[];
  selectedProjectId: string;
  selectedProject: Project;
  projectReadyForDeletion: IProjectReadyForDeletion;
  noMoreProjects: boolean;
  page: number;
}

export const commonProjectsInitState: ICommonProjectsState = {
  data                   : [],
  selectedProjectId      : '',
  selectedProject        : {},
  orderBy                : 'last_update',
  sortOrder              : TABLE_SORT_ORDER.DESC,
  searchQuery            : '',
  projectsNonFilteredList: [],
  projectReadyForDeletion: {
    experiments: null, models: null
  },
  noMoreProjects         : true,
  page                   : 0,
};

// todo: where to put it?
const getCorrectSortingOrder = (currentSortOrder: TableSortOrderEnum, currentOrderField: string, nextOrderField: string) => {
  if (currentOrderField === nextOrderField) {
    return currentSortOrder === TABLE_SORT_ORDER.DESC ? TABLE_SORT_ORDER.ASC : TABLE_SORT_ORDER.DESC;
  } else {
    return nextOrderField === 'last_update' ? TABLE_SORT_ORDER.DESC : TABLE_SORT_ORDER.ASC;
  }
};

export function commonProjectsReducer<ActionReducer>(state: ICommonProjectsState = commonProjectsInitState, action): ICommonProjectsState {

  switch (action.type) {

    case PROJECTS_ACTIONS.SET_PROJECTS:
      return {...state, data: action.payload.projects};
    case PROJECTS_ACTIONS.ADD_TO_PROJECTS_LIST:
      return {...state, data: state.data.concat(action.payload.projects)};
    case PROJECTS_ACTIONS.SET_NEXT_PAGE:
      return {...state, page: action.payload};
    case PROJECTS_ACTIONS.SET_NO_MORE_PROJECTS:
      return {...state, noMoreProjects: action.payload};
    case PROJECTS_ACTIONS.SET_PROJECTS_NON_FILTERED_LIST:
      return {...state, projectsNonFilteredList: action.payload.projects};
    case PROJECTS_ACTIONS.UPDATE_ONE_PROJECT:
      return {
        ...state, data:
          state.data.map(ex => ex.id === action.payload.id ? {...ex, ...action.payload.changes} : ex)
      };

    case PROJECTS_ACTIONS.SET_PROJECT_BY_ID: {
      const selectedProjectIndex3 = state.data.findIndex(project => project.id === action.payload.res.project.id);
      const projectListInst = [...state.data];
      projectListInst[selectedProjectIndex3] = Object.assign({}, state.data[selectedProjectIndex3], action.payload.res.project);
      return {...state, selectedProject: action.payload.res.project, data: projectListInst};
    }
    case PROJECTS_ACTIONS.SELECT_PROJECT: {
      const selectedProjectIndex2 = state.data.findIndex(project =>
        project.id === action.payload.projectId
      );
      const selectedProject2 = state.data[selectedProjectIndex2];
      return {...state, selectedProjectId: action.payload.projectId, selectedProject: selectedProject2};
    }
    case PROJECTS_ACTIONS.CREATE_PROJECT_SUCCESS:
      return {...state, selectedProjectId: action.payload.projectId};

    case PROJECTS_ACTIONS.SELECT_ALL_PROJECTS:
      return {...state, selectedProjectId: null, selectedProject: {}};
    case PROJECTS_ACTIONS.DELETE_PROJECT:
      return {...state, page: 0, noMoreProjects: false, data: []};
    case PROJECTS_ACTIONS.SET_ORDER_BY:
      return {...state, orderBy: action.payload.orderBy, sortOrder: getCorrectSortingOrder(state.sortOrder, state.orderBy, action.payload.orderBy), page: 0, noMoreProjects: false, data: []};
    case PROJECTS_ACTIONS.SET_SEARCH_QUERY:
      return {...state, searchQuery: action.payload.searchQuery, page: 0, noMoreProjects: false, data: []};
    case PROJECTS_ACTIONS.RESET_SEARCH_QUERY:
      return {...state, searchQuery: '', page: 0, noMoreProjects: false, data: []};
    case PROJECTS_ACTIONS.CHECK_PROJECT_FOR_DELETION:
    case PROJECTS_ACTIONS.RESET_READY_TO_DELETE:
      return {...state, projectReadyForDeletion: commonProjectsInitState.projectReadyForDeletion};
    case PROJECTS_ACTIONS.SET_PROJECT_READY_FOR_DELETION:
      return {...state, projectReadyForDeletion: {...state.projectReadyForDeletion, ...action.payload.readyForDeletion}};
    default:
      return state;
  }
}

export const selectProjects                = createFeatureSelector<ICommonProjectsState>('projects');
// TODO what to do?
export const selectProjectsData            = createSelector(selectProjects, (state: ICommonProjectsState): Array<Project> => state ? state.data : []);
export const selectNonFilteredProjectsList = createSelector(selectProjects, (state: ICommonProjectsState): Array<Project> => state ? state.projectsNonFilteredList : []);
// export const selectSelectedProjectId = createSelector(selectRouterParams, (params: any) => params ? params.projectId : '');
export const selectProjectsOrderBy         = createSelector(selectProjects, (state: ICommonProjectsState): string => state ? state.orderBy : '');
export const selectProjectsSortOrder       = createSelector(selectProjects, (state: ICommonProjectsState): TableSortOrderEnum => state ? state.sortOrder : TABLE_SORT_ORDER.DESC);
export const selectProjectsSearchQuery     = createSelector(selectProjects, (state: ICommonProjectsState): string => state ? state.searchQuery : '');
export const selectPojectReadyForDeletion  = createSelector(selectProjects, (state: ICommonProjectsState): IProjectReadyForDeletion => state.projectReadyForDeletion);
export const selectNoMoreProjects          = createSelector(selectProjects, (state: ICommonProjectsState): boolean => state.noMoreProjects);
export const selectProjectsPage            = createSelector(selectProjects, (state: ICommonProjectsState): number => state.page);

// export const selectSelectedProjectId = createSelector(selectProjects, (state: ICommonProjectsState): string => state ? state.selectedProjectId : '');
// export const selectSelectedProject = createSelector(selectProjects, (state: ICommonProjectsState): Project => state ? state.selectedProject : {});
