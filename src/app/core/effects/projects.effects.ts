import { Injectable } from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as actions from '../../webapp-common/core/actions/projects.actions';
import {Store} from '@ngrx/store';
import {selectSelectedProjectId, selectShowHidden} from '@common/core/reducers/projects.reducer';
import {catchError, finalize, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {deactivateLoader} from '@common/core/actions/layout.actions';
import {ALL_PROJECTS_OBJECT} from '@common/core/effects/projects.effects';
import {requestFailed} from '@common/core/actions/http.actions';
import {ApiProjectsService} from '~/business-logic/api-services/projects.service';
import {selectCurrentUser, selectShowOnlyUserWork} from '@common/core/reducers/users-reducer';
import {ProjectsGetAllExRequest} from '~/business-logic/model/projects/projectsGetAllExRequest';



@Injectable()
export class ProjectsEffects {
  private fetchingExampleExperiment: string = null;

  constructor(
    private actions$: Actions,
    private store: Store,
    private projectsApi: ApiProjectsService
  ) {}

  getSelectedProject = createEffect(() => this.actions$.pipe(
    ofType(actions.setSelectedProjectId),
    withLatestFrom(
      this.store.select(selectSelectedProjectId),
      this.store.select(selectCurrentUser),
      this.store.select(selectShowOnlyUserWork),
      this.store.select(selectShowHidden),
    ),
    switchMap(([action, selectedProjectId, user, showOnlyUserWork, showHidden]) => {
      if (!action.projectId) {
        return [
          deactivateLoader(action.type),
          actions.setSelectedProject({project: null}),
        ];
      }
      if (action.projectId === selectedProjectId) {
        return [deactivateLoader(action.type)];
      }
      if (action.projectId === '*') {
        return [
          actions.setSelectedProject({project: ALL_PROJECTS_OBJECT}),
          actions.getProjectUsers(action),
          deactivateLoader(action.type)];
      } else {
        this.fetchingExampleExperiment = action.example && action.projectId;
        return this.projectsApi.projectsGetAllEx({
          /* eslint-disable @typescript-eslint/naming-convention */
          id: [action.projectId],
          include_stats: true,
          ...(!showHidden && {include_stats_filter: {system_tags: ['-pipeline', '-dataset']}}),
          ...(showOnlyUserWork && {active_users: [user.id]}),
          ...(showHidden && {search_hidden: true}),
          ...((action.example !== false || this.fetchingExampleExperiment === action.projectId) && {check_own_contents: true}),
          /* eslint-enable @typescript-eslint/naming-convention */
        } as ProjectsGetAllExRequest)
          .pipe(
            finalize(() => this.fetchingExampleExperiment = null),
            mergeMap(({projects}) => [
                actions.setSelectedProject({project: projects[0]}),
                actions.getProjectUsers(action),
                actions.getTags(),
                actions.getCompanyTags(),
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
