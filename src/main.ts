import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {ConfigurationService} from './app/webapp-common/shared/services/configuration.service';
const environment = ConfigurationService.globalEnvironment;

if (environment.production) {
  enableProdMode();
}

if (window.navigator && navigator.serviceWorker) {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
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

platformBrowserDynamic().bootstrapModule(AppModule);
