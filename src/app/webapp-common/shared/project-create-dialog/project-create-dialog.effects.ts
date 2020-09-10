import * as createNewProjectActions from './project-create-dialog.actions';
import {CREATE_PROJECT_ACTIONS} from './project-create-dialog.actions';
import {MESSAGES_SEVERITY} from '../../../app.constants';
import {ActiveLoader, AddMessage, DeactiveLoader} from '../../core/actions/layout.actions';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {ApiProjectsService} from '../../../business-logic/api-services/projects.service';
import {RequestFailed} from '../../core/actions/http.actions';
import {Injectable} from '@angular/core';
import {CREATION_STATUS} from './project-create-dialog.reducer';
import {catchError, filter, flatMap, map, switchMap} from 'rxjs/operators';
import {Router} from '@angular/router';

@Injectable()
export class ProjectCreateDialogEffects {
  constructor(private actions: Actions, private projectsApiService: ApiProjectsService, private router: Router) {
  }

  @Effect()
  activeLoader = this.actions.pipe(
    ofType(CREATE_PROJECT_ACTIONS.CREATE_NEW_PROJECT),
    map(action => new ActiveLoader(action.type))
  );

  @Effect({dispatch: false})
  NavigateToNewProject = this.actions.pipe(
    ofType<createNewProjectActions.NavigateToNewProject>(CREATE_PROJECT_ACTIONS.NAVIGATE_TO_NEW_PROJECT),
    filter(action => !!action.payload),
    map((action) => this.router.navigateByUrl(`projects/${action.payload}`))
  );

  @Effect()
  createProject = this.actions.pipe(
    ofType<createNewProjectActions.CreateNewProject>(CREATE_PROJECT_ACTIONS.CREATE_NEW_PROJECT),
    flatMap((action) => this.projectsApiService.projectsCreate(action.payload)
      .pipe(
        flatMap(res => [
          new DeactiveLoader(action.type),
          new createNewProjectActions.SetNewProjectCreationStatus(CREATION_STATUS.SUCCESS),
          new AddMessage(MESSAGES_SEVERITY.SUCCESS, 'Project Created Successfully'),
          new createNewProjectActions.NavigateToNewProject(res.id)
        ]),
        catchError(error => [new DeactiveLoader(action.type), new RequestFailed(error), new AddMessage(MESSAGES_SEVERITY.ERROR, 'Project Created Failed'), new createNewProjectActions.SetNewProjectCreationStatus(CREATION_STATUS.FAILED)])
      )
    )
  );

  @Effect()
  getAllProjects = this.actions.pipe(
    ofType<createNewProjectActions.GetProjects>(CREATE_PROJECT_ACTIONS.GET_PROJECTS),
    switchMap(action => this.projectsApiService.projectsGetAllEx({only_fields:['name']})
      .pipe(
        flatMap(res => [new createNewProjectActions.SetProjects(res.projects)]),
        catchError(error => [new RequestFailed(error)])
      )
    )
  );
}
