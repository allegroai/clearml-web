import {Model} from '../../business-logic/model/models/model';


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


// emptyTask




