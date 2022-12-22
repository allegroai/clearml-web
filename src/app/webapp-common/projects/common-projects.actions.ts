import {Project} from '~/business-logic/model/projects/project';
import {createAction, props} from '@ngrx/store';
import {PROJECTS_PREFIX} from './common-projects.consts';

export const updateProject = createAction(
  PROJECTS_PREFIX + '[update project]',
  props<{id: string; changes: Partial<Project>}>()
);
export const updateProjectSuccess = createAction(
  PROJECTS_PREFIX + '[update project success]',
  props<{id: string; changes: Partial<Project>}>()
);
export const getAllProjectsPageProjects = createAction(
  PROJECTS_PREFIX + 'GET_PROJECTS'
);
export const setProjectsOrderBy = createAction(
  PROJECTS_PREFIX + 'SET_ORDER_BY',
  props<{orderBy: string}>()
);
export const setProjectsSearchQuery = createAction(
  PROJECTS_PREFIX + 'SET_SEARCH_QUERY',
  props<{query: string; regExp?: boolean}>()
);
export const resetProjectsSearchQuery = createAction(PROJECTS_PREFIX + 'RESET_SEARCH_QUERY');
export const addToProjectsList = createAction(
  PROJECTS_PREFIX + 'ADD_TO_PROJECTS_LIST',
  props<{projects: Project[]; reset?: boolean}>()
);
export const resetProjects = createAction(PROJECTS_PREFIX + 'RESET_PROJECTS');

export const checkProjectForDeletion = createAction(
  PROJECTS_PREFIX + 'CHECK_PROJECT_FOR_DELETION',
  props<{project: Project}>()
);
export const setProjectReadyForDeletion= createAction(
  PROJECTS_PREFIX + 'SET_PROJECT_READY_FOR_DELETION',
  props<{readyForDeletion}>()
);
export const resetReadyToDelete = createAction(PROJECTS_PREFIX + 'RESET_READY_TO_DELETE');

export const setNoMoreProjects = createAction(
  PROJECTS_PREFIX + 'SET_NO_MORE_PROJECTS',
  props<{payload: boolean}>()
);
export const setCurrentScrollId = createAction(
  PROJECTS_PREFIX + ' [set current scrollId]',
  props<{scrollId: string}>()
);
export const setTableModeAwareness = createAction(
  PROJECTS_PREFIX + '[set table mode awareness]',
  props<{awareness: boolean}>()
);
export const showExamplePipelines = createAction(PROJECTS_PREFIX + '[show pipelines examples]');
export const showExampleDatasets = createAction(PROJECTS_PREFIX + '[show datasets examples]');

