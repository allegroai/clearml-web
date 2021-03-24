import {Action, createAction, props} from '@ngrx/store';
import {Project} from '../../../business-logic/model/projects/project';
import {ISmAction} from '../models/actions';
import {ProjectsUpdateRequest} from '../../../business-logic/model/projects/projectsUpdateRequest';

export const PROJECTS_PREFIX = '[ROOT_PROJECTS] ';
export const GET_PROJECTS = PROJECTS_PREFIX + 'GET_PROJECTS';
export const SET_PROJECTS = PROJECTS_PREFIX + 'SET_PROJECTS';
export const SET_SELECTED_PROJECT = PROJECTS_PREFIX + 'SET_SELECTED_PROJECT';
export const SET_SELECTED_PROJECT_ID = PROJECTS_PREFIX + 'SET_SELECTED_PROJECT_ID';
export const RESET_SELECTED_PROJECT = PROJECTS_PREFIX + 'RESET_SELECTED_PROJECT';
export const RESET_PROJECT_SELECTION = PROJECTS_PREFIX + 'RESET_PROJECT_SELECTION';
export const UPDATE_PROJECT = PROJECTS_PREFIX + 'UPDATE_PROJECT';
export const UPDATE_PROJECT_COMPLETED = PROJECTS_PREFIX + 'UPDATE_PROJECT_COMPLETED';

export interface TagColor {
  foreground: string;
  background: string;
}

export class GetAllProjects implements ISmAction {
  readonly type = GET_PROJECTS;

  constructor() {
  }
}

export class UpdateProject implements Action {
  readonly type = UPDATE_PROJECT;

  constructor(public payload: { id: Project['id']; changes: Partial<ProjectsUpdateRequest> }) {
  }
}

export class SetAllProjects implements ISmAction {
  readonly type = SET_PROJECTS;

  constructor(public payload: Array<Project>) {
  }
}

export class UpdateProjectCompleted implements ISmAction {
  readonly type = UPDATE_PROJECT_COMPLETED;
}

export class SetSelectedProjectId implements ISmAction {
  readonly type = SET_SELECTED_PROJECT_ID;
  public payload: { projectId: string };

  constructor(projectId: string) {
    this.payload = {projectId};
  }
}

export class SetSelectedProject implements ISmAction {
  readonly type = SET_SELECTED_PROJECT;
  public payload: { project: Project };

  constructor(project: Project) {
    this.payload = {project};
  }
}

export class ResetSelectedProject implements ISmAction {
  readonly type = RESET_SELECTED_PROJECT;
}


export class ResetProjectSelection implements ISmAction {
  readonly type = RESET_PROJECT_SELECTION;
}

export const setArchive = createAction(
  PROJECTS_PREFIX + 'SET_ARCHIVE',
  props<{ archive: boolean }>()
);

export const getTags = createAction(PROJECTS_PREFIX + '[get tags]');
export const getCompanyTags = createAction(PROJECTS_PREFIX + '[get company tags]');
export const setTagsFilterByProject = createAction(PROJECTS_PREFIX + '[set tags filter by project]', props<{ tagsFilterByProject: boolean }>());
export const setTags = createAction(PROJECTS_PREFIX + '[set tags]', props<{ tags: string[] }>());
export const setCompanyTags = createAction(PROJECTS_PREFIX + '[set company tags]', props<{ tags: string[]; systemTags: string[] }>());
export const openTagColorsMenu = createAction(PROJECTS_PREFIX + '[open tag colors]');

export const setTagColors = createAction(
  PROJECTS_PREFIX + '[set tag colors]',
  props<{ tag: string; colors: TagColor }>()
);
