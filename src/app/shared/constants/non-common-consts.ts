import {TaskStatusEnum} from '../../business-logic/model/tasks/taskStatusEnum';
import {TaskTypeEnum} from '../../business-logic/model/tasks/taskTypeEnum';

export const PROJECT_ROUTES = ['experiments', 'models'];
export type PROJECT_ROUTES_TYPE = 'models' | 'experiments';

export const EXPERIMENTS_STATUS_LABELS = {
  [TaskStatusEnum.Created]      : 'Draft',
  [TaskStatusEnum.Queued]       : 'Pending',
  [TaskStatusEnum.InProgress]   : 'Running',
  [TaskStatusEnum.Completed]    : 'Completed',
  [TaskStatusEnum.Published]    : 'Published',
  [TaskStatusEnum.Failed]       : 'Failed',
  [TaskStatusEnum.Stopped]      : 'Completed',
  [TaskStatusEnum.Closed]       : 'Closed',
  [TaskTypeEnum.Testing]        : 'Testing',
  [TaskTypeEnum.Training]       : 'Training'
};
