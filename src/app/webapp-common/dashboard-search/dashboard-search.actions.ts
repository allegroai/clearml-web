import {Action, createAction, props} from '@ngrx/store';
import {ISmAction} from '../core/models/actions';
import {SEARCH_ACTIONS} from './dashboard-search.consts';
import {Project} from '../../business-logic/model/projects/project';
import {Task} from '../../business-logic/model/tasks/task';
import {Model} from '../../business-logic/model/models/model';


export const searchSetTerm = createAction(
  SEARCH_ACTIONS.SET_TERM,
  props<{query: string; regExp?: boolean; force?: boolean}>()
);

export const searchStart = createAction(
  SEARCH_ACTIONS.SEARCH_START,
  props<{query: string; regExp?: boolean; force?: boolean}>()
);

export class SearchError implements ISmAction {
  readonly type = SEARCH_ACTIONS.SEARCH_ERROR;
}

export class SearchClear implements Action {
  readonly type = SEARCH_ACTIONS.SEARCH_CLEAR;
}

export class SearchActivate implements Action {
  readonly type = SEARCH_ACTIONS.ACTIVATE;
}

export class SearchDeactivate implements Action {
  readonly type = SEARCH_ACTIONS.DEACTIVATE;
}

export const searchProjects = createAction(
  SEARCH_ACTIONS.SEARCH_PROJECTS,
  props<{query: string; regExp?: boolean}>()
);

export class SetProjectsResults implements ISmAction {
  public type = SEARCH_ACTIONS.SET_PROJECTS;
  public payload: { projects: Array<Project> };

  constructor(projects: Array<Project>) {
    this.payload = {projects};
  }
}

export const searchExperiments= createAction(
  SEARCH_ACTIONS.SEARCH_EXPERIMENTS,
  props<{query: string; regExp?: boolean}>()
);

export class SetExperimentsResults implements ISmAction {
  public type = SEARCH_ACTIONS.SET_EXPERIMENTS;
  public payload: { experiments: Array<Task> };

  constructor(experiments: Array<Task>) {
    this.payload = {experiments};
  }
}

export const searchModels = createAction(
  SEARCH_ACTIONS.SEARCH_MODELS,
  props<{query: string; regExp?: boolean}>()
);

export class SetModelsResults implements ISmAction {
  public type = SEARCH_ACTIONS.SET_MODELS;
  public payload: { models: Array<Model> };

  constructor(models: Array<Model>) {
    this.payload = {models};
  }
}

