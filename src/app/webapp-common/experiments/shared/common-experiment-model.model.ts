import {Model} from '~/business-logic/model/models/model';
import {Project} from '~/business-logic/model/projects/project';
import {User} from '~/business-logic/model/users/user';
import {Task} from '~/business-logic/model/tasks/task';
import {Artifact} from '~/business-logic/model/tasks/artifact';
import {ITask} from '~/business-logic/model/al-task';
import {DataDictionary} from '@common/experiments-compare/experiments-compare.constants';
import {
  IOption
} from '@common/shared/ui-components/inputs/select-autocomplete-with-chips/select-autocomplete-with-chips.component';

export interface IModelInfo extends  Omit<Model, 'project' | 'task' | 'user' | 'company'> {
  project?: Project;
  task?: ITask;
  taskName?: string;
  user?: User;
  company?: {id: string; name: string};
  design?: any;
}

export interface CompareIModelInfo extends  Omit<IModelInfo,  'id'> {
  project?: Project;
  task?: ITask;
  taskName?: string;
  user?: User;
  id?: DataDictionary;
}

export interface IModelInfoInput {
  id?: Model['id'];
  framework: Model['framework'];
  uri: Model['uri'];
  name: Model['name'];
  labels: Model['labels'];
  project?: Project;
  design?: any;
}

export interface IModelFormOutput {
  name: Model['name'];
}

export interface IModelInfoOutput {
  id?: Model['id'];
  name: Model['name'];
  uri: Model['uri'];
  project?: Project;
  design?: any;
}

export interface IModelInfoSource {
  experimentName?: Task['name'];
  experimentId?: Task['id'];
  projectName?: Project['name'];
  projectId?: Project['id'];
  userName?: User['name'];
  timeCreated?: Model['created'];
}

export interface IExperimentModelForm {
  output: IModelFormOutput;
  prototext: string;
}

export interface IExperimentModelInfo {
  input?: IModelInfo[];
  output?: IModelInfo[];
  artifacts?: Artifact[];
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
  type?: Task['type'];
  name?: Task['name'];
  created?: Task['created'];
  completed?: Task['completed'];
  status?: Task['status'];
  system_tags?: Task['system_tags'];
  tags?: Task['tags'];
  last_update?: Task['last_update'];
  parent?: {id: string; name: string; project?: {id: string}};
}

export interface CloneExperimentPayload {
  project?: IOption ;
  name: string;
  comment: string;
  newProjectName?: string;
  forceParent?: boolean;
}


export interface ExtendForm {
  project: string;
  name: string;
  comment: string;
}
