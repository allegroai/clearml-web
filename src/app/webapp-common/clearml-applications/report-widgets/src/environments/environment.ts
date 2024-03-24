import {BASE_ENV, Environment} from './base';
/*
  'https://api.allegro-master.hosted.allegro.ai',    // 1
  'https://api.community-master.hosted.allegro.ai',  // 2
  'https://api.allegro.ai',                          // 3
  'https://api.clear.ml',                            // 4
  'https://api1.rnd.dev2.allegro.ai',                // 5
  'https://api2.rnd.dev2.allegro.ai',                // 6
  'https://api.dev.hosted.allegro.ai',               // 7
  'https://api.dev.hosted.clear.ml',                 // 8
  'https://api.staging.hosted.allegro.ai',           // 9
  'https://api.neuralguard.hosted.allegro.ai',       // 10
*/

export const environment = {
  ...BASE_ENV,
  production: false,
  baseUrl: 'localhost:4200',
  autoLogin: false,
  apiBaseUrl: '../service/1/api',
  // communityServer: true,
  accountAdministration: true,
  fileBaseUrl: 'https://files.allegro.ai',
  userKey: 'EYVQ385RW7Y2QQUH88CZ7DWIQ1WUHP',
  userSecret: 'yfc8KQo*GMXb*9p((qcYC7ByFIpF7I&4VH3BfUYXH%o9vX1ZUZQEEw1Inc)S',
  companyID: 'd1bd92a3b039400cbafc60a7a5b1e52b',
  // billingServiceUrl: 'https://cdn.paddle.com/paddle/paddle.js',
  alternativeFilesBaseUrl: 'https://files.allegro-master.hosted.allegro.ai'
} as Environment;

if (document.URL.includes('localhost')) {
  if (!['/api1/service', '/api2/service'].includes(environment.apiBaseUrl)) {
    console.log(`Current environment is ${environment.apiBaseUrl}`);
    if (environment.apiBaseUrl.includes('production')) {
      console.groupCollapsed('Working on Production!');
      console.groupEnd();
    }
  }
}
