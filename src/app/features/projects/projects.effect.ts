import {Actions, createEffect, ofType} from '@ngrx/effects';
import {checkProjectForDeletion, setProjectReadyForDeletion} from '@common/projects/common-projects.actions';
import {mergeMap, switchMap} from 'rxjs/operators';
import {ProjectsValidateDeleteResponse} from '~/business-logic/model/projects/projectsValidateDeleteResponse';
import {Injectable} from '@angular/core';
import {ApiProjectsService} from '~/business-logic/api-services/projects.service';
import {ApiModelsService} from '~/business-logic/api-services/models.service';

@Injectable()
export class ProjectsEffects {

  constructor(
    private actions: Actions, public projectsApi: ApiProjectsService,
    public modelsApi: ApiModelsService,
  ) {}
  checkIfProjectExperiments = createEffect(() => this.actions.pipe(
    ofType(checkProjectForDeletion),
    switchMap((action) => this.projectsApi.projectsValidateDelete({project: action.project.id})),
    mergeMap((projectsValidateDeleteResponse: ProjectsValidateDeleteResponse) => [
      setProjectReadyForDeletion({
        readyForDeletion: {
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
        }
      })
    ])
  ));
}
