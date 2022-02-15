import {
  queuesTableSetSort, setQueues, setSelectedQueue, setSelectedQueueFromServer, syncSpecificQueueInTable, setStats, setStatsParams
} from '../actions/queues.actions';
import {Queue} from '../../../business-logic/model/queues/queue';
import {QUEUES_TABLE_COL_FIELDS, TIME_INTERVALS} from '../workers-and-queues.consts';
import {TABLE_SORT_ORDER} from '../../shared/ui-components/data/table/table.consts';
import {SortMeta} from 'primeng/api';
import {ITask} from '../../../business-logic/model/al-task';

interface QueueStoreType {
  data: Queue[];
  selectedQueue: Queue;
  tasks: ITask[];
  stats: {wait: any; length: number};
  selectedStatsTimeFrame: string;
  tableSortFields: SortMeta[];
}

const initQueues: QueueStoreType = {
  data                  : null as Queue[],
  selectedQueue         : null as Queue,
  tasks                 : null as any[],
  stats                 : {wait: null, length: null},
  selectedStatsTimeFrame: (3 * TIME_INTERVALS.HOUR).toString(),
  tableSortFields       : [{field: QUEUES_TABLE_COL_FIELDS.NAME, order: TABLE_SORT_ORDER.ASC}],
};


export function queuesReducer(state = initQueues, action) {
  switch (action.type) {
    case setQueues.type:
      return {...state, data: action.queues};
    // case SET_QUEUES_TASKS:
    //   return {...state, data: action.payload.queues};
    case setSelectedQueue.type:
    case setSelectedQueueFromServer.type:
      return {...state, selectedQueue: action.queue};
    case syncSpecificQueueInTable.type:
      return {
        ...state, data:
          state.data.map(queue => queue.id === action.queue?.id ? action.queue : queue)
      };
    // case ADD_QUEUES_TASKS:
    //   return {...state, tasks: {...state.tasks, [action.queueId]: action.tasks}};
    case setStats.type:
      return {...state, stats: (action as ReturnType<typeof setStats>).data};
    case queuesTableSetSort.type:
      return {...state, tableSortFields: action.orders};
    case setStatsParams.type:
      return {
        ...state,
        selectedStatsTimeFrame: action.timeFrame,
      };
    default:
      return state;
  }
}
