import {Actions, createEffect, ofType} from '@ngrx/effects';
import {CheckProjectForDeletion, SetProjectReadyForDeletion} from '../../webapp-common/projects/common-projects.actions';
import {PROJECTS_ACTIONS} from '../../webapp-common/projects/common-projects.consts';
import {mergeMap, switchMap} from 'rxjs/operators';
import {ProjectsValidateDeleteResponse} from '../../business-logic/model/projects/projectsValidateDeleteResponse';
import {Injectable} from '@angular/core';
import {ApiProjectsService} from '../../business-logic/api-services/projects.service';
import {ApiTasksService} from '../../business-logic/api-services/tasks.service';
import {ApiModelsService} from '../../business-logic/api-services/models.service';
import {Store} from '@ngrx/store';

@Injectable()
export class ProjectsEffects {

  constructor(
    private actions: Actions, public projectsApi: ApiProjectsService,
    public experimentsApi: ApiTasksService, public modelsApi: ApiModelsService,
    private store: Store<any>
  ) {}
  checkIfProjectExperiments = createEffect(() => this.actions.pipe(
    ofType<CheckProjectForDeletion>(PROJECTS_ACTIONS.CHECK_PROJECT_FOR_DELETION),
    switchMap((action) => this.projectsApi.projectsValidateDelete({project: action.payload.project.id})),
    mergeMap((projectsValidateDeleteResponse: ProjectsValidateDeleteResponse) => [
      new SetProjectReadyForDeletion({
        experiments: {
          total: projectsValidateDeleteResponse.tasks,
          archived: projectsValidateDeleteResponse.tasks - projectsValidateDeleteResponse.non_archived_tasks,
          unarchived: projectsValidateDeleteResponse.non_archived_tasks
        },
        models: {
          total: projectsValidateDeleteResponse.models,
          archived: projectsValidateDeleteResponse.models - projectsValidateDeleteResponse.non_archived_models,
          unarchived: projectsValidateDeleteResponse.non_archived_models
        }
      })
    ])
  ));
}
