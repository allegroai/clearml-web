import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {act, Actions, createEffect, Effect, ofType} from '@ngrx/effects';
import {ApiProjectsService} from '../../../business-logic/api-services/projects.service';
import * as actions from '../actions/projects.actions';
import {
  ResetSelectedProject,
  SetSelectedProjectId,
  UpdateProject,
  ResetProjectSelection,
  RESET_PROJECT_SELECTION,
  setTags, openTagColorsMenu, getTags, setCompanyTags, getCompanyTags, openMoreInfoPopup
} from '../actions/projects.actions';
import {GetAllProjects} from '../actions/projects.actions';

import {catchError, filter, finalize, map, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {RequestFailed} from '../actions/http.actions';
import {ActiveLoader, DeactiveLoader, SetServerError} from '../actions/layout.actions';
import {SetSelectedExperiments} from '../../experiments/actions/common-experiments-view.actions';
import {SetSelectedModels} from '../../models/actions/models-view.actions';
import {TagColorMenuComponent} from '../../shared/ui-components/tags/tag-color-menu/tag-color-menu.component';
import {MatDialog} from '@angular/material/dialog';
import {ApiOrganizationService} from '../../../business-logic/api-services/organization.service';
import {OrganizationGetTagsResponse} from '../../../business-logic/model/organization/organizationGetTagsResponse';
import {selectRouterParams} from '../reducers/router-reducer';
import {forkJoin} from 'rxjs';
import {ProjectsGetTaskTagsResponse} from '../../../business-logic/model/projects/projectsGetTaskTagsResponse';
import {ProjectsGetModelTagsResponse} from '../../../business-logic/model/projects/projectsGetModelTagsResponse';
import {selectSelectedProjectId} from '../reducers/projects.reducer';
import {OperationErrorDialogComponent} from '@common/shared/ui-components/overlay/operation-error-dialog/operation-error-dialog.component';
import {EmptyAction} from '../../../app.constants';

const ALL_PROJECTS_OBJECT = {id: '*', name: 'All Experiments'};

@Injectable()
export class ProjectsEffects {
  private fetchingExampleExperiment: string = null;

  constructor(
    private actions$: Actions, private projectsApi: ApiProjectsService, private orgApi: ApiOrganizationService,
    private store: Store<any>, private dialog: MatDialog
  ) {
  }

  @Effect()
  activeLoader = this.actions$.pipe(
    ofType(actions.SET_SELECTED_PROJECT_ID),
    filter((action: any) => !!action.payload?.projectId),
    map(action => new ActiveLoader(action.type))
  );

  @Effect()
  getProjects$ = this.actions$.pipe(
    ofType<GetAllProjects>(actions.GET_PROJECTS),
    switchMap(() =>
      this.projectsApi.projectsGetAllEx({only_fields: ['name', 'company', 'parent']})
        .pipe(map(res => new actions.SetAllProjects(res.projects)))
    )
  );

  @Effect()
  ResetProjects$ = this.actions$.pipe(
    ofType<ResetSelectedProject>(actions.RESET_SELECTED_PROJECT),
    mergeMap(() => [new ResetProjectSelection()])
  );

  @Effect()
  ResetProjectSelections$ = this.actions$.pipe(
    ofType<ResetProjectSelection>(RESET_PROJECT_SELECTION),
    mergeMap(() => [new SetSelectedExperiments([]), new SetSelectedModels([])])
  );

  @Effect()
  updateProject$ = this.actions$.pipe(
    ofType<UpdateProject>(actions.UPDATE_PROJECT),
    switchMap((action) =>
      this.projectsApi.projectsUpdate({project: action.payload.id, ...action.payload.changes})
        .pipe(
          mergeMap((res) => [
            new actions.UpdateProjectCompleted()
          ]),
          catchError(err => [
            new RequestFailed(err),
            new SetServerError(err, null, 'Update project failed'),
            new actions.SetSelectedProjectId(action.payload.id)
          ])
        )
    )
  );
  @Effect()
  getSelectedProject = this.actions$.pipe(
    ofType<SetSelectedProjectId>(actions.SET_SELECTED_PROJECT_ID),
    withLatestFrom(this.store.select(selectSelectedProjectId)),
    switchMap(([action, selectedProjectId]) => {
      if(!action.payload.projectId){
        return [new actions.SetSelectedProject(null)];
      }
      if (action.payload.projectId === selectedProjectId) {
        return [new DeactiveLoader(action.type)];
      }
      if (action.payload.projectId === '*') {
        return [
          new actions.SetSelectedProject(ALL_PROJECTS_OBJECT),
          new DeactiveLoader(action.type)];
      } else {
        this.fetchingExampleExperiment = action.payload.example && action.payload.projectId;
        return this.projectsApi.projectsGetAllEx({
          id: [action.payload.projectId],
          include_stats: true,
          ...((action.payload.example !== false || this.fetchingExampleExperiment === action.payload.projectId) && {check_own_contents: true})
        })
          .pipe(
            finalize(() => this.fetchingExampleExperiment = null),
            mergeMap(res => [
              new actions.SetSelectedProject(res.projects[0]),
              new DeactiveLoader(action.type),
            ]
            ),
            catchError(error => [
              new RequestFailed(error),
              new DeactiveLoader(action.type)
            ])
          );
      }
    }));


  @Effect({dispatch: false})
  openTagColor = this.actions$.pipe(
    ofType(openTagColorsMenu),
    map(action => {
      this.dialog.open(TagColorMenuComponent);
    })
  );

  @Effect()
  getAllTags = this.actions$.pipe(
    ofType(getCompanyTags),
    switchMap(() => this.orgApi.organizationGetTags({include_system: true})
      .pipe(
        map((res: OrganizationGetTagsResponse) => setCompanyTags({tags: res.tags, systemTags: res.system_tags})),
        catchError(error => [new RequestFailed(error)])
      )
    )
  );

  @Effect()
  getTagsEffect = this.actions$.pipe(
    ofType(getTags),
    withLatestFrom(this.store.select(selectRouterParams).pipe(
      map(params => (params === null || params?.projectId === '*') ? [] : [params.projectId]))),
    switchMap(([action, projects]) => forkJoin([
      this.projectsApi.projectsGetTaskTags({projects}),
      this.projectsApi.projectsGetModelTags({projects})]
    ).pipe(
      map((res: [ProjectsGetTaskTagsResponse, ProjectsGetModelTagsResponse]) =>
        Array.from(new Set(res[0].tags.concat(res[1].tags))).sort()),
      mergeMap((tags: string[]) => [
        setTags({tags}),
        new DeactiveLoader(action.type)
      ]),
      catchError(error => [
        new RequestFailed(error),
        new DeactiveLoader(action.type),
        new SetServerError(error, null, 'Fetch tags failed')]
      )
    ))
  );

  openMoreInfoPopupEffect = createEffect(() => this.actions$.pipe(
    ofType(openMoreInfoPopup),
    switchMap(action => this.dialog.open(OperationErrorDialogComponent, {
          data: {
            title: `${action.operationName} ${action.entityType}`,
            action,
            iconClass: `d-block al-ico-${action.operationName} al-icon w-auto`,
          }
        }).afterClosed()
    )
  ), {dispatch: false});

}


