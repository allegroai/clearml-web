import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, map, switchMap} from 'rxjs/operators';
import {CredentialsSettingsActions} from './settings.actions';
import {addMessage} from '@common/core/actions/layout.actions';
import {DatePipe} from '@angular/common';
import {ApiStorageService} from '~/business-logic/api-services/storage.service';
import {StorageGetSettingsResponse} from '~/business-logic/model/storage/storageGetSettingsResponse';

@Injectable()
export class SettingsEffects {

  private datePipe = new DatePipe('en-US');

  constructor(
    private actions$: Actions,
    private storageApi: ApiStorageService,
  ) {
  }

  getcredentials = createEffect(() => this.actions$.pipe(
    ofType(CredentialsSettingsActions.getCredentials),
    switchMap(() => this.storageApi.storageGetSettings({})
      .pipe(
        map((res: { settings: StorageGetSettingsResponse }) => CredentialsSettingsActions.setCredentials({credentials: res.settings})),
        catchError(() => [
          addMessage('error', 'Set storage credentials failed')
        ])
      )),
  ));

  updatecredentials = createEffect(() => this.actions$.pipe(
    ofType(CredentialsSettingsActions.updateCredentials),
    switchMap(action => this.storageApi.storageSetSettings({...action.credentials})
      .pipe(
        map(() => CredentialsSettingsActions.setCredentials({credentials: action.credentials})),
        catchError(() => [
          addMessage('error', 'Update storage credentials failed')
        ])
      ))
  ));
}
