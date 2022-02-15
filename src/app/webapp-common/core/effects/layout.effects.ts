import {Injectable} from '@angular/core';
import {Actions, createEffect, Effect, ofType} from '@ngrx/effects';
import {EmptyAction, MESSAGES_SEVERITY} from '../../../app.constants';
import * as layoutActions from '../actions/layout.actions';
import {filter, map, switchMap, take, mergeMap, bufferTime} from 'rxjs/operators';
import {get} from 'lodash/fp';
import {ApiTasksService} from '../../../business-logic/api-services/tasks.service';
import {EMPTY, Observable, of} from 'rxjs';
import {ApiModelsService} from '../../../business-logic/api-services/models.service';
import {MatDialogRef, MatDialog} from '@angular/material/dialog';
import {AlertDialogComponent} from '../../shared/ui-components/overlay/alert-dialog/alert-dialog.component';
import {NotifierService} from '../../angular-notifier';
import {requestFailed} from '@common/core/actions/http.actions';
import {addMessage} from '../actions/layout.actions';

const ERROR_AGGREGATION = 600000;

@Injectable()
export class LayoutEffects {

  private alertDialogRef: MatDialogRef<AlertDialogComponent, any>;
  private errors = {};

  constructor(
    private actions: Actions,
    private taskService: ApiTasksService,
    private modelService: ApiModelsService,
    private notifierService: NotifierService,
    private dialog: MatDialog
  ) {
  }

  @Effect({dispatch: false})
  serverErrorMoreInfo = this.actions.pipe(ofType(layoutActions.setServerError),
    filter(action => !!action.serverError),
    map(action => this.parseError(get('error.meta.result_msg', action.serverError))),
    filter(([ids]) => !!ids),
    switchMap(([ids, entity]) => this.getAllEntity(ids, entity).pipe(
      filter(res => !!res),
      map(res => {
        const moreInfo = {[entity]: res[entity]};
        if (this.alertDialogRef) {
          this.alertDialogRef.componentInstance.moreInfo = moreInfo;
        }
      })
    ))
  );

  popupError = createEffect(() => this.actions.pipe(
    ofType(layoutActions.setServerError),
    filter(action => action.serverError?.status !== 401 && action.serverError?.status !== 403 ),
    map((action) => {
      if (action.serverError?.status === 502) {
        console.log('Gateway Error', action.serverError);
        return;
      }
      const customMessage: string = action.customMessage;
      if (action.aggregateSimilar) {
        const lastTS = this.errors[customMessage];
        const now = (new Date()).getTime();
        if (lastTS && lastTS + ERROR_AGGREGATION > now) {
          return;
        }
        this.errors[customMessage] = now;
      }
      let resultMessage: string;
      const subcode = get('error.meta.result_subcode', action.serverError);
      if (subcode) {
        resultMessage = `Error ${subcode} : ${get('error.meta.result_msg', action.serverError)}`;
      }
      this.alertDialogRef = this.dialog.open(AlertDialogComponent, {
        data: {alertMessage: 'Error', alertSubMessage: customMessage, resultMessage}
      });

      this.alertDialogRef.beforeClosed().pipe(take(1)).subscribe(() => this.dialog.closeAll());
      this.alertDialogRef.afterClosed().pipe(take(1)).subscribe(() => this.alertDialogRef = null);
    })
  ), {dispatch: false});

  @Effect()
  addMessage: Observable<any> = this.actions.pipe(
    ofType(layoutActions.addMessage),
    bufferTime(500),
    filter(messages => messages.length > 0),
    mergeMap((messages) => {
      const message403 = messages.find(message => message.suppressNextMessages);
      return message403 ? [message403] : messages;
    }),
    mergeMap(payload => payload ? this.notifierService.show({type: payload.severity, message: payload.msg, actions: payload.userActions}) : EMPTY),
    mergeMap(actions => actions.length > 0 ? actions : [new EmptyAction()])
  );

  requestFailed: Observable<any> = createEffect( () => this.actions.pipe(
    ofType(requestFailed),
    filter(action => action.err?.status === 403),
    map(action => {
      const errorData = action.err?.error?.meta?.error_data?.access ===  'read_write' ? 'modifying' : 'accessing';
      return addMessage(MESSAGES_SEVERITY.ERROR,
        `Insufficient privileges for ${errorData} this ${action.err?.error?.meta?.error_data?.type?.replace('datasetversion', 'dataset version') || 'resource'}.
    Contact your service admin for information.`, [], true);
    })
  ));

  private parseError(errorMessage) {
    const regexMatch = errorMessage && errorMessage.match(/(\w*)=\((.*)\)/);
    if (regexMatch) {
      const entity = regexMatch[1];
      const ids = regexMatch[2] && regexMatch[2].split(', ');
      return [ids, entity];
    } else {
      return [false, false];
    }
  }

  private getAllEntity(ids: string[], entity: string): Observable<any> {
    switch (entity) {
      case 'tasks':
        return this.taskService.tasksGetAllEx({
          id: ids,
          only_fields: ['name', 'project', 'system_tags']
        });
      case 'models':
        return this.modelService.modelsGetAllEx({
          id: ids,
          only_fields: ['name', 'project']
        });
      default:
        return of(null);
    }
  }
}


