import {Action} from '@ngrx/store';
import {ConfigurationService} from './webapp-common/shared/services/configuration.service';
const environment = ConfigurationService.globalEnvironment;

export const NA                      = 'N/A';
export const ALLEGRO_TUTORIAL_BUCKET = 'allegro-tutorials';
export const UPDATE_SERVER_PATH      = 'https://updates.clear.ml/updates';

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

const recentTasksPrefix = 'RECENT_TASKS';

export const RECENT_TASKS_ACTIONS = {
  GET_RECENT_TASKS: recentTasksPrefix + 'GET_RECENT_TASKS',
  SET_RECENT_TASKS: recentTasksPrefix + 'SET_RECENT_TASKS'
};

export const VIEW_PREFIX  = 'VIEW_';

export type MediaContentTypeEnum = 'image/bmp' | 'image/jpeg' | 'image/png' | 'video/mp4' | 'image/jpeg';

export const MEDIA_VIDEO_EXTENSIONS = ['flv', 'avi', 'mp4', 'mov', 'mpg', 'wmv', '3gp', 'mkv'];

export type MessageSeverityEnum = 'success' | 'error' | 'info' | 'warn';

export const MESSAGES_SEVERITY = {
  SUCCESS: 'success' as MessageSeverityEnum,
  ERROR  : 'error' as MessageSeverityEnum,
  INFO   : 'info' as MessageSeverityEnum,
  WARN   : 'warn' as MessageSeverityEnum
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


export function guessAPIServerURL() {
  const url = window.location.origin;
  if (/https?:\/\/(demo|)app\./.test(url)) {
    return url.replace(/(https?):\/\/(demo|)app/, '$1://$2api');
  } else if (window.location.port === '30080') {
    return url.replace(/:\d+/, '') + ':30008';
  }
  return url.replace(/:\d+/, '') + ':8008';
}

export const ENVIRONMENT = {API_VERSION: '/v999.0'};
const url                = window.location.origin;
let apiBaseUrl: string;
if (environment.apiBaseUrl) {
  apiBaseUrl = environment.apiBaseUrl;
} else {
  apiBaseUrl = guessAPIServerURL();
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

export const HTTP_PREFIX         = 'HTTP_';

export const HTTP = {
  API_BASE_URL           : apiBaseUrl,  // <-- DIRECT CALL DOESN'T WORK
  API_BASE_URL_NO_VERSION: apiBaseUrlNoVersion,
  FILE_BASE_URL: fileBaseUrl,
};

export class EmptyAction implements Action {
  readonly type = 'EMPTY_ACTION';
}

export const AUTO_REFRESH_INTERVAL = 10 * 1000;
