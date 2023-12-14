import * as createNewUserActions from './user-create-dialog.actions';
import { CREATE_USER_ACTIONS } from './user-create-dialog.actions';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { catchError, mergeMap, map } from 'rxjs/operators';
import { activeLoader, addMessage, deactivateLoader } from '../../core/actions/layout.actions';
import { requestFailed } from '../../core/actions/http.actions';
import { ApiUsersService } from '~/business-logic/api-services/users.service';
import { ApiGroupService } from '~/business-logic/api-services/groups.service';
import { ApiCompanyService } from '~/business-logic/api-services/company.service';
import { MESSAGES_SEVERITY } from '@common/constants';
import { getCompanys, getGroups, getUsers } from '../user-domain.actions';

@Injectable()
export class UserCreateDialogEffects {
  constructor(private actions: Actions, private usersApiService: ApiUsersService,
    private groupApiService: ApiGroupService, private companyApiService: ApiCompanyService) {
  }

  activeLoader = createEffect(() => this.actions.pipe(
    ofType(CREATE_USER_ACTIONS.GET_USER, CREATE_USER_ACTIONS.CREATE_NEW_USER, CREATE_USER_ACTIONS.CREATE_NEW_COMPANY, CREATE_USER_ACTIONS.CREATE_NEW_GROUP,
      CREATE_USER_ACTIONS.UPDATE_COMPANY, CREATE_USER_ACTIONS.UPDATE_GROUP, CREATE_USER_ACTIONS.UPDATE_USER),
    map(action => activeLoader(action.type))
  ));

  createUser = createEffect(() => this.actions.pipe(
    ofType<createNewUserActions.CreateNewUser>(CREATE_USER_ACTIONS.CREATE_NEW_USER),
    mergeMap((action) => this.usersApiService.usersCreate(action.payload)
      .pipe(
        mergeMap(() => [
          deactivateLoader(action.type),
          // new createNewQueueActions.SetNewQueueCreationStatus(CREATION_STATUS.SUCCESS),
          addMessage(MESSAGES_SEVERITY.SUCCESS, 'User Created Successfully'),
          getUsers()
        ]),
        catchError(error => [deactivateLoader(action.type), requestFailed(error), addMessage(MESSAGES_SEVERITY.ERROR, 'User Created Failed')])
      )
    )
  ));

  updateUser = createEffect(() => this.actions.pipe(
    ofType<createNewUserActions.UpdateUser>(CREATE_USER_ACTIONS.UPDATE_USER),
    mergeMap((action) => this.usersApiService.usersUpdate(action.payload)
      .pipe(
        mergeMap(() => [
          deactivateLoader(action.type),
          //new createNewQueueActions.SetNewQueueCreationStatus(CREATION_STATUS.SUCCESS),
          addMessage(MESSAGES_SEVERITY.SUCCESS, 'User Updated Successfully'),
          getUsers()
        ]),
        catchError(error => [deactivateLoader(action.type), requestFailed(error), addMessage(MESSAGES_SEVERITY.ERROR, 'User Updated Failed')])
      )
    )
  ));

  getUser = createEffect(() => this.actions.pipe(
    ofType<createNewUserActions.GetUser>(CREATE_USER_ACTIONS.GET_USER),
    mergeMap((action) => this.usersApiService.usersGetById(action.payload)
      .pipe(
        mergeMap(res => [new createNewUserActions.SetUser(res.queues)]),
        catchError(error => [requestFailed(error)])
      )
    )
  ));

  createGroup = createEffect(() => this.actions.pipe(
    ofType<createNewUserActions.CreateNewGroup>(CREATE_USER_ACTIONS.CREATE_NEW_GROUP),
    mergeMap((action) => this.groupApiService.groupsCreate(action.payload)
      .pipe(
        mergeMap(() => [
          deactivateLoader(action.type),
          // new createNewQueueActions.SetNewQueueCreationStatus(CREATION_STATUS.SUCCESS),
          addMessage(MESSAGES_SEVERITY.SUCCESS, 'Group Created Successfully'),
          getGroups(),
          getUsers()
        ]),
        catchError(error => [deactivateLoader(action.type), requestFailed(error), addMessage(MESSAGES_SEVERITY.ERROR, 'Group Created Failed')])
      )
    )
  ));

  updateGroup = createEffect(() => this.actions.pipe(
    ofType<createNewUserActions.UpdateGroup>(CREATE_USER_ACTIONS.UPDATE_GROUP),
    mergeMap((action) => this.groupApiService.groupsUpdate(action.payload)
      .pipe(
        mergeMap(() => [
          deactivateLoader(action.type),
          //new createNewQueueActions.SetNewQueueCreationStatus(CREATION_STATUS.SUCCESS),
          addMessage(MESSAGES_SEVERITY.SUCCESS, 'Group Updated Successfully'),
          getGroups()
        ]),
        catchError(error => [deactivateLoader(action.type), requestFailed(error), addMessage(MESSAGES_SEVERITY.ERROR, 'Group Updated Failed')])
      )
    )
  ));

  createCompany = createEffect(() => this.actions.pipe(
    ofType<createNewUserActions.CreateNewCompany>(CREATE_USER_ACTIONS.CREATE_NEW_COMPANY),
    mergeMap((action) => this.companyApiService.companyCreate(action.payload)
      .pipe(
        mergeMap(() => [
          deactivateLoader(action.type),
          // new createNewQueueActions.SetNewQueueCreationStatus(CREATION_STATUS.SUCCESS),
          addMessage(MESSAGES_SEVERITY.SUCCESS, 'User Created Successfully'),
          getCompanys()
        ]),
        catchError(error => [deactivateLoader(action.type), requestFailed(error), addMessage(MESSAGES_SEVERITY.ERROR, 'User Created Failed')])
      )
    )
  ));

  updateCompany = createEffect(() => this.actions.pipe(
    ofType<createNewUserActions.UpdateCompany>(CREATE_USER_ACTIONS.UPDATE_COMPANY),
    mergeMap((action) => this.companyApiService.companyUpdate(action.payload)
      .pipe(
        mergeMap(() => [
          deactivateLoader(action.type),
          //new createNewQueueActions.SetNewQueueCreationStatus(CREATION_STATUS.SUCCESS),
          addMessage(MESSAGES_SEVERITY.SUCCESS, 'Company Updated Successfully'),
          getCompanys()
        ]),
        catchError(error => [deactivateLoader(action.type), requestFailed(error), addMessage(MESSAGES_SEVERITY.ERROR, 'Company Updated Failed')])
      )
    )
  ));
}
