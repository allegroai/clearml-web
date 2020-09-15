import {Action} from '@ngrx/store';
import {ISmAction} from '../core/models/actions';
import {SEARCH_ACTIONS} from './common-search-results.consts';
import {Project} from '../../business-logic/model/projects/project';
import {Task} from '../../business-logic/model/tasks/task';
import {Model} from '../../business-logic/model/models/model';


export class SearchSetTerm implements ISmAction {
  readonly type = SEARCH_ACTIONS.SET_TERM;

  constructor(public payload: string, private force?: boolean) {
  }
}

export class SearchStart implements ISmAction {
  readonly type = SEARCH_ACTIONS.SEARCH_START;

  constructor(public payload: string, public force?: boolean) {
  }
}





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

export class SearchProjects implements ISmAction {
  readonly type = SEARCH_ACTIONS.SEARCH_PROJECTS;

  constructor(public payload: string) {
  }
}

export class SetProjectsResults implements ISmAction {
  public type = SEARCH_ACTIONS.SET_PROJECTS;
  public payload: { projects: Array<Project> };

  constructor(projects: Array<Project>) {
    this.payload = {projects};
  }
}

export class SearchExperiments implements ISmAction {
  readonly type = SEARCH_ACTIONS.SEARCH_EXPERIMENTS;

  constructor(public payload: string) {
  }
}

export class SetExperimentsResults implements ISmAction {
  public type = SEARCH_ACTIONS.SET_EXPERIMENTS;
  public payload: { experiments: Array<Task> };

  constructor(experiments: Array<Task>) {
    this.payload = {experiments};
  }
}

export class SearchModels implements ISmAction {
  readonly type = SEARCH_ACTIONS.SEARCH_MODELS;

  constructor(public payload: string) {
  }
}

export class SetModelsResults implements ISmAction {
  public type = SEARCH_ACTIONS.SET_MODELS;
  public payload: { models: Array<Model> };

  constructor(models: Array<Model>) {
    this.payload = {models};
  }
}

