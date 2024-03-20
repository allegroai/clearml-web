import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from '~/app.module';
import {ConfigurationService, fetchConfigOutSideAngular} from '@common/shared/services/configuration.service';
import {updateHttpUrlBaseConstant} from '~/app.constants';
import {Environment} from './environments/base';
const environment = ConfigurationService.globalEnvironment;

if (environment.production) {
  enableProdMode();
}

(async () => {
  let configData = {} as Environment;
  try {
    configData = await fetchConfigOutSideAngular();
    (window as any).configuration = configData;
  } finally {
    const baseHref = (window as any).__env.subPath || '' as string;
    updateHttpUrlBaseConstant({...environment, ...configData, ...(baseHref && !baseHref.startsWith('${') && {apiBaseUrl: baseHref + environment.apiBaseUrl})});
    await platformBrowserDynamic().bootstrapModule(AppModule);
  }
})();
