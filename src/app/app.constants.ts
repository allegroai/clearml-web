import {environment} from '../environments/environment';
import {Action} from '@ngrx/store';

export const NA                      = 'N/A';
export const ALLEGRO_TUTORIAL_BUCKET = 'allegro-tutorials';
export const UPDATE_SERVER_PATH      = 'https://updates.trains.allegro.ai';

export const BASE_REGEX = {
  DOMAIN           : '([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\\.)+([A-Za-z]{2,6}\\.?|[A-Za-z0-9-]{1,}[A-Za-z0-9]\\.?)',
  PATH             : '(\\/?|[\\/?]\\S+)',
  IPV4             : '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}',
  IPV6             : '\\[?[A-F0-9]*:[A-F0-9:]+\\]?',
  FILE_PROTOCOL    : '[fF][iI][lL][eE]:\\/\\/',
  S3_PROTOCOL      : '[sS]3:\\/\\/',
  GS_PROTOCOL      : '[gG][sS]:\\/\\/',
  AZURE_PROTOCOL   : 'azure:\\/\\/',
  SCHEME           : '^[hH][tT][tT][pP][sS]?:\\/\\/',
  FILE_SUFFIX      : '\\/\\S*[^\\/ ]+$',
  FOLDER           : '\\/\\S*[^\\/ ]',
  S3_BUCKET_NAME   : '(\\w[A-Za-z0-9\\-]+\\w\\.)*\\w[A-Za-z0-9\\-]+\\w',
  GS_BUCKET_NAME   : '(\\w[A-Za-z0-9\\-_]+\\w\\.)*\\w[A-Za-z0-9\\-_]+\\w',
  AZURE_BUCKET_NAME: '(\\w[A-Za-z0-9\\-_]+\\w\\.)*\\w[A-Za-z0-9\\-_]+\\w'
};

export const URI_REGEX = {
  S3_WITH_BUCKET            : BASE_REGEX.S3_PROTOCOL + BASE_REGEX.S3_BUCKET_NAME + BASE_REGEX.PATH,
  GS_WITH_BUCKET            : BASE_REGEX.GS_PROTOCOL + BASE_REGEX.GS_BUCKET_NAME + BASE_REGEX.PATH,
  S3_WITH_BUCKET_AND_HOST   : BASE_REGEX.S3_PROTOCOL + BASE_REGEX.S3_BUCKET_NAME + BASE_REGEX.DOMAIN + BASE_REGEX.PATH,
  GS_WITH_BUCKET_AND_HOST   : BASE_REGEX.GS_PROTOCOL + BASE_REGEX.GS_BUCKET_NAME + BASE_REGEX.DOMAIN + BASE_REGEX.PATH,
  AZURE_WITH_BUCKET_AND_HOST: BASE_REGEX.AZURE_PROTOCOL + BASE_REGEX.AZURE_BUCKET_NAME + BASE_REGEX.DOMAIN + BASE_REGEX.PATH,
  NON_AWS_S3                : BASE_REGEX.S3_PROTOCOL + '(' + BASE_REGEX.DOMAIN + '|' +
    '(localhost|LOCALHOST)' +
    BASE_REGEX.IPV4 + '|' +
    BASE_REGEX.IPV6 + ')' +
    '(:\\d+)?\\/' + // optional port.
    BASE_REGEX.S3_BUCKET_NAME +
    BASE_REGEX.PATH,
  HTTP                      : BASE_REGEX.SCHEME + '(' + BASE_REGEX.DOMAIN + '|' +
    '(localhost|LOCALHOST)|' +
    BASE_REGEX.IPV4 + '|' +
    BASE_REGEX.IPV6 + ')' +
    '(:\\d+)?',
  FILE                      : BASE_REGEX.FILE_PROTOCOL + BASE_REGEX.FOLDER,
  FILE_WITH_FILE_NAME       : BASE_REGEX.FILE_PROTOCOL + '(' + BASE_REGEX.FOLDER + ')?' + BASE_REGEX.FILE_SUFFIX
};


