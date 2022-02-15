import {Container} from '~/business-logic/model/tasks/container';
import {Queue} from '~/business-logic/model/queues/queue';

export enum sourceTypesEnum {
  Tag = 'tag',
  VersionNum = 'version_num',
  Branch = 'branch',
}

export interface IExecutionForm {
  source: {
    repository: string;
    tag?: string;
    version_num?: string;
    branch?: string;
    entry_point: string;
    working_dir: string;
    scriptType: sourceTypesEnum;
  };
  docker_cmd?: string;
  requirements: any;
  diff: string;
  output: {
    destination: string;
    logLevel?: 'basic' | 'details'; // TODO: should be enum from gencode.
  };
  queue: Queue;
  container?: Container;
}

