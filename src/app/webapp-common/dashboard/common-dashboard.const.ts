export type TaskTableColFieldsEnum = 'output.result' | 'comment' | 'id' | 'project.name' | 'name' | 'type' | 'status' | 'started' | 'last_update' | 'user.name' | 'queue.name' | 'worker.name';
export const CARDS_IN_ROW                  = 6;
export const RECENT_TASKS_TABLE_COL_FIELDS = {
  RESULT     : 'output.result' as TaskTableColFieldsEnum,
  COMMENT    : 'comment' as TaskTableColFieldsEnum,
  ID         : 'id' as TaskTableColFieldsEnum,
  PROJECT    : 'project.name' as TaskTableColFieldsEnum,
  NAME       : 'name' as TaskTableColFieldsEnum,
  TYPE       : 'type' as TaskTableColFieldsEnum,
  STATUS     : 'status' as TaskTableColFieldsEnum,
  STARTED    : 'started' as TaskTableColFieldsEnum,
  LAST_UPDATE: 'last_update' as TaskTableColFieldsEnum,
  USER       : 'user.name' as TaskTableColFieldsEnum,
  QUEUE      : 'queue.name' as TaskTableColFieldsEnum,
  WORKER     : 'worker.name' as TaskTableColFieldsEnum
};


export const DASHBOARD_PREFIX = 'DASHBOARD_';

export const DASHBOARD_ACTIONS = {
  GET_RECENT_PROJECTS: DASHBOARD_PREFIX + 'GET_RECENT_PROJECTS',
  SET_RECENT_PROJECTS: DASHBOARD_PREFIX + 'SET_RECENT_PROJECTS',
  GET_RECENT_TASKS   : DASHBOARD_PREFIX + 'GET_RECENT_TASKS',
  SET_RECENT_TASKS   : DASHBOARD_PREFIX + 'SET_RECENT_TASKS',
  CREATE_PROJECT     : DASHBOARD_PREFIX + 'CREATE_PROJECT',
};