export const TASK_TYPES = {
  TRAINING         : 'training',
  ANNOTATION       : 'annotation',
  MANUAL_ANNOTATION: 'annotation_manual',
  TESTING          : 'testing',
};


const formPrefix           = 'FORM_';
export const FORMS_ACTIONS = {
  SET_FORM_DATA     : formPrefix + 'SET_FORM_DATA',
  SET_FORM_STATUS   : formPrefix + 'SET_FORM_STATUS',
  SET_FORM_SUBMITTED: formPrefix + 'SET_FORM_SUBMITTED'
};

const recentTasksPrefix = 'RECENT_TASKS';

export const RECENT_TASKS_ACTIONS = {
  GET_RECENT_TASKS: recentTasksPrefix + 'GET_RECENT_TASKS',
  SET_RECENT_TASKS: recentTasksPrefix + 'SET_RECENT_TASKS'
};


export const AUTH_PREFIX  = 'AUTH_';
export const AUTH_ACTIONS = {
  ADD_CREDENTIAL              : AUTH_PREFIX + 'ADD_CREDENTIAL',
  CREATE_CREDENTIAL           : AUTH_PREFIX + 'CREATE_CREDENTIAL (API)',
  CREATE_SUCCESS              : AUTH_PREFIX + 'CREATE_SUCCESS',
  GET_SUCCESS                 : AUTH_PREFIX + 'GET_SUCCESS',
  REVOKE_SUCCESS              : AUTH_PREFIX + 'REVOKE_SUCCESS',
  RESET_NEW_CREDENTIAL        : AUTH_PREFIX + 'RESET_NEW_CREDENTIAL',
  GET_TASK_TOKEN_SUCCESS      : AUTH_PREFIX + 'GET_TASK_TOKEN_SUCCESS',
  SET_TASK_TOKEN              : AUTH_PREFIX + 'SET_TASK_TOKEN',
  GET_ALL_CREDENTIALS         : AUTH_PREFIX + 'GET_ALL_CREDENTIALS (API)',
  UPDATE_ALL_CREDENTIALS      : AUTH_PREFIX + 'UPDATE_ALL_CREDENTIALS',
  UPDATE_S3_BUCKET_CREDENTIALS: AUTH_PREFIX + 'UPDATE_S3_BUCKET_CREDENTIALS',
  REVOKE_CREDENTIAL           : AUTH_PREFIX + 'REVOKE_CREDENTIAL (API)'
};

export const S3_ACTIONS = {
  RESET_DONT_SHOW_AGAIN_FOR_BUCKET_ENDPOINT: AUTH_PREFIX + 'RESET_DONT_SHOW_AGAIN_FOR_BUCKET_ENDPOINT',
  CANCEL_BUCKET_CREDENTIALS                : AUTH_PREFIX + 'CANCEL_BUCKET_CREDENTIALS',
  SHOW_S3_POPUP                            : AUTH_PREFIX + 'SHOW_S3_POPUP',
  RESET_SHOW_S3_POPUP                      : AUTH_PREFIX + 'RESET_SHOW_S3_POPUP',
  SHOW_LOCAL_FILE_POPUP                    : AUTH_PREFIX + 'SHOW_LOCAL_FILE_POPUP',
  SET_BUCKETS_CREDENTIALS                  : AUTH_PREFIX + 'SET_BUCKETS_CREDENTIALS',
  SET_BUCKET_CREDENTIALS                   : AUTH_PREFIX + 'SET_BUCKET_CREDENTIALS',
  GET_TUTORIAL_BUCKET_CREDENTIALS          : AUTH_PREFIX + 'GET_TUTORIAL_BUCKET_CREDENTIALS'
};

