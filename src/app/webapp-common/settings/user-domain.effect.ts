import { Injectable } from '@angular/core';
import { ApiProjectsService } from '~/business-logic/api-services/projects.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { requestFailed } from '../core/actions/http.actions';
import { activeLoader, deactivateLoader } from '../core/actions/layout.actions';
import {
  getUsers,
  setUsers,
  getCompanys,
  setCompanys,
  getGroups,
  setGroups,
  delUser, delGroup, delCompany
} from './user-domain.actions';
import { selectSelectedData } from './user-domain.reducer'
import { ApiUsersService } from '~/business-logic/api-services/users.service';
import { ApiGroupService } from '~/business-logic/api-services/groups.service';
import { catchError, mergeMap, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { ErrorService } from '../shared/services/error.service';
import { selectCurrentUser, selectShowOnlyUserWork } from '../core/reducers/users-reducer';
import { selectHideExamples, selectShowHidden } from '@common/core/reducers/projects.reducer';
import { ApiCompanyService } from '~/business-logic/api-services/company.service';

@Injectable()
export class UserDomainEffects {
  constructor(
    private actions: Actions, private groupsApi: ApiGroupService,
    private usersApi: ApiUsersService, private companyApi: ApiCompanyService,
    private errorService: ErrorService, private store: Store<any>,
  ) { }
  /* eslint-disable @typescript-eslint/naming-convention */
  activeLoader = createEffect(() => this.actions.pipe(
    ofType(getUsers, getGroups, getCompanys, delUser, delGroup, delCompany),
    map(action => activeLoader(action.type))
  ));

  getUserPages = createEffect(() => this.actions.pipe(
    ofType(getUsers),
    withLatestFrom(
      this.store.select(selectCurrentUser),
      this.store.select(selectShowOnlyUserWork),
      this.store.select(selectShowHidden),
      this.store.select(selectHideExamples),
    ),
    mergeMap(([action, user, showOnlyUserWork, showHidden, hideExamples]) =>
      this.usersApi.usersGetAllUsers({
        order_by: ['created', '-last_update'],
        page: 0,
        page_size: 20,
        ...(showOnlyUserWork && { active_users: [user.id] }),
        ...(showHidden && { search_hidden: true }),
        ...(!showHidden && { include_stats_filter: { system_tags: ['-pipeline'] } }),
        ...(hideExamples && { allow_public: false }),
      }).pipe(
        mergeMap(({ users }) => [setUsers({ users }), deactivateLoader(action.type)]),
        catchError(error => [deactivateLoader(action.type), requestFailed(error)])
      )
    )
  ));

  delUser = createEffect(() => this.actions.pipe(
    ofType(delUser),
    withLatestFrom(
      this.store.select(selectSelectedData),
    ),
    mergeMap(([action, selectSelectedData]) =>
      this.usersApi.usersDelete({ user: selectSelectedData.id }).pipe(
        mergeMap(() => [getUsers(), deactivateLoader(action.type)]),
        catchError(error => [deactivateLoader(action.type), requestFailed(error)])
      )
    )
  ));

  delGroup = createEffect(() => this.actions.pipe(
    ofType(delGroup),
    withLatestFrom(
      this.store.select(selectSelectedData),
    ),
    mergeMap(([action, selectSelectedData]) =>
      this.groupsApi.groupsDelete({ id: selectSelectedData.id }).pipe(
        mergeMap(() => [getGroups(), getUsers(), deactivateLoader(action.type)]),
        catchError(error => [deactivateLoader(action.type), requestFailed(error)])
      )
    )
  ));

  delCompany = createEffect(() => this.actions.pipe(
    ofType(delCompany),
    withLatestFrom(
      this.store.select(selectSelectedData),
    ),
    mergeMap(([action, selectSelectedData]) =>
      this.companyApi.companyDelete({ id: selectSelectedData.id }).pipe(
        mergeMap(() => [getCompanys(), deactivateLoader(action.type)]),
        catchError(error => [deactivateLoader(action.type), requestFailed(error)])
      )
    )
  ));

  getGroupPages = createEffect(() => this.actions.pipe(
    ofType(getGroups),
    withLatestFrom(
      this.store.select(selectCurrentUser),
      this.store.select(selectShowOnlyUserWork),
      this.store.select(selectShowHidden),
      this.store.select(selectHideExamples),
    ),
    mergeMap(([action, user, showOnlyUserWork, showHidden, hideExamples]) =>
      this.groupsApi.groupsGetAll({
        order_by: ['created', '-last_update'],
        page: 0,
        page_size: 20,
        ...(showOnlyUserWork && { active_users: [user.id] }),
        ...(showHidden && { search_hidden: true }),
        ...(!showHidden && { include_stats_filter: { system_tags: ['-pipeline'] } }),
        ...(hideExamples && { allow_public: false }),
      }).pipe(
        mergeMap(({ groups }) => [setGroups({ groups }), deactivateLoader(action.type)]),
        catchError(error => [deactivateLoader(action.type), requestFailed(error)])
      )
    )
  ));

  getCompanyPages = createEffect(() => this.actions.pipe(
    ofType(getCompanys),
    withLatestFrom(
      this.store.select(selectCurrentUser),
      this.store.select(selectShowOnlyUserWork),
      this.store.select(selectShowHidden),
      this.store.select(selectHideExamples),
    ),
    mergeMap(([action, user, showOnlyUserWork, showHidden, hideExamples]) =>
      this.companyApi.companyGetAll({
        order_by: ['created', '-last_update'],
        page: 0,
        page_size: 20,
        ...(showOnlyUserWork && { active_users: [user.id] }),
        ...(showHidden && { search_hidden: true }),
        ...(!showHidden && { include_stats_filter: { system_tags: ['-pipeline'] } }),
        ...(hideExamples && { allow_public: false }),
      }).pipe(
        mergeMap(({ companys }) => [setCompanys({ companys }), deactivateLoader(action.type)]),
        catchError(error => [deactivateLoader(action.type), requestFailed(error)])
      )
    )
  ));
}

