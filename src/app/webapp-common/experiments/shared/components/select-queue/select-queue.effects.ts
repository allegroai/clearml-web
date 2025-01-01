import {Injectable} from '@angular/core';
import {calculateQueuesCaption} from '@common/workers-and-queues/workers-and-queues.utils';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {mergeMap, map, switchMap} from 'rxjs/operators';
import {getQueuesForEnqueue, setQueuesForEnqueue, getTaskForEnqueue, setTaskForEnqueue} from './select-queue.actions';
import {ApiQueuesService} from '~/business-logic/api-services/queues.service';
import {activeLoader} from '@common/core/actions/layout.actions';
import {ApiTasksService} from '~/business-logic/api-services/tasks.service';

@Injectable()
export class SelectQueueEffects {

  constructor(private actions$: Actions, private store: Store, private apiQueues: ApiQueuesService, private tasksApi: ApiTasksService) {
  }

  activeLoader = createEffect(() => this.actions$.pipe(
    ofType(),
    map((action: any) => activeLoader(action.type))
  ));

  getQueuesForEnqueue$ = createEffect(() => this.actions$.pipe(
      ofType(getQueuesForEnqueue),
      switchMap(() => this.apiQueues.queuesGetAllEx({}).pipe(
        mergeMap((res) => [setQueuesForEnqueue({queues: calculateQueuesCaption(res.queues)})])
        )
      )));

  getTaskForEnqueue$ = createEffect(() => this.actions$.pipe(
    ofType(getTaskForEnqueue),
    switchMap(action => this.tasksApi.tasksGetAllEx({
        id: action.taskIds,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        only_fields: ['status', 'script.repository', 'script.entry_point', 'script.diff']
      }).pipe(mergeMap((res) => [setTaskForEnqueue({tasks: res.tasks})]))
    )));
}
