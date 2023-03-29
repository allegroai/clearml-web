import {last} from 'lodash-es';

export const isTextFileURL = (url: string) => {
  if (!url) {
    return false;
  }
  const parsed = new URL(url);
  const ext = last(parsed.pathname.split('.'));
  return ['txt', 'text'].includes(ext);
};
