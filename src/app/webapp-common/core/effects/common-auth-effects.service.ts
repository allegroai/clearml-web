import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {ApiAuthService} from '../../../business-logic/api-services/auth.service';
import * as authActions from '../actions/common-auth.actions';
import {RequestFailed} from '../actions/http.actions';
import {ActiveLoader, DeactiveLoader, SetServerError} from '../actions/layout.actions';
import {catchError, flatMap, map, switchMap} from 'rxjs/operators';

@Injectable()
export class CommonAuthEffectsService {

  constructor(private actions: Actions, private credentialsApi: ApiAuthService) {
  }

  @Effect()
  activeLoader = this.actions.pipe(
    ofType(authActions.getAllCredentials, authActions.createCredential),
    map(action => new ActiveLoader(action.type))
  );

  @Effect()
  getAllCredentialsEffect = this.actions.pipe(
    ofType(authActions.getAllCredentials),
    switchMap(action => this.credentialsApi.authGetCredentials({}).pipe(
      flatMap(res => {
        return [
          authActions.updateAllCredentials({credentials: res.credentials}),
          new DeactiveLoader(action.type)
        ];
      }),
      catchError(error => [new RequestFailed(error), new DeactiveLoader(action.type)])
      )
    )
  );

  @Effect()
  revokeCredential = this.actions.pipe(
    ofType(authActions.credentialRevoked),
    flatMap(action => this.credentialsApi.authRevokeCredentials(<any>{access_key: action.accessKey}).pipe(
      flatMap(() => {
        return [authActions.getAllCredentials(), new DeactiveLoader(action.type)];
      }),
      catchError(error => [
        new RequestFailed(error),
        new DeactiveLoader(action.type),
        new SetServerError(error, null, 'Can\'t delete this credentials.')
      ])
      )
    )
  );

  @Effect()
  createCredential = this.actions.pipe(
    ofType(authActions.createCredential),
    flatMap(action => this.credentialsApi.authCreateCredentials({}).pipe(
      flatMap(res => [
        authActions.addCredential({newCredential: res.credentials}),
        new DeactiveLoader(action.type)]),
      catchError(error => [
        new RequestFailed(error),
        new SetServerError(error, null, 'Unable to create credentials'),
        new DeactiveLoader(action.type)])
      )
    )
  );
}
