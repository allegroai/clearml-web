import {
  ADD_QUEUES_TASKS, SET_QUEUES, SET_QUEUES_TASKS, SET_SELECTED_QUEUE,
  SET_SELECTED_QUEUE_FROM_SERVER, SYNC_SPECIFIC_QUEUE_IN_TABLE, GET_STATS,
  GetStats, SET_STATS, SetStats, SET_STATS_PARAMS, QUEUES_TABLE_SORT_CHANGED
} from '../actions/queues.actions';
import {Queue} from '../../../business-logic/model/queues/queue';
import {QUEUES_TABLE_COL_FIELDS, TIME_INTERVALS} from '../workers-and-queues.consts';
import {TABLE_SORT_ORDER} from '../../shared/ui-components/data/table/table.consts';

const initQueues = {
  data                  : <Array<Queue>>null,
  selectedQueue         : <Queue>null,
  tasks                 : <Array<any>>null,
  stats                 : {wait: null, length: null},
  selectedStatsTimeFrame: (3 * TIME_INTERVALS.HOUR).toString(),
  tableSortField        : QUEUES_TABLE_COL_FIELDS.NAME,
  tableSortOrder        : TABLE_SORT_ORDER.ASC,
};


export function queuesReducer(state = initQueues, action) {
  switch (action.type) {
    case SET_QUEUES:
      return {...state, data: action.payload.queues};
    case SET_QUEUES_TASKS:
      return {...state, data: action.payload.queues};
    case SET_SELECTED_QUEUE:
    case SET_SELECTED_QUEUE_FROM_SERVER:
      return {...state, selectedQueue: action.payload.queue};
    case SYNC_SPECIFIC_QUEUE_IN_TABLE:
      return {
        ...state, data:
          state.data.map(queue => queue.id === action.payload.queue.id ? action.payload.queue : queue)
      };
    case ADD_QUEUES_TASKS:
      return {...state, tasks: {...state.tasks, [action.payload.queueId]: action.payload.tasks}};
    case SET_STATS:
      return {...state, stats: (<SetStats>action).payload.data};
    case QUEUES_TABLE_SORT_CHANGED:
      return {...state, tableSortOrder: action.payload.sortOrder, tableSortField: action.payload.colId};
    case SET_STATS_PARAMS:
      return {
        ...state,
        selectedStatsTimeFrame: action.payload.timeFrame,
      };
    default:
      return state;
  }
}