export const ICONS = {
  CREATED          : 'fa-plus',
  MINUS            : 'fa-minus',
  CHART            : 'fa-chart-area',
  QUEUED           : 'fa-hourglass',
  ENQUEUE          : 'fa-hourglass',
  DEQUEUE          : 'fa-undo',
  IN_PROGRESS      : 'fa-hourglass-half',
  STOPPED          : 'fa-square',
  RESUME           : 'fa-hourglass-half',
  CLOSED           : 'fa-circle-o',
  FAILED           : 'fa-times',
  FALSE            : 'fa-times',
  PUBLISHED        : 'fa-check',
  PUBLISHING       : 'fa-spinner',
  TRUE             : 'fa-check',
  ANNOTATION       : 'fa-puzzle-piece',
  TASK             : 'fa-briefcase',
  MODEL            : 'fa-cube',
  SHOW             : 'fa-eye',
  HIDE             : 'fa-eye-slash',
  COMPLETED        : 'fa-circle',
  ABORTED          : 'fa-circle',
  UNKNOWN          : 'fa-question-circle',
  TESTING          : 'fa-balance-scale',
  IMPORT           : 'fa-download',
  TRAINING         : 'fa-cube',
  ANNOTATION_MANUAL: 'fa-edit',
  ADMIN            : 'fa-cogs',
  WARNING          : 'fa-exclamation-triangle',
  OUTPUT           : 'fa-folder-open',
  EXECUTION        : 'fa-terminal',
  LIST             : 'fa-list',
  REMOVE           : 'fa-trash',
  ADD              : 'fa-plus',
  TREE             : 'fa-code-branch',
  TABLE            : 'fa-table',
  SELECTED         : 'fa-check-square-o',
  PROJECT          : 'fa-list-alt',
  FOCUS            : 'fa-crosshairs',
  LOG              : 'fa-file-text-o',
  METRICS          : 'fa-chart-area',
  TOKEN            : 'fa-key',
  EDIT             : 'fa-pencil-square-o',
  EDITABLE         : 'fa-pencil-alt',
  RESET            : 'fa-sync',
  CLONE            : 'fa-clone',
  EXTEND           : 'fa-code-branch',
  DOWNLOAD         : 'fa-download',
  WORKER           : 'fa-microchip',

};


export const VIEW_PREFIX  = 'VIEW_';
export const VIEW_ACTIONS = {
  SET_SERVER_UPDATES_AVAILABLE: VIEW_PREFIX + 'SET_SERVER_UPDATES_AVAILABLE',
  SET_SERVER_ERROR            : VIEW_PREFIX + 'SET_SERVER_ERROR',
  SET_RESULT_MESSAGE          : VIEW_PREFIX + 'SET_RESULT_MESSAGE',
  DEACTIVE_LOADER             : VIEW_PREFIX + 'DEACTIVE_LOADER',
  ACTIVE_LOADER               : VIEW_PREFIX + 'ACTIVE_LOADER',
  VISIBILITY_CHANGED          : VIEW_PREFIX + 'VISIBILITY_CHANGED',
  RESET_LOADER                : VIEW_PREFIX + 'RESET_LOADER',
  SET_BACKDROP                : VIEW_PREFIX + 'SET_BACKDROP',
  OPEN_DIALOG                 : VIEW_PREFIX + 'OPEN_DIALOG',
  CLOSE_DIALOG                : VIEW_PREFIX + 'CLOSE_DIALOG',
  ADD_MESSAGE                 : VIEW_PREFIX + 'ADD_MESSAGE',
  REMOVE_MESSAGE              : VIEW_PREFIX + 'REMOVE_MESSAGE',
  SET_SERVER_ERROR_STATE      : VIEW_PREFIX + 'SET_SERVER_ERROR_STATE',
  SET_MORE_INFO               : VIEW_PREFIX + 'SET_MORE_INFO',
  SET_AUTO_REFRESH            : VIEW_PREFIX + 'SET_AUTO_REFRESH',
  SET_NOTIFICATION_DIALOG     : VIEW_PREFIX + 'SET_NOTIFICATION_DIALOG',
  SET_COMPARE_AUTO_REFRESH    : VIEW_PREFIX + 'SET_COMPARE_AUTO_REFRESH'
};




