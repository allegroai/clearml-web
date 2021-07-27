import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {EmptyAction} from '../../../app.constants';
import * as layoutActions from '../actions/layout.actions';
import {filter, map, switchMap, take, mergeMap} from 'rxjs/operators';
import {get} from 'lodash/fp';
import {ApiTasksService} from '../../../business-logic/api-services/tasks.service';
import {Observable, of} from 'rxjs';
import {ApiModelsService} from '../../../business-logic/api-services/models.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import {AlertDialogComponent} from '../../shared/ui-components/overlay/alert-dialog/alert-dialog.component';
import {NotifierService} from '../../angular-notifier';

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
  ) {}

  @Effect({dispatch: false})
  serverErrorMoreInfo = this.actions.pipe(ofType(layoutActions.setServerError),
    filter(action => !!action.serverError),
    map(action => this.parseError(get('error.meta.result_msg', action.serverError))),
    filter(([ids]) => !!ids),
    switchMap(([ids, entity]) => this.getAllEntity(ids, entity).pipe(
      filter(res => !!res),
      map(res => {
        const moreInfo = { [entity]: res[entity] };
        if (this.alertDialogRef) {
          this.alertDialogRef.componentInstance.moreInfo = moreInfo;
        }
      })
    ))
  );

  @Effect({dispatch: false})
  popupError = this.actions.pipe(
    ofType(layoutActions.setServerError),
    filter(action => action.serverError?.status !== 401),
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
  );

  @Effect()
  addMessage: Observable<any> = this.actions.pipe(
    ofType(layoutActions.addMessage),
    mergeMap(payload => this.notifierService.show({type: payload.severity, message: payload.msg, actions: payload.userActions})),
    mergeMap(actions => actions.length > 0? actions : [new EmptyAction()])
  );

  private parseError(errorMessage) {
    const regexMatch = errorMessage && errorMessage.match(/(\w*)=\((.*)\)/);
    if (regexMatch) {
      const entity = regexMatch[1];
      const ids    = regexMatch[2] && regexMatch[2].split(', ');
      return [ids, entity];
    } else {
      return [false, false];
    }
  }

  private getAllEntity(ids: string[], entity: string): Observable<any> {
    switch (entity) {
      case 'tasks':
        return this.taskService.tasksGetAllEx({
          id         : ids,
          only_fields: ['name', 'project', 'system_tags']
        });
      case 'models':
        return this.modelService.modelsGetAllEx({
          id         : ids,
          only_fields: ['name', 'project']
        });
      default:
        return of(null);
    }
  }
}


