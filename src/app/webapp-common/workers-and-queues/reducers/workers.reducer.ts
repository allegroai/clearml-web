import {GET_SELECTED_WORKER, GET_STATS_AND_WORKERS, GetStatsAndWorkers, SET_SELECTED_WORKER_FROM_SERVER, SET_STATS, SET_STATS_PARAMS, SET_WORKERS, SET_WORKERS_TASKS, SetStats, SetWorkers, SYNC_SPECIFIC_WORKER_IN_TABLE, WORKERS_TABLE_SORT_CHANGED} from '../actions/workers.actions';
import {Worker} from '../../../business-logic/model/workers/worker';
import {TABLE_SORT_ORDER, TableSortOrderEnum} from '../../shared/ui-components/data/table/table.consts';
import {TIME_INTERVALS} from '../workers-and-queues.consts';
import {Topic} from '../../shared/utils/statistics';

interface WorkerStoreType {
  data: Worker[];
  selectedWorker: Worker;
  stats: Topic[];
  selectedStatsTimeFrame: string;
  selectedStatsParam: string;
  tableSortField: string;
  tableSortOrder: TableSortOrderEnum;
}

const initWorkersStore: WorkerStoreType = {
  data: null,
  selectedWorker: null,
  stats: null,
  selectedStatsTimeFrame: (3 * TIME_INTERVALS.HOUR).toString(),
  selectedStatsParam: 'cpu_usage;gpu_usage',
  tableSortField: 'id',
  tableSortOrder: TABLE_SORT_ORDER.ASC,
};


export function workersReducer(state = initWorkersStore, action) {
  switch (action.type) {
    case SET_WORKERS:
      return {...state, data: (<SetWorkers>action).payload.workers};
    case SET_WORKERS_TASKS:
      return {...state, data: action.payload.workers};
    case SET_SELECTED_WORKER_FROM_SERVER:
    case GET_SELECTED_WORKER:
      return {...state, selectedWorker: action.payload.worker};
    case SYNC_SPECIFIC_WORKER_IN_TABLE:
      return {
        ...state, data:
          state.data.map(worker => worker.id === action.payload.worker.id ? action.payload.worker : worker)
      };
    case WORKERS_TABLE_SORT_CHANGED:
      return {...state, tableSortOrder: action.payload.sortOrder, tableSortField: action.payload.colId};
    case GET_STATS_AND_WORKERS:
      return {...state, statsRequest: (<GetStatsAndWorkers>action).payload};
    case SET_STATS:
      return {...state, stats: (<SetStats>action).payload.data};
    case SET_STATS_PARAMS:
      return {
        ...state,
        selectedStatsTimeFrame: action.payload.timeFrame,
        selectedStatsParam: action.payload.param
      };
    default:
      return state;
  }
}
