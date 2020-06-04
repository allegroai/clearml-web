import * as createNewQueueActions from './queue-create-dialog.actions';
import {CREATE_QUEUE_ACTIONS} from './queue-create-dialog.actions';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Injectable} from '@angular/core';
import {CREATION_STATUS} from './queue-create-dialog.reducer';
import {catchError, flatMap, map, switchMap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {MESSAGES_SEVERITY} from '../../../app.constants';
import {ActiveLoader, AddMessage, DeactiveLoader} from '../../core/actions/layout.actions';
import {RequestFailed} from '../../core/actions/http.actions';
import {ApiQueuesService} from '../../../business-logic/api-services/queues.service';

@Injectable()
export class QueueCreateDialogEffects {
  constructor(private actions: Actions, private queuesApiService: ApiQueuesService, private router: Router) {
  }

  @Effect()
  activeLoader = this.actions.pipe(
    ofType(CREATE_QUEUE_ACTIONS.CREATE_NEW_QUEUE),
    map(action => new ActiveLoader(action.type))
  );

  @Effect()
  createQueue = this.actions.pipe(
    ofType<createNewQueueActions.CreateNewQueue>(CREATE_QUEUE_ACTIONS.CREATE_NEW_QUEUE),
    flatMap((action) => this.queuesApiService.queuesCreate(action.payload)
      .pipe(
        flatMap(res => [
          new DeactiveLoader(action.type),
          new createNewQueueActions.SetNewQueueCreationStatus(CREATION_STATUS.SUCCESS),
          new AddMessage(MESSAGES_SEVERITY.SUCCESS, 'Queue Created Successfully'),
        ]),
        catchError(error => [new DeactiveLoader(action.type), new RequestFailed(error), new AddMessage(MESSAGES_SEVERITY.ERROR, 'Queue Created Failed'), new createNewQueueActions.SetNewQueueCreationStatus(CREATION_STATUS.FAILED)])
      )
    )
  );

  @Effect()
  updateQueue = this.actions.pipe(
    ofType<createNewQueueActions.UpdateQueue>(CREATE_QUEUE_ACTIONS.UPDATE_QUEUE),
    flatMap((action) => this.queuesApiService.queuesUpdate(action.payload)
      .pipe(
        flatMap(res => [
          new DeactiveLoader(action.type),
          new createNewQueueActions.SetNewQueueCreationStatus(CREATION_STATUS.SUCCESS),
          new AddMessage(MESSAGES_SEVERITY.SUCCESS, 'Queue Updated Successfully'),
        ]),
        catchError(error => [new DeactiveLoader(action.type), new RequestFailed(error), new AddMessage(MESSAGES_SEVERITY.ERROR, 'Queue Created Failed'), new createNewQueueActions.SetNewQueueCreationStatus(CREATION_STATUS.FAILED)])
      )
    )
  );

  @Effect()
  getAllQueues = this.actions.pipe(
    ofType<createNewQueueActions.GetQueues>(CREATE_QUEUE_ACTIONS.GET_QUEUES),
    switchMap(action => this.queuesApiService.queuesGetAllEx({})
      .pipe(
        flatMap(res => [new createNewQueueActions.SetQueues(res.queues)]),
        catchError(error => [new RequestFailed(error)])
      )
    )
  );
}
