export const TASKS_STATUS = {
  CREATED    : 'created',
  IN_PROGRESS: 'in_progress',
  QUEUED     : 'queued',
  COMPLETED  : 'completed',
  STARTED    : 'started',
  UNKNOWN    : 'unknown',
  PUBLISHED  : 'published',
  PUBLISHING : 'publishing',
  STOPPED    : 'stopped',
  FAILED     : 'failed',
  CLOSED     : 'closed'
};

export const TASKS_EXECUTION_PROGRESS = {
  UNKNOWN : 'unknown',
  RUNNING : 'running',
  STOPPING: 'stopping',
  STOPPED : 'stopped'
};

export const TAGS = {
  HIDDEN: 'archived',
  ANNOTATOR_INDEX_TAG_PREFIX: 'annotatorIndex',
  ANNOTATED_NUMBER_TAG_PREFIX: 'annotatedNumber'
};

export const HEAD = 'asc';
export const TAIL = 'desc';


export const VIEWS = {
  TREE : 'TREE',
  TABLE: 'TABLE'
};

export const TASKS_TABLE_COL_FIELDS = {
  RESULT   : 'output.result',
  COMMENT  : 'comment',
  ID       : 'id',
  PROJECT  : 'project.name',
  NAME     : 'name',
  TYPE     : 'type',
  STATUS   : 'status',
  CREATED  : 'created',
  COMPLETED: 'completed',
  USER     : 'user.name',
  PARENT   : 'parent.name'
};

export const ASC  = 1;
export const DESC = -1;

export const metricsIterationsNumber = 5;

export const ARTIFACTS_TYPE = {
  AUDIT_LOG: 'audit-log'
};

export type ArtifactsTypesEnum = 'audit' | 'model';
export const ARTIFACTS_TYPES = {
  AUDIT_LOG: 'audit-log' as ArtifactsTypesEnum,
  Model    : 'model' as ArtifactsTypesEnum,
};