export type MediaContentTypeEnum = 'image/bmp' | 'image/jpeg' | 'image/png' | 'video/mp4' | 'image/jpeg';

export const MEDIA_VIDEO_EXTENSIONS = ['flv', 'avi', 'mp4', 'mov', 'mpg', 'wmv', '3gp', 'mkv'];

export type MessageSeverityEnum = 'success' | 'error' | 'info' | 'warn';

export const MESSAGES_SEVERITY = {
  SUCCESS: 'success' as MessageSeverityEnum,
  ERROR  : 'error' as MessageSeverityEnum,
  INFO   : 'info' as MessageSeverityEnum,
  WARN   : 'warn' as MessageSeverityEnum
};

const TASKS_PREFIX = 'TASKS_';

export const TASKS_ACTIONS = {
  SET_TASK_IN_TABLE          : TASKS_PREFIX + 'SET_TASK_IN_TABLE',
  GET_TASK_BY_ID_AFTER_EFFECT: TASKS_PREFIX + 'GET_TASK_BY_ID_AFTER_EFFECT',
  DEQUEUE_TASK               : TASKS_PREFIX + 'DEQUEUE_TASK',
  SET_TASK_FOR_METRICS       : TASKS_PREFIX + 'SET_TASK_FOR_METRICS',
  GET_TASK_FOR_METRICS       : TASKS_PREFIX + 'GET_TASK_FOR_METRICS',
  CLOSE_TASK                 : TASKS_PREFIX + 'CLOSE_TASK',
  FAIL_TASK                  : TASKS_PREFIX + 'FAIL_TASK',
  RESUM_TASK                 : TASKS_PREFIX + 'RESUM_TASK',
  PUBLISH_TASK               : TASKS_PREFIX + 'PUBLISH_TASK',
  RESET_TASK                 : TASKS_PREFIX + 'RESET_TASK',
  GET_TASK_TOKEN             : TASKS_PREFIX + ' GET_TASK_TOKEN',
  ADD_SELECTED_TASK          : TASKS_PREFIX + 'ADD_SELECTED_TASK',
  AFTER_TASK_CHANGED         : TASKS_PREFIX + 'AFTER_TASK_CHANGED',
  CLOSE_TASK_LOG             : TASKS_PREFIX + 'CLOSE_TASK_LOG',
  CLEAR_TOKEN                : TASKS_PREFIX + 'CLEAR_TOKEN',
  GET_ALL                    : TASKS_PREFIX + 'GET_ALL',
  GET_TASK_SUCCESS           : TASKS_PREFIX + 'GET_TASK_SUCCESS',
  GET_PROTOTEXT_SUCCESS      : TASKS_PREFIX + 'GET_PROTOTEXT_SUCCESS',
  GET_TASK_LOG_SUCCESS       : TASKS_PREFIX + 'GET_TASK_LOG_SUCCESS',
  GLOBAL_FILTER_CHANGED      : TASKS_PREFIX + 'GLOBAL_FILTER_CHANGED',
  VIEW_MODE_CHANGED          : TASKS_PREFIX + 'VIEW_MODE_CHANGED',
  TASK_CREATED               : TASKS_PREFIX + 'TASK_CREATED',
  TASK_CHECKED               : TASKS_PREFIX + 'TASK_CHECKED',
  TASK_UNCHECKED             : TASKS_PREFIX + 'TASK_UNCHECKED',
  TABLE_SORT_CHANGED         : TASKS_PREFIX + 'TABLE_SORT_CHANGED',
  TABLE_FILTER_CHANGED       : TASKS_PREFIX + 'TABLE_FILTER_CHANGED',
  TOGGLE_HIDDEN              : TASKS_PREFIX + 'TOGGLE_HIDDEN',
  TASK_DELETED_SUCCESS       : TASKS_PREFIX + 'TASK_DELETED_SUCCESS',
  TASK_ENQUEUE               : TASKS_PREFIX + 'TASK_ENQUEUE',
  TASKS_SUCCESS              : TASKS_PREFIX + 'GET_ALL_SUCCESS',
  TASKS_OPTIMISTIC           : TASKS_PREFIX + 'OPTIMISTIC',
  TASKS_TRAINING_SUCCESS     : TASKS_PREFIX + 'TRAINING_SUCCESS',
  TASKS_IMPORT_SUCCESS       : TASKS_PREFIX + 'IMPORT_SUCCESS',
  TASKS_TESTING_SUCCESS      : TASKS_PREFIX + 'TESTING_SUCCESS',
  RESET_SELECTED_TASK        : TASKS_PREFIX + 'RESET_SELECTED_TASK',
  REMOVE_SELECTED_TASK       : TASKS_PREFIX + 'REMOVE_SELECTED_TASK',
  RESET_SUCCESS              : TASKS_PREFIX + 'RESET_SUCCESS',
  SET_FIRST                  : TASKS_PREFIX + 'SET_FIRST',
  SET_GLOBAL_FILTER          : TASKS_PREFIX + 'SET_GLOBAL_FILTER',
  SET_SELECTED_TASK          : TASKS_PREFIX + 'SET_SELECTED_TASK',
  SET_SHOW_CHECKED_TASKS     : TASKS_PREFIX + 'SET_SHOW_CHECKED_TASKS',
  SET_TASKS_DATA             : TASKS_PREFIX + 'SET_TASKS_DATA',
  SET_TABLE_COLUMNS          : TASKS_PREFIX + 'SET_TABLE_COLUMNS',
  STOP_CHECKED_TASKS         : TASKS_PREFIX + 'STOP_CHECKED_TASKS',
  STOP_TASK                  : TASKS_PREFIX + 'STOP_TASK',
  UPDATE_TASK                : TASKS_PREFIX + 'UPDATE_TASK',
};
export const USERS_PREFIX  = 'USERS_';
export const USERS_ACTIONS = {
  FETCH_CURRENT_USER: USERS_PREFIX + 'FETCH_USER',
  SET_CURRENT_USER  : USERS_PREFIX + 'SET_CURRENT_USER',
  LOGOUT_SUCCESS    : USERS_PREFIX + 'LOGOUT_SUCCESS',
  LOGOUT            : USERS_PREFIX + 'LOGOUT',
  SET_PREF          : USERS_PREFIX + 'SET_PREF'
};

