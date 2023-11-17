import {HTTP} from '~/app.constants';

export const isFileserverUrl = (url: string) =>
  url?.startsWith(HTTP.FILE_BASE_URL);

export const convertToReverseProxy = (url: string) => {
  try {
    const u = new URL(url);
    if (!u.pathname.startsWith('/files')) {
      u.protocol = window.location.protocol;
      u.host = window.location.host;
      u.pathname = 'files' + u.pathname;
      return u.toString();
    }
  } catch {}
  return url;
};
