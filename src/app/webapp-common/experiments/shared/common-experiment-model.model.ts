import {Model} from '../../../business-logic/model/models/model';
import {Project} from '../../../business-logic/model/projects/project';
import {User} from '../../../business-logic/model/users/user';
import {Task} from '../../../business-logic/model/tasks/task';
import {Artifact} from '../../../business-logic/model/tasks/artifact';

export interface IModelInfoInput {
  id: Model['id'];
  framework: Model['framework'];
  url: Model['uri'];
  name: Model['name'];
  labels: Model['labels'];
  project?: Project;
  design?: any;
}

export interface IModelFormOutput {
  name: Model['name'];
}

export interface IModelInfoOutput {
  id: Model['id'];
  name: Model['name'];
  url: Model['uri'];
  project?: Project;
  design?: any;
}

export interface IModelInfoSource {
  experimentName: Task['name'];
  experimentId: Task['id'];
  projectName: Project['name'];
  projectId: Project['id'];
  userName: User['name'];
  timeCreated: Model['created'];
}

export interface IExperimentModelForm {
  output: IModelFormOutput;
  prototext: string;
}

export interface IExperimentModelInfo {
  input: IModelInfoInput;
  output: IModelInfoOutput;
  source: IModelInfoSource;
  artifacts: Artifact[];
}

export type ExperimentTableColFieldsEnum =
  'output.result'
  | 'comment'
  | 'id'
  | 'project.name'
  | 'name'
  | 'type'
  | 'status'
  | 'created'
  | 'completed'
  | 'user.name'
  | 'queue.name'
  | 'last_worker'
  | 'selected'
  | 'last_iteration'
  | 'last_update'
  | 'parent'
  | 'tags';

export interface ITableExperiment {
  id: Task['id'];
  type: Task['type'];
  name: Task['name'];
  created: Task['created'];
  completed: Task['completed'];
  status: Task['status'];
  system_tags: Task['system_tags'];
  tags: Task['tags'];
  last_update: Task['last_update'];
  parent: {id: string; name: string; project?: {id: string}};
}

export interface CloneForm {
  project?: any;
  name: string;
  comment: string;
  newProjectName?: string;
}

export interface CloneExperimentPayload {
  project?: string ;
  name: string;
  comment: string;
  newProjectName?: string;
}


export interface ExtendForm {
  project: string;
  name: string;
  comment: string;
}
