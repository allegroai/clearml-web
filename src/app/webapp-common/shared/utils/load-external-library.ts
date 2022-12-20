import {Store} from '@ngrx/store';

export const loadExternalLibrary = (store: Store, url: string, action) => {
  if (!url) {
    return;
  }
  const init = () => {
    const script: HTMLScriptElement = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onerror = () => console.error(`Error loading library from ${url}`);
    script.crossOrigin = '';// 'use-credentials';
    script.onload = () => store.dispatch(action());

    const head: HTMLHeadElement = document.getElementsByTagName('head')[0];
    head.appendChild(script);
  };

  setTimeout(init);
};
