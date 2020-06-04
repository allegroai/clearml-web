import {BASE_ENV} from './base';

export let environment = {
  ...BASE_ENV,
  production: true,
  loginNotice: 'Enter name to access TRAINS demo server',
  demo: true,
  autoLogin: true,
  loginBanner: 'This is a demo server. Any experiment you connect can be viewed by anyone. The server will reset every week on Sunday night (midnight PST), at which time all user data will be deleted. Running experiments may not be logged.'
};
