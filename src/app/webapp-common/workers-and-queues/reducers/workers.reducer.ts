import {createReducer, on} from '@ngrx/store';
import {
  WorkerExt,
  getWorkers,
  setWorkers,
  workersTableSetSort, getSelectedWorker, setSelectedWorker, setStats, setStatsParams
} from '../actions/workers.actions';
import {TABLE_SORT_ORDER} from '../../shared/ui-components/data/table/table.consts';
import {TIME_INTERVALS} from '../workers-and-queues.consts';
import {Topic} from '../../shared/utils/statistics';
import {SortMeta} from 'primeng/api';

interface WorkerStoreType {
  data: WorkerExt[];
  selectedWorker: WorkerExt;
  stats: Topic[];
  selectedStatsTimeFrame: string;
  selectedStatsParam: string;
  tableSortFields: SortMeta[];
}

const initWorkersStore: WorkerStoreType = {
  data: null,
  selectedWorker: null,
  stats: null,
  selectedStatsTimeFrame: (3 * TIME_INTERVALS.HOUR).toString(),
  selectedStatsParam: 'cpu_usage;gpu_usage',
  tableSortFields: [{field: 'id', order: TABLE_SORT_ORDER.ASC}],
};

export const workersReducer = createReducer(
  initWorkersStore,
  on(setWorkers, (state, action) => ({...state, data: action.workers})),
  on(setSelectedWorker, getSelectedWorker, (state, action) => ({...state, selectedWorker: action.worker})),
  on(workersTableSetSort, (state, action) => ({...state, tableSortFields: action.orders})),
  on(getWorkers, (state, action) => ({...state, statsRequest: action})),
  on(setStats, (state, action) => ({...state, stats: action.data})),
  on(setStatsParams, (state, action) => ({
    ...state,
    selectedStatsTimeFrame: action.timeFrame,
    selectedStatsParam: action.param
  })),
);
