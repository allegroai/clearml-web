import {createSelector} from '@ngrx/store';
import {Project} from '../../business-logic/model/projects/project';
import {TABLE_SORT_ORDER, TableSortOrderEnum} from '../shared/ui-components/data/table/table.consts';
import {PROJECTS_ACTIONS} from './common-projects.consts';
import {setCurrentScrollId, setProjectsSearchQuery} from './common-projects.actions';
import {ICommonSearchState} from '../common-search/common-search.reducer';
import {selectSelectedProject} from "@common/core/reducers/projects.reducer";

export interface CommonProjectReadyForDeletion {
  project: Project;
  experiments: {archived: number; unarchived: number};
  models: {archived: number; unarchived: number};
}

export interface ICommonProjectsState {
  orderBy: string;
  sortOrder: TableSortOrderEnum;
  searchQuery: ICommonSearchState['searchQuery'];
  data: Project[];
  projectsNonFilteredList: Project[];
  selectedProjectId: string;
  selectedProject: Project;
  projectReadyForDeletion: CommonProjectReadyForDeletion;
  noMoreProjects: boolean;
  scrollId: string;
}

export const commonProjectsInitState: ICommonProjectsState = {
  data: [],
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
};

const getCorrectSortingOrder = (currentSortOrder: TableSortOrderEnum, currentOrderField: string, nextOrderField: string) => {
  if (currentOrderField === nextOrderField) {
    return currentSortOrder === TABLE_SORT_ORDER.DESC ? TABLE_SORT_ORDER.ASC : TABLE_SORT_ORDER.DESC;
  } else {
    return nextOrderField === 'last_update' ? TABLE_SORT_ORDER.DESC : TABLE_SORT_ORDER.ASC;
  }
};

export const commonProjectsReducer = (state: ICommonProjectsState = commonProjectsInitState, action): ICommonProjectsState => {

  switch (action.type) {

    case PROJECTS_ACTIONS.SET_PROJECTS:
      return {...state, data: action.payload.projects};
    case PROJECTS_ACTIONS.ADD_TO_PROJECTS_LIST:
      return {...state, data: state.data.concat(action.payload.projects)};
    case setCurrentScrollId.type:
      return {...state, scrollId: action.scrollId};
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
      const selectedProjectIndex = state.data.findIndex(project => project.id === action.payload.res.project.id);
      const projectListInst = [...state.data];
      projectListInst[selectedProjectIndex] = Object.assign({}, state.data[selectedProjectIndex], action.payload.res.project);
      return {...state, selectedProject: action.payload.res.project, data: projectListInst};
    }
    case PROJECTS_ACTIONS.SELECT_PROJECT: {
      const selectedProjectIndex = state.data.findIndex(project =>
        project.id === action.payload.projectId
      );
      const selectedProject = state.data[selectedProjectIndex];
      return {...state, selectedProjectId: action.payload.projectId, selectedProject};
    }
    case PROJECTS_ACTIONS.CREATE_PROJECT_SUCCESS:
      return {...state, selectedProjectId: action.payload.projectId};
    case PROJECTS_ACTIONS.SELECT_ALL_PROJECTS:
      return {...state, selectedProjectId: null, selectedProject: {}};
      // TODO: do we need to reset this in new delete?
    case PROJECTS_ACTIONS.RESET_PROJECTS:
      return {...state, scrollId: null, noMoreProjects: false, data: []};
    case PROJECTS_ACTIONS.SET_ORDER_BY:
      return {...state, orderBy: action.payload.orderBy, sortOrder: getCorrectSortingOrder(state.sortOrder, state.orderBy, action.payload.orderBy), scrollId: null, noMoreProjects: false, data: []};
    case setProjectsSearchQuery.type:
      return {...state, searchQuery: (action as ReturnType<typeof setProjectsSearchQuery>), scrollId: null, noMoreProjects: false, data: []};
    case PROJECTS_ACTIONS.RESET_SEARCH_QUERY:
      return {...state, searchQuery: commonProjectsInitState.searchQuery, scrollId: null, noMoreProjects: false, data: []};
    case PROJECTS_ACTIONS.CHECK_PROJECT_FOR_DELETION:
      return {...state, projectReadyForDeletion: {...commonProjectsInitState.projectReadyForDeletion, project: action.payload.project}};
    case PROJECTS_ACTIONS.RESET_READY_TO_DELETE:
      return {...state, projectReadyForDeletion: commonProjectsInitState.projectReadyForDeletion};
    case PROJECTS_ACTIONS.SET_PROJECT_READY_FOR_DELETION:
      return {...state, projectReadyForDeletion: {...state.projectReadyForDeletion, ...action.payload.readyForDeletion}};
    default:
      return state;
  }
};

export const projects = state => state.projects as ICommonProjectsState;


export const selectProjectsData = createSelector(projects, state => state?.data || []);
export const selectNonFilteredProjectsList = createSelector(projects, state => state?.projectsNonFilteredList || []);
// export const selectSelectedProjectId = createSelector(selectRouterParams, (params: any) => params ? params.projectId : '');
export const selectProjectsOrderBy = createSelector(projects, state => state?.orderBy || '');
export const selectProjectsSortOrder = createSelector(projects, state => state?.sortOrder || TABLE_SORT_ORDER.DESC);
export const selectProjectsSearchQuery = createSelector(projects, state => state?.searchQuery);
export const selectProjectReadyForDeletion = createSelector(projects, state => state?.projectReadyForDeletion);
export const selectProjectForDelete = createSelector(projects, state => [state?.projectReadyForDeletion.project]);
export const selectNoMoreProjects = createSelector(projects, state => state.noMoreProjects);
export const selectProjectsScrollId = createSelector(projects, (state): string => state?.scrollId || null);
