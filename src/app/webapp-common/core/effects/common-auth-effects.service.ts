import {Injectable} from '@angular/core';
import {act, Actions, Effect, ofType} from '@ngrx/effects';
import {ApiAuthService} from '../../../business-logic/api-services/auth.service';
import * as authActions from '../actions/common-auth.actions';
import {requestFailed} from '../actions/http.actions';
import {activeLoader, deactivateLoader, setServerError} from '../actions/layout.actions';
import {catchError, map, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {AuthGetCredentialsResponse} from '../../../business-logic/model/auth/authGetCredentialsResponse';
import {Store} from '@ngrx/store';
import {selectCurrentUser} from '../reducers/users-reducer';
import {GetCurrentUserResponseUserObject} from '../../../business-logic/model/users/getCurrentUserResponseUserObject';

@Injectable()
export class CommonAuthEffectsService {

  constructor(private actions: Actions, private credentialsApi: ApiAuthService, private store: Store<any>) {
  }

  @Effect()
  activeLoader = this.actions.pipe(
    ofType(authActions.getAllCredentials, authActions.createCredential),
    map(action => activeLoader(action.type))
  );

  @Effect()
  getAllCredentialsEffect = this.actions.pipe(
    ofType(authActions.getAllCredentials),
    switchMap(action => this.credentialsApi.authGetCredentials({}).pipe(
      withLatestFrom(this.store.select(selectCurrentUser)),
      mergeMap(([res, user]: [AuthGetCredentialsResponse, GetCurrentUserResponseUserObject]) => [
        authActions.updateAllCredentials({credentials: res.credentials, extra: res.additional_credentials, workspace: user.company.id}),
        deactivateLoader(action.type)
      ]),
      catchError(error => [requestFailed(error), deactivateLoader(action.type)])
    ))
  );

  @Effect()
  revokeCredential = this.actions.pipe(
    ofType(authActions.credentialRevoked),
    mergeMap(action => this.credentialsApi.authRevokeCredentials({access_key: action.accessKey}).pipe(
      mergeMap(() => [authActions.removeCredential(action), deactivateLoader(action.type)]),
      catchError(error => [
        requestFailed(error),
        deactivateLoader(action.type),
        setServerError(error, null, 'Can\'t delete this credentials.')
      ])
    ))
  );

  @Effect()
  createCredential = this.actions.pipe(
    ofType(authActions.createCredential),
    mergeMap(action => this.credentialsApi.authCreateCredentials({}).pipe(
      mergeMap(res => [
        authActions.addCredential({newCredential: res.credentials, workspaceId: action.workspaceId}),
        deactivateLoader(action.type)]),
      catchError(error => [
        requestFailed(error),
        setServerError(error, null, 'Unable to create credentials'),
        authActions.addCredential({newCredential: {}, workspaceId: action.workspaceId}),
        deactivateLoader(action.type)])
    ))
  );
}
