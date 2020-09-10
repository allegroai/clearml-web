import {Task} from '../../../business-logic/model/tasks/task';
import {Model} from '../../../business-logic/model/models/model';
import {Project} from '../../../business-logic/model/projects/project';
import {User} from '../../../business-logic/model/users/user';
import {ExperimentCompareTree} from '../../../features/experiments-compare/experiments-compare-models';


export type ExperimentCompareTrees = Array<ExperimentCompareTree>;


export interface ExperimentDetailBase {
  id?: Task['id'];
  name?: string;
  status?: Task['status'];
  last_iteration?: Task['last_iteration'];
  last_update?: Task['last_update'];
  project?: Project;
  model?: ModelDetails;
  execution?: ExecutionDetails;
  tags?: string[];
}

export interface ExperimentParams {
  id?: Task['id'];
  name?: string;
  status?: Task['status'];
  last_iteration?: Task['last_iteration'];
  last_update?: Task['last_update'];
  project?: Project;
  hyperparams?: any[];
  tags?: string[];
}

export interface ModelDetails {
  model?: ModelDetailsInput;
  source?: ModelDetailsSource;
  network_design?: string;
}

export interface ModelDetailsInput {
  id: Model['id'];
  framework: Model['framework'];
  url: Model['uri'];
  name: Model['name'];
}

export interface ModelDetailsSource {
  experimentName: Task['name'];
  experimentId: Task['id'];
  projectName: Project['name'];
  projectId: Project['id'];
  userName: User['name'];
  timeCreated: Model['created'];
}

export interface ExecutionDetails {
  source?: {
    binary?: string; // Script.binary;
    repository?: string; // Script.repository;
    version?: string; // Script.version_num;
    working_dir?: string; // Script.working_dir;
    script_path?: string; // Script.entry_point;
    branch?: string; // Script.branch;
  };
  uncommitted_changes?: { [key: string]: any };
  installed_packages?: { [key: string]: any };
  base_docker_image?: { [key: string]: any };
}

export interface TreeNodeMetadata {
  classStyle?: string;
}

export interface TreeNode<T> {
  data: T;
  metaData: TreeNodeMetadata;
  parent: TreeNode<T> | null;
  children?: Array<TreeNode<T>>;
}
