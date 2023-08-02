import {Actions, createEffect, ofType} from '@ngrx/effects';
import {checkProjectForDeletion} from '@common/projects/common-projects.actions';
import {mergeMap, switchMap} from 'rxjs/operators';
import {ProjectsValidateDeleteResponse} from '~/business-logic/model/projects/projectsValidateDeleteResponse';
import {Injectable} from '@angular/core';
import {ApiProjectsService} from '~/business-logic/api-services/projects.service';
import {ApiModelsService} from '~/business-logic/api-services/models.service';
import {setProjectReadyForDeletion} from '~/features/projects/projects.actions';

@Injectable()
export class ProjectsEffects {

  constructor(
    private actions: Actions, public projectsApi: ApiProjectsService,
    public modelsApi: ApiModelsService,
  ) {}
  checkIfProjectExperiments = createEffect(() => this.actions.pipe(
    ofType(checkProjectForDeletion),
    switchMap((action) => this.projectsApi.projectsValidateDelete({project: action.project.id})),
    mergeMap((res: ProjectsValidateDeleteResponse) => [
      setProjectReadyForDeletion({
        readyForDeletion: {
          experiments: {
            total: res.tasks,
            archived: res.tasks - res.non_archived_tasks,
            unarchived: res.non_archived_tasks
          },
          models: {
            total: res.models,
            archived: res.models - res.non_archived_models,
            unarchived: res.non_archived_models
          },
          reports: {
            total: res.reports,
            archived: res.reports - res.non_archived_reports,
            unarchived: res.non_archived_reports
          },
          pipelines: {
            total: res.pipelines,
            unarchived: res.pipelines
          },
          datasets: {
            total: res.datasets,
            unarchived: res.datasets
          },
        }
      })
    ])
  ));
}
