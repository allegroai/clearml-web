import * as createNewProjectActions from './project-dialog.actions';
import {CREATE_PROJECT_ACTIONS} from './project-dialog.actions';
import {activeLoader, addMessage, deactivateLoader} from '../../core/actions/layout.actions';
import {Actions, createEffect, Effect, ofType} from '@ngrx/effects';
import {ApiProjectsService} from '~/business-logic/api-services/projects.service';
import {requestFailed} from '../../core/actions/http.actions';
import {Injectable} from '@angular/core';
import {CREATION_STATUS} from './project-dialog.reducer';
import {catchError, filter, map, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {Router} from '@angular/router';
import {getAllSystemProjects} from '../../core/actions/projects.actions';
import {Store} from '@ngrx/store';
import {selectActiveWorkspace} from '../../core/reducers/users-reducer';
import {ShortProjectNamePipe} from '../pipes/short-project-name.pipe';
import {ProjectLocationPipe} from '../pipes/project-location.pipe';
import {MESSAGES_SEVERITY} from '@common/constants';

@Injectable()
export class ProjectDialogEffects {
  constructor(
    private actions: Actions,
    private projectsApiService: ApiProjectsService,
    private router: Router,
    private store: Store<any>,
    private shortProjectName: ShortProjectNamePipe,
    private projectLocation: ProjectLocationPipe
  ) {
  }

  @Effect()
  activeLoader = this.actions.pipe(
    ofType(CREATE_PROJECT_ACTIONS.CREATE_NEW_PROJECT),
    map(action => activeLoader(action.type))
  );

  @Effect({dispatch: false})
  navigateToNewProject = this.actions.pipe(
    ofType<createNewProjectActions.NavigateToNewProject>(CREATE_PROJECT_ACTIONS.NAVIGATE_TO_NEW_PROJECT),
    filter(action => !!action.payload),
    map((action) => this.router.navigateByUrl(`projects/${action.payload}`))
  );

  @Effect()
  createProject = this.actions.pipe(
    ofType<createNewProjectActions.CreateNewProject>(CREATE_PROJECT_ACTIONS.CREATE_NEW_PROJECT),
    withLatestFrom(this.store.select(selectActiveWorkspace)),
    switchMap(([action]) => this.projectsApiService.projectsCreate(action.payload)
      .pipe(
        mergeMap(() => [
            deactivateLoader(action.type),
            new createNewProjectActions.SetNewProjectCreationStatus(CREATION_STATUS.SUCCESS),
            getAllSystemProjects(),
            addMessage(MESSAGES_SEVERITY.SUCCESS, `${this.shortProjectName.transform(action.payload.name)} has been created successfully in ${this.projectLocation.transform(action.payload.name)}`),
          ]
        ),
        catchError(error => [deactivateLoader(action.type), requestFailed(error), addMessage(MESSAGES_SEVERITY.ERROR, 'Project Created Failed'), new createNewProjectActions.SetNewProjectCreationStatus(CREATION_STATUS.FAILED)])
      )
    )
  );

  moveProject = createEffect(() => this.actions.pipe(
    ofType(createNewProjectActions.moveProject),
    withLatestFrom(this.store.select(selectActiveWorkspace)),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    switchMap(([action]) => this.projectsApiService.projectsMove({project: action.project, new_location: action.new_location})
      .pipe(
        mergeMap(() => [
            deactivateLoader(action.type),
            new createNewProjectActions.SetNewProjectCreationStatus(CREATION_STATUS.SUCCESS),
            getAllSystemProjects(),
            addMessage(MESSAGES_SEVERITY.SUCCESS, `${action.projectName} has been moved from ${action.fromName} to ${action.toName}`),
          ]
        ),
        catchError(error => [deactivateLoader(action.type), requestFailed(error), addMessage(MESSAGES_SEVERITY.ERROR, 'Project Move Failed'), new createNewProjectActions.SetNewProjectCreationStatus(CREATION_STATUS.FAILED)])
      )
    )
  ));
}
