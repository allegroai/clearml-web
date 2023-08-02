import * as createNewQueueActions from './queue-create-dialog.actions';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Injectable} from '@angular/core';
import {CREATION_STATUS} from './queue-create-dialog.reducer';
import {catchError, mergeMap, map, switchMap} from 'rxjs/operators';
import {activeLoader, addMessage, deactivateLoader} from '../../core/actions/layout.actions';
import {requestFailed} from '../../core/actions/http.actions';
import {ApiQueuesService} from '~/business-logic/api-services/queues.service';
import {MESSAGES_SEVERITY} from '@common/constants';

@Injectable()
export class QueueCreateDialogEffects {
  constructor(private actions: Actions, private queuesApiService: ApiQueuesService) {
  }

  activeLoader = createEffect(() => this.actions.pipe(
    ofType(createNewQueueActions.createNewQueue),
    map(action => activeLoader(action.type))
  ));

  createQueue = createEffect(() => this.actions.pipe(
    ofType(createNewQueueActions.createNewQueue),
    mergeMap((action) => this.queuesApiService.queuesCreate({name: action.name})
      .pipe(
        mergeMap(() => [
          deactivateLoader(action.type),
          createNewQueueActions.setCreationStatus({status: CREATION_STATUS.SUCCESS}),
          addMessage(MESSAGES_SEVERITY.SUCCESS, 'Queue Created Successfully'),
        ]),
        catchError(error => [deactivateLoader(action.type),
          requestFailed(error),
          addMessage(MESSAGES_SEVERITY.ERROR, 'Queue Created Failed'),
          createNewQueueActions.setCreationStatus({status: CREATION_STATUS.FAILED})
        ])
      )
    )
  ));

  updateQueue = createEffect(() => this.actions.pipe(
    ofType(createNewQueueActions.updateQueue),
    mergeMap((action) => this.queuesApiService.queuesUpdate(action.queue)
      .pipe(
        mergeMap(() => [
          deactivateLoader(action.type),
          createNewQueueActions.setCreationStatus({status: CREATION_STATUS.SUCCESS}),
          addMessage(MESSAGES_SEVERITY.SUCCESS, 'Queue Updated Successfully'),
        ]),
        catchError(error => [
          deactivateLoader(action.type),
          requestFailed(error),
          addMessage(MESSAGES_SEVERITY.ERROR, 'Queue Update Failed'),
          createNewQueueActions.setCreationStatus({status: CREATION_STATUS.FAILED})
        ])
      )
    )
  ));

  getAllQueues = createEffect(() => this.actions.pipe(
    ofType(createNewQueueActions.getQueues),
    switchMap(() => this.queuesApiService.queuesGetAllEx({})
      .pipe(
        mergeMap(res => [createNewQueueActions.setQueues({queues: res.queues})]),
        catchError(error => [requestFailed(error)])
      )
    )
  ));
}
