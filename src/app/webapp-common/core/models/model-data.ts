import {Model} from '../../../business-logic/model/models/model';

export interface IExecution {
  queue: string;
  // script { "$ref": "#/definitions/script" }
  test_split: number;
  parameters: any;
  model: Model ;// TODO should be IModel
  model_desc: any;
  model_labels: any;
  framework: string;
}

export interface ItaskOutput {
  view: ITaskView;
  destination: string;
  model: string;
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
