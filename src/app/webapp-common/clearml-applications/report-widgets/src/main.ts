import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import {APP_BASE_HREF} from '@angular/common';
import {Environment} from '../../../../../environments/base';
import {environment} from './environments/environment';
import {updateHttpUrlBaseConstant} from '~/app.constants';

if (environment.production) {
  enableProdMode();
}

(async () => {
  const configData = {baseHref: ''} as Environment;
  try {
    // configData = await fetchConfigOutSideAngular();
    (window as any).configuration = {};
  } finally {
    updateHttpUrlBaseConstant({...environment, ...configData});
    await platformBrowserDynamic([
      {provide: APP_BASE_HREF, useValue: configData.baseHref}
    ]).bootstrapModule(AppModule);
  }
})();
