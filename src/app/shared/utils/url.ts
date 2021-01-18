export function isFileserverUrl(url: string, appURL: string) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname === appURL.replace('app', 'files');
  }
  catch (e) {
    return false;
  }
}

export function  convertToReverseProxy(url: string) {
  const u = new URL(url);
  u.hostname = u.hostname.replace('files', 'app');
  if (!u.pathname.startsWith('/files')) {
    u.pathname = `files${u.pathname}`;
  }
  return u.toString();
}
