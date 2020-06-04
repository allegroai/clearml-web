export interface IHyperParamsForm {
  parameters: Array<IExecutionParameter>;
}

export interface IExecutionParameter {
  id?: string;
  label: any;
  key: string;
}
