import {TaskStatusEnum} from '../../../business-logic/model/tasks/taskStatusEnum';
import {TaskTypeEnum} from '../../../business-logic/model/tasks/taskTypeEnum';
import {EXPERIMENTS_STATUS_LABELS} from '../../../features/experiments/shared/experiments.const';

export type ExperimentWizardMethodsEnum = 'create' | 'edit' | 'clone' | 'extend';

export const EXPERIMENTS_STORE_KEY = 'experiments';

export const WIZARD_METHODS = {
  CREATE: 'create' as ExperimentWizardMethodsEnum,
  CLONE : 'clone' as ExperimentWizardMethodsEnum,
  EDIT  : 'edit' as ExperimentWizardMethodsEnum,
  EXTEND: 'extend' as ExperimentWizardMethodsEnum,
};

export type ExperimentsViewModesEnum = 'table' | 'tree';
export const EXPERIMENTS_VIEW_MODES = {
  TABLE: 'table' as ExperimentsViewModesEnum,
  TREE : 'tree' as ExperimentsViewModesEnum,
};
export const HELP_TEXTS = {
  MODEL_INPUT               : 'Here you see the an overview of the input models, its location and framework.',
  MODEL_SOURCE              : 'The overview of the experiment, project directory, user and timestamp.',
  MODEL_OUTPUT              : 'The new models evolved out of the experiment, provide a name for it.',
  MODEL_NETWORK_DESIGN      : 'A visual representation of the network design: the layers and operations which connect them.\n' +
    'The analysis provides a report on the resources consumed by each layer in the experiment in memory and flops.\n',
  EXECUTION_SOURCE_CODE     : 'Here you define the code of the experiment. Specify the git or mercurial repository, working directory and path to the initial commit of the code to ensure that your experiment runs the right code.\n',
  EXECUTION_HYPER_PARAMETERS: 'These are the variation parameters defined in your code where you want to easily change values per experiment. The key is the name used in your code, and the value which it will insert.',
  EXECUTION_OUTPUT          : 'The destination for the results of your experiment. Credentials are defined in your config file.',
};
export const EXPERIMENTS_METRICS_TYPES = {
  SCALAR: 'scalar',
  PLOTS : 'plots'
};
export const EXPERIMENTS_PAGE_SIZE = 15;
export const EXPERIMENT_TABLE_ONLY_FIELDS = ['id', 'type', 'name', 'started', 'completed', 'status', 'system_tags', 'user.name', 'last_metrics', 'last_update', 'active_duration'];

export const FILTERED_EXPERIMENTS_STATUS_OPTIONS = Object.entries(EXPERIMENTS_STATUS_LABELS)
  .filter(([key, val]: [TaskStatusEnum, string]) => ![TaskStatusEnum.Closed].includes(key))
  .map(([key, val]) => ({label: val, value: key}));
export const EXPERIMENTS_TYPES_LABELS = {
  [TaskTypeEnum.Training]: 'Training',
  [TaskTypeEnum.Testing] : 'Testing',
};
export const EXPERIMENT_GRAPH_ID_PREFIX = 'metric_name_';
export const SINGLE_GRAPH_ID_PREFIX = 'single_graph_name_';

// temp, will be taken from the generated code.
export type TaskTagsEnum = 'archived';

export const TASK_TAGS = {
  HIDDEN: 'archived' as TaskTagsEnum
};

export const LOG_BATCH_SIZE = 100;

export enum ThemeEnum {
  Dark = 'dark',
  Light = 'light'
}

export enum CustomColumnMode {
  Metrics = 'dark',
  HyperParams = 'light'
}

export const NONE_USER_TASK_TYPES = ['-dataset_import', '-annotation', '-annotation_manual'];
