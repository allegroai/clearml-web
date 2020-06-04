import {ISmAction} from '../core/models/actions';
import {ProjectsUpdateRequest} from '../../business-logic/model/projects/projectsUpdateRequest';
import {ProjectsGetAllRequest} from '../../business-logic/model/projects/projectsGetAllRequest';
import {ProjectsGetByIdRequest} from '../../business-logic/model/projects/projectsGetByIdRequest';
import {ProjectsGetByIdResponse} from '../../business-logic/model/projects/projectsGetByIdResponse';
import {Project} from '../../business-logic/model/projects/project';
import {Action} from '@ngrx/store';
import {PROJECTS_ACTIONS} from './common-projects.consts';

export class ProjectUpdated implements ISmAction {
  public type = PROJECTS_ACTIONS.PROJECT_UPDATED;
  public payload: { updatedData: ProjectsUpdateRequest };

  constructor(updatedData: ProjectsUpdateRequest) {
    this.payload = {updatedData};
  }
}

export class UpdateProjectPartial implements Action {
  readonly type = PROJECTS_ACTIONS.UPDATE_ONE_PROJECT;

  constructor(public payload: { id: Project['id']; changes: ProjectsUpdateRequest }) {
  }
}


export class GetProjectByID implements ISmAction {
  public type = PROJECTS_ACTIONS.GET_PROJECT_BY_ID;
  public payload: { getByIdRequest: ProjectsGetByIdRequest };

  constructor(getByIdRequest: ProjectsGetByIdRequest) {
    this.payload = {getByIdRequest};
  }
}

export class SetProjectInSelectedAndInList implements ISmAction {
  public type = PROJECTS_ACTIONS.SET_PROJECT_BY_ID;
  public payload: { res: ProjectsGetByIdResponse };

  constructor(res: ProjectsGetByIdResponse) {
    this.payload = {res};
  }
}

export class GetAllProjects implements ISmAction {
  public type = PROJECTS_ACTIONS.GET_PROJECTS;
  public payload: { getAllFilter: ProjectsGetAllRequest };

  constructor(getAllFilter?: ProjectsGetAllRequest) {
    this.payload = {getAllFilter};
  }
}

export class SetProjectsOrderBy implements ISmAction {
  public type = PROJECTS_ACTIONS.SET_ORDER_BY;
  public payload: { orderBy: string }; // TODO: specify enum!!

  constructor(orderBy: string = '') {
    this.payload = {orderBy};
  }
}

export class SetProjectsSearchQuery implements ISmAction {
  public type = PROJECTS_ACTIONS.SET_SEARCH_QUERY;
  public payload: { searchQuery: string };

  constructor(searchQuery: string = null) {
    this.payload = {searchQuery};
  }
}

export class ResetProjectsSearchQuery implements ISmAction {
  public type = PROJECTS_ACTIONS.RESET_SEARCH_QUERY;
}

export class SetProjects implements ISmAction {
  public type = PROJECTS_ACTIONS.SET_PROJECTS;
  public payload: { projects: Array<Project> };

  constructor(projects: Array<Project>) {
    this.payload = {projects};
  }
}

export class AddToProjectsList implements ISmAction {
  public type = PROJECTS_ACTIONS.ADD_TO_PROJECTS_LIST;
  public payload: { projects: Array<Project> };

  constructor(projects: Array<Project>) {
    this.payload = {projects};
  }
}

export class DeleteProject implements ISmAction {
  public type = PROJECTS_ACTIONS.DELETE_PROJECT;
  public payload: { projectId: string };

  constructor(projectId: string) {
    this.payload = {projectId};
  }
}

export class CheckProjectForDeletion implements ISmAction {
  public type = PROJECTS_ACTIONS.CHECK_PROJECT_FOR_DELETION;
  public payload: { projectId: string };

  constructor(projectId: string) {
    this.payload = {projectId};
  }
}

export class SetProjectReadyForDeletion implements ISmAction {
  public type = PROJECTS_ACTIONS.SET_PROJECT_READY_FOR_DELETION;
  public payload: { readyForDeletion: any };

  constructor(readyForDeletion: any) {
    this.payload = {readyForDeletion};
  }
}

export class SelectAllProjects implements ISmAction {
  public type = PROJECTS_ACTIONS.SELECT_ALL_PROJECTS;
}

export class ResetReadyToDelete implements ISmAction {
  public type = PROJECTS_ACTIONS.RESET_READY_TO_DELETE;
}

export class SetNoMoreProjects implements Action {
  readonly type = PROJECTS_ACTIONS.SET_NO_MORE_PROJECTS;
  constructor(public payload: boolean) {
  }
}

export class SetCurrentProjectsPage implements Action {
  public type = PROJECTS_ACTIONS.SET_NEXT_PAGE;

  constructor(public payload: number) {
  }
}

export class GetNextProjects implements Action {
  readonly type = PROJECTS_ACTIONS.GET_NEXT_PROJECTS;
}


// export class SelectProject implements ISmAction {
//   public type = PROJECTS_ACTIONS.SELECT_PROJECT;
//   public payload: { projectId: string | null };
//
//   constructor(projectId = null) {
//     this.payload = {projectId};
//   }
// }
