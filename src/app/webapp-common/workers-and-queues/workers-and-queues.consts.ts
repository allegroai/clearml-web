export const QUEUES_TABLE_COL_FIELDS = {
  ID          : 'id',
  NAME        : 'name',
  USER        : 'user.name',
  QUEUED      : 'status_changed',
  TASK        : 'entries[0].task.name',
  IN_QUEUE    : 'entries.length',
  LAST_UPDATED: 'last_update'
};

export const WORKERS_TABLE_COL_FIELDS = {
  ID               : 'id',
  TASK             : 'task.name',
  TASK_RUNNING_TIME: 'task.running_time',
  TASK_ITERATIONS  : 'task.last_iteration'
};

const MiB                            = 1024 * 1024;
export const WORKER_STATS_PARAM_INFO = {
  cpu_usage      : {title: 'CPU Usage', multiply: 1},
  gpu_usage      : {title: 'GPU Usage', multiply: 1},
  memory_used    : {title: 'Memory Used', multiply: MiB},
  gpu_memory_used: {title: 'GPU Memory', multiply: MiB},
  network_rx     : {title: 'Network Receive', multiply: MiB},
  network_tx     : {title: 'Network Transmit', multiply: MiB}
};

const HOUR  = 60 * 60;
const DAY   = HOUR * 24;
const WEEK  = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR  = 365 * DAY;

export const TIME_INTERVALS = {
  HOUR,
  DAY,
  WEEK,
  MONTH,
  YEAR
};
