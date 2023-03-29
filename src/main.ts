import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from '~/app.module';
import {ConfigurationService} from '@common/shared/services/configuration.service';
import {updateHttpUrlBaseConstant} from '~/app.constants';
const environment = ConfigurationService.globalEnvironment;

if (environment.production) {
  enableProdMode();
}

if (window.navigator && navigator.serviceWorker) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

// Removing currentUser from local storage (login think user logged-in if it exists )
const savedData = localStorage.getItem('_saved_state_');
if (savedData) {
  try {
    const savedJson = JSON.parse(savedData);
    if (savedJson.users) {
      delete savedJson.users;
      localStorage.setItem('_saved_state_', JSON.stringify(savedJson));
    }
  } catch {
    localStorage.removeItem('_saved_state_');
  }
}

(async () => {
  const baseHref = ( window as any ).__env.subPath || '' as string;
  updateHttpUrlBaseConstant({...environment, ...(baseHref && !baseHref.startsWith('${') && {apiBaseUrl: baseHref + environment.apiBaseUrl})});
  await platformBrowserDynamic().bootstrapModule(AppModule);
})();
