import {Injectable} from '@angular/core';
import {ApiProjectsService} from '~/business-logic/api-services/projects.service';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {requestFailed} from '../core/actions/http.actions';
import {activeLoader, deactivateLoader} from '../core/actions/layout.actions';
import {
  getRecentExperiments,
  getRecentProjects,
  setRecentExperiments,
  setRecentProjects,
} from './common-dashboard.actions';
import {CARDS_IN_ROW} from './common-dashboard.const';
import {ApiTasksService} from '~/business-logic/api-services/tasks.service';
import {ProjectsGetAllExRequest} from '~/business-logic/model/projects/projectsGetAllExRequest';
import {catchError, mergeMap, map, switchMap, withLatestFrom} from 'rxjs/operators';
import {ApiLoginService} from '~/business-logic/api-services/login.service';
import {Store} from '@ngrx/store';
import {ErrorService} from '../shared/services/error.service';
import {selectCurrentUser, selectShowOnlyUserWork} from '../core/reducers/users-reducer';
import {selectHideExamples, selectShowHidden} from '@common/core/reducers/projects.reducer';

@Injectable()
export class CommonDashboardEffects {
  constructor(
    private actions: Actions, private projectsApi: ApiProjectsService,
    private tasksApi: ApiTasksService, private loginApi: ApiLoginService,
    private errorService: ErrorService, private store: Store<any>,
  ) {}
  /* eslint-disable @typescript-eslint/naming-convention */
  activeLoader = createEffect(() => this.actions.pipe(
    ofType(getRecentProjects, getRecentExperiments),
    map(action => activeLoader(action.type))
  ));

  getRecentProjects = createEffect(() => this.actions.pipe(
    ofType(getRecentProjects),
    withLatestFrom(
      this.store.select(selectCurrentUser),
      this.store.select(selectShowOnlyUserWork),
      this.store.select(selectShowHidden),
      this.store.select(selectHideExamples),
    ),
    mergeMap(([action, user, showOnlyUserWork, showHidden, hideExamples]) =>
      this.projectsApi.projectsGetAllEx({
        stats_for_state: ProjectsGetAllExRequest.StatsForStateEnum.Active,
        include_stats: true,
        check_own_contents: true,
        order_by: ['featured', '-last_update'],
        page: 0,
        page_size: CARDS_IN_ROW,
        ...(showOnlyUserWork && {active_users: [user.id]}),
        ...(showHidden && {search_hidden: true}),
        ...(!showHidden && {include_stats_filter: {system_tags: ['-pipeline']}}),
        ...(hideExamples && {allow_public: false}),
        only_fields: ['name', 'company', 'user', 'created', 'default_output_destination']
      }).pipe(
          mergeMap(({projects}) => [setRecentProjects({projects}), deactivateLoader(action.type)]),
          catchError(error => [deactivateLoader(action.type), requestFailed(error)])
        )
    )
  ));

  getRecentTasks = createEffect(() => this.actions.pipe(
    ofType(getRecentExperiments),
    withLatestFrom(
      this.store.select(selectCurrentUser),
      this.store.select(selectShowOnlyUserWork),
      this.store.select(selectHideExamples),
    ),
    switchMap(([action, user, showOnlyUserWork, hideExamples]) => this.tasksApi.tasksGetAllEx({
        page: 0,
        page_size: 5,
        order_by: ['-last_update'],
        status: ['published', 'closed', 'failed', 'stopped', 'in_progress', 'completed'],
        type: ['__$not', 'annotation_manual', '__$not', 'annotation', '__$not', 'dataset_import'],
        only_fields: ['type', 'status', 'created', 'name', 'id', 'last_update', 'started', 'project.name'],
        system_tags: ['-archived', '-pipeline'],
        user: showOnlyUserWork ? [user.id] : null,
        ...(hideExamples && {allow_public: false}),
      })
        .pipe(
          mergeMap(({tasks: experiments}) => [setRecentExperiments({experiments}), deactivateLoader(action.type)]),
          catchError(err => [requestFailed(err), deactivateLoader(action.type)])
        )
    )
  ));

}

