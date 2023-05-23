import {orderBy} from 'lodash-es';
import {WorkerExt} from '@common/workers-and-queues/actions/workers.actions';
import {SortMeta} from 'primeng/api';

export const sortTable = <T>(sortFields: SortMeta[], entities: T[]): T[] => {
  const srtByFields = sortFields.map(f => f.field);
  const srtByOrders = sortFields.map(f => f.order > 0 ? 'asc' : 'desc');
  return orderBy<T>(entities, srtByFields, srtByOrders);
};

export const transformAndSortWorkers = (sortFields, workers: WorkerExt[]): WorkerExt[] => sortTable<WorkerExt>(sortFields, workers.map(worker => ({
  ...worker,
  originalName: worker.originalName || worker.id,
  id: worker.key || worker.id,
  name: worker.originalName || worker.id
})));