export const NAVIGATION_PREFIX  = 'NAVIGATION_';
export const NAVIGATION_ACTIONS = {
  NAVIGATE_TO                            : NAVIGATION_PREFIX + 'NAVIGATE_TO',
  NAVIGATION_END                         : NAVIGATION_PREFIX + 'NAVIGATION_END',
  SET_ROUTER_SEGMENT                     : NAVIGATION_PREFIX + 'SET_ROUTER_SEGMENT',
  UPDATATE_CURRENT_URL_WITHOUT_NAVIGATING: NAVIGATION_PREFIX + 'UPDATATE_CURRENT_URL_WITHOUT_NAVIGATING',
  NAVIGATION_SKIPPED                     : NAVIGATION_PREFIX + 'NAVIGATION_SKIPPED',
};



export const ENVIRONMENT = {API_VERSION: '/v2.8'};
const url                = window.location.origin;
let apiBaseUrl: string;
if (environment.apiBaseUrl) {
  apiBaseUrl = environment.apiBaseUrl;
} else if (/https?:\/\/(demo|)app\./.test(url)) {
  apiBaseUrl = url.replace(/(https?):\/\/(demo|)app/, '$1://$2api');
} else if (window.location.port === '30080') {
  apiBaseUrl = url.replace(/:\d+/, '') + ':30008';
} else {
  apiBaseUrl = url.replace(/:\d+/, '') + ':8008';
}
const apiBaseUrlNoVersion = apiBaseUrl;

