import {BASE_ENV} from './base';
/**** PROXIES
 1   https://api.trains-master.hosted.allegro.ai
 2   http://trains-ami.qa.allegro.ai:8008
 3   https://api2.rnd.dev2.allegro.ai
 4   http://rnd.dev2.allegro.ai:18008
 5   http://rnd.dev2.allegro.ai:28008
****/

export const environment = {
  ...BASE_ENV,
  production             : false,
  autoLogin              : false,
  apiBaseUrl             : 'service/1/api',
  spaLogin               : true,
  hideUpdateNotice       : true,
  showSurvey: false
};
