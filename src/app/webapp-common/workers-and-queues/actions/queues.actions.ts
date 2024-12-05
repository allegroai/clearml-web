import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {Queue as BLQueue} from '~/business-logic/model/queues/queue';
import {Topic} from '../../shared/utils/statistics';
import {SortMeta} from 'primeng/api';

export interface Queue extends Omit<BLQueue, 'id'> {
  id: string;
}

export const queueActions = createActionGroup({
  source: 'Queues',
  events: {
    'get queues': emptyProps(),
    'set queues': props<{ queues: Array<Queue> }>(),
    'queues table sort changed': props<{ colId: string; isShift: boolean }>(),
    'queues table set sort': props<{ orders: SortMeta[] }>(),
    'set selected queue': props<{ queue?: Queue }>(),
    'clear queue': props<{ queue?: Queue }>(),
    'refresh selected queue': props<{autoRefresh?: boolean}>(),
    'set selected queue from server': props<{ queue?: Queue }>(),
    'delete queue': props<{ queue?: Queue }>(),
    'move experiment to bottom of queue': props<{ task: string }>(),
    'move experiment to top of queue': props<{ task: string }>(),
    'move experiment in queue': props<{ task: string; count: number }>(),
    'remove experiment from queue': props<{ task: string }>(),
    'move experiment to other queue': props<{ task: string; queueId: string; queueName: string }>(),
    'add experiment to queue': props<{ task: string; queueId: string; queueName: string }>(),
    'get stats': props<{ maxPoints?: number }>(),
    'set stats': props<{ data: { wait: Topic[]; length: Topic[] } }>(),
    'reset stats': emptyProps(),
    'set stats params': props<{ timeFrame: string; maxPoints?: number }>(),
  }
});
