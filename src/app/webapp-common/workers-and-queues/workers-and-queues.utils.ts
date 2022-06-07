import {orderBy} from 'lodash/fp';
import {Worker} from '~/business-logic/model/workers/worker';
import {WorkerExt} from '@common/workers-and-queues/actions/workers.actions';
import {SortMeta} from 'primeng/api';

export const sortTable = <T>(sortFields: SortMeta[], entities: T[]): T[] => {
  const srtByFields = sortFields.map(f => f.field);
  const srtByOrders = sortFields.map(f => f.order > 0 ? 'asc' : 'desc');
  return orderBy<T>(srtByFields, srtByOrders)(entities);
};

export const transformAndSortWorkers = (sortFields, workers: Worker[]): WorkerExt[] => {
  return sortTable<WorkerExt>(sortFields, workers.map(worker => ({...worker, id: worker.key || worker.id, name: worker.id})));
}

