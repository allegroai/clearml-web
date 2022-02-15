import {HTTP} from '~/app.constants';

export const isFileserverUrl = (url: string) =>
  url.startsWith(HTTP.FILE_BASE_URL);

export const convertToReverseProxy = (url: string) => url;
