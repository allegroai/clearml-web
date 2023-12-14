import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {mergeMap, map, switchMap} from 'rxjs/operators';
import {GetQueuesForEnqueue, GET_QUEUES_FOR_ENQUEUE, SetQueuesForEnqueue, GET_TASK_FOR_ENQUEUE, GetTaskForEnqueue, SetTaskForEnqueue} from './select-queue.actions';
import {ApiQueuesService} from '~/business-logic/api-services/queues.service';
import {activeLoader} from '@common/core/actions/layout.actions';
import {ApiTasksService} from '~/business-logic/api-services/tasks.service';

@Injectable()
export class SelectQueueEffects {

  constructor(private actions$: Actions, private store: Store<any>, private apiQueues: ApiQueuesService, private tasksApi: ApiTasksService) {
  }

  activeLoader = createEffect(() => this.actions$.pipe(
    ofType(),
    map((action: any) => activeLoader(action.type))
  ));

  getQueuesForEnqueue$ = createEffect(() => this.actions$.pipe(
    ofType<GetQueuesForEnqueue>(GET_QUEUES_FOR_ENQUEUE),
    switchMap(() => this.apiQueues.queuesGetAllEx({}).pipe(
      mergeMap((res) => [new SetQueuesForEnqueue(res.queues)])
      )
    )));

  getTaskForEnqueue$ = createEffect(() => this.actions$.pipe(
    ofType<GetTaskForEnqueue>(GET_TASK_FOR_ENQUEUE),
    switchMap(action => this.tasksApi.tasksGetAllEx({
        id: action.payload.taskIds,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        only_fields: ['status', 'script.repository', 'script.entry_point', 'script.diff']
      }).pipe(mergeMap((res) => [new SetTaskForEnqueue(res.tasks)]))
    )));
}
