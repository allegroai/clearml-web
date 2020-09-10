import {ParamsItem} from '../../../business-logic/model/tasks/paramsItem';

export interface IHyperParamsForm {
  [key: string]: ParamsItem[]
};



export interface IExecutionParameter {
  id?: string;
  label: any;
  key: string;
}
