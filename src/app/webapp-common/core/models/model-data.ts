import {Model} from '../../../business-logic/model/models/model';
import {Execution} from '../../../business-logic/model/tasks/execution';
import {Queue} from '../../../business-logic/model/queues/queue';

export interface IBaseExecution extends  Omit<Execution, 'model' | 'queue'> {
  model: Model;
  queue: Queue;
}

export interface ItaskOutput {
  view: ITaskView;
  destination: string;
  model: Model;
  result: string;
  error: string;
}

export interface ITaskView {
  entries: Array<ITaskViewEntry>;
}

export interface ITaskViewEntry {
  version: string;
  dataset: string;
}

export interface IIteration {
  order: string;
  jump: IJump;
  min_sequence: number;
  infinite: boolean;
  limit: number;
}

export interface IJump {
  time: number;
}

// emptyTask
