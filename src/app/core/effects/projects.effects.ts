import { Injectable } from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as actions from '../../webapp-common/core/actions/projects.actions';
import {Store} from '@ngrx/store';
import {selectSelectedProjectId} from '../../webapp-common/core/reducers/projects.reducer';
import {catchError, finalize, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {deactivateLoader} from '../../webapp-common/core/actions/layout.actions';
import {ALL_PROJECTS_OBJECT} from '../../webapp-common/core/effects/projects.effects';
import {requestFailed} from '../../webapp-common/core/actions/http.actions';
import {ApiProjectsService} from '../../business-logic/api-services/projects.service';



@Injectable()
export class ProjectsEffects {
  private fetchingExampleExperiment: string = null;

  constructor(private actions$: Actions, private store: Store, private projectsApi: ApiProjectsService) {}

  getSelectedProject = createEffect(() => this.actions$.pipe(
    ofType(actions.setSelectedProjectId),
    withLatestFrom(this.store.select(selectSelectedProjectId)),
    switchMap(([action, selectedProjectId]) => {
      if (!action.projectId) {
        return [actions.setSelectedProject({project: null})];
      }
      if (action.projectId === selectedProjectId) {
        return [deactivateLoader(action.type)];
      }
      if (action.projectId === '*') {
        return [
          actions.setSelectedProject({project: ALL_PROJECTS_OBJECT}),
          deactivateLoader(action.type)
        ];
      } else {
        this.fetchingExampleExperiment = action.example && action.projectId;
        return this.projectsApi.projectsGetAllEx({
          /* eslint-disable @typescript-eslint/naming-convention */
          id: [action.projectId],
          include_stats: true,
          ...((action.example !== false || this.fetchingExampleExperiment === action.projectId) && {check_own_contents: true})
          /* eslint-enable @typescript-eslint/naming-convention */
        })
          .pipe(
            finalize(() => this.fetchingExampleExperiment = null),
            mergeMap(({projects}) => [
                actions.setSelectedProject({project: projects[0]}),
                deactivateLoader(action.type),
              ]
            ),
            catchError(error => [
              requestFailed(error),
              deactivateLoader(action.type)
            ])
          );
      }
    })
  ));
}
