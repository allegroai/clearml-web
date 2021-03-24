//table
import {Model} from '../../../business-logic/model/models/model';
import {User} from '../../../business-logic/model/users/user';
import {Task} from '../../../business-logic/model/tasks/task';
import {Project} from '../../../business-logic/model/projects/project';

export type ModelTableColFieldsEnum = 'system_tags' | 'id' | 'project.name' | 'name' | 'created' | 'framework' | 'user.name' | 'ready' | 'task.name' | 'selected';

export interface SelectedModel extends Omit<Model, 'user' | 'task' | 'project'> {
  user?: User;
  company?: any;
  task?: Task;
  project?: Project;
  readOnly?: boolean;
}

export interface TableModel {
  id: Model['id'];
  system_tags: Model['system_tags'];
  ready: Model['ready'];
  name: Model['name'];
  tags: Model['tags'];
}

// export interface IModelInfo {
//   models: string;
//   modelDesc: any;
//   optionalEnumerationLabels: Array<{label: any, id:string}>;
//   framework: FrameworkTypeEnum;
// }

export interface ISelectedModelInput {
//   /**
//    * View params
//    */
//   view?:Model['view V
//   /**
//    * Filtering params
//    */
//   frames_filter?:Model['frames_filter F
//   /**
//    * Mapping params (see common definitions section)
//    */
//   mapping?:Model['mapping M
//   /**
//    * Augmentation parameters. Only for training and testing models.
//    */
//   augmentation?:Model['augmentation I
//   /**
//    * Iteration parameters. Not applicable for register (import) models.
//    */
//   iteration?:Model['iteration I
}