let fileBaseUrl;
if (environment.fileBaseUrl) {
  fileBaseUrl = environment.fileBaseUrl;
} else if (/https?:\/\/(demo|)app\./.test(url)) {
  fileBaseUrl = url.replace(/(https?):\/\/(demo|)app/, '$1://$2files');
} else if (window.location.port === '30080') {
  fileBaseUrl = url.replace(/:\d+/, '') + ':30081';
} else if (window.location.port === '8080') {
  fileBaseUrl = url.replace(/:\d+/, '') + ':8081';
}

apiBaseUrl += ENVIRONMENT.API_VERSION;

const HTTP_PREFIX         = 'HTTP_';
export const HTTP_ACTIONS = {
  REQUEST_FAILED: HTTP_PREFIX + 'REQUEST_FAILED'
};

export const HTTP = {
  API_REQUEST            : 'HTTP_API_REQUEST',
  API_REQUEST_SUCCESS    : 'API_REQUEST_SUCCESS',
  API_REQUEST_CANCELED   : 'API_REQUEST_CANCELED',
  API_BASE_URL           : apiBaseUrl,  // <-- DIRECT CALL DOESN'T WORK
  API_BASE_URL_NO_VERSION: apiBaseUrlNoVersion,
  FILE_BASE_URL: fileBaseUrl,

  API_METHODS: {
    GET : 'GET',
    POST: 'POST'
  },

  AUTH: {
    CREATE        : 'auth.create_credentials',
    GET_ALL       : 'auth.get_credentials',
    REVOKE        : 'auth.revoke_credentials',
    GET_TASK_TOKEN: 'auth.get_task_token'
  },

  MODELS: {
    GET_ALL     : 'models.get_all',
    GET_BY_ID   : 'models.get_by_id',
    CREATE_MODEL: 'models.create',
    UPDATE      : 'models.update'
  },

  USERS: {
    GET_CURRENT_USER: 'users.get_current_user',
    GET_BY_ID       : 'users.get_by_id',
    LOGOUT          : '/logout'
  },

  QUEUES: {
    GET_ALL: 'queues.get_all'
  },

  PROJECTS: {
    GET_ALL: 'projects.get_all',
    CREATE : 'projects.create',
    DELETE : 'projects.delete'
  },

  TASKS: {
    CLOSE                   : 'tasks.close',
    PUBLISH                 : 'tasks.publish',
    GET_ALL                 : 'tasks.get_all',
    GET_BY_ID               : 'tasks.get_by_id',
    ENQUEUE                 : 'tasks.enqueue',
    DEQUEUE                 : 'tasks.dequeue',
    CREATE                  : 'tasks.create',
    UPDATE                  : 'tasks.update',
    EDIT                    : 'tasks.edit',
    RESET                   : 'tasks.reset',
    START                   : 'tasks.started',
    STOP                    : 'tasks.stop',
    STOPPED                 : 'tasks.stopped',
    COMPLETED               : 'tasks.completed',
    TASK_LOG                : 'events.get_task_log',
    RESUME                  : 'tasks.resume',
    FAILED                  : 'tasks.failed',
    DEBUG_IMAGES            : 'events.debug_images',
    VECTOR_METRICS          : 'events.get_vector_metrics_and_variants',
    VECTOR_METRICS_HISTOGRAM: 'events.vector_metrics_iter_histogram',
    SCALAR_METRICS          : 'events.scalar_metrics_iter_histogram',
    PLOT                    : 'events.get_task_plots',
    DELETE                  : 'tasks.delete'

  },



  FRAMES: {
    GET_BATCH         : 'frames.get_next',
    GET_BATCH_FOR_TASK: 'frames.get_next_for_task',
    SET_ROIS          : 'frames.set_rois',
    COMMIT            : 'frames.commit',
  },

  SOURCES: {
    GET_ALL: 'storage.get_all',
  }
};

export class EmptyAction implements Action {
  readonly type = 'EMPTY_ACTION';
}

export const AUTO_REFRESH_INTERVAL = 10 * 1000;
