import {TaskStatusEnum} from '../../business-logic/model/tasks/taskStatusEnum';
import {TaskTypeEnum} from '../../business-logic/model/tasks/taskTypeEnum';

export enum EntityTypeEnum {
  experiment = 'experiment',
  model = 'model',
  project = 'project',
}

export enum CircleTypeEnum {
  completed = 'completed',
  running = 'running',
  pending = 'pending',
  empty = 'empty',
  'model-labels' = 'model-labels'
}

export const EXPERIMENTS_STATUS_LABELS = {
  [TaskStatusEnum.Created]     : 'Draft',
  [TaskStatusEnum.Queued]      : 'Pending',
  [TaskStatusEnum.InProgress]  : 'Running',
  [TaskStatusEnum.Completed]   : 'Completed',
  [TaskStatusEnum.Published]   : 'Published',
  [TaskStatusEnum.Failed]      : 'Failed',
  [TaskStatusEnum.Stopped]     : 'Completed',
  [TaskStatusEnum.Closed]      : 'Closed',
  [TaskTypeEnum.Testing]       : 'Testing',
  [TaskTypeEnum.Training]      : 'Training',
  [TaskTypeEnum.Inference]     : 'Inference',
  [TaskTypeEnum.DataProcessing]: 'Data Processing',
  [TaskTypeEnum.Application]   : 'Application',
  [TaskTypeEnum.Monitor]       : 'Monitor',
  [TaskTypeEnum.Controller]    : 'Controller',
  [TaskTypeEnum.Optimizer]     : 'Optimizer',
  [TaskTypeEnum.Service]       : 'Service',
  [TaskTypeEnum.Qc]            : 'Qc',
  [TaskTypeEnum.Custom]        : 'Custom'
};
