import versionConf from '../version.json';

export interface CommunityContext {
  title?: string;
  subtitle?: string;
  background?: string;
  backgroundPosition?: string;
  list?: { icon: string; title: string; text: string }[];
}

export interface GettingStartedContext {
  install?: string;
  configure?: string;
  agentName?: string;
}

export interface Environment {
  production: boolean;
  apiBaseUrl: string;
  fileBaseUrl: string;
  productName: string;
  demo: boolean;
  headerPrefix: string;
  version: string;
  userKey: string;
  userSecret: string;
  companyID: string;
  loginNotice?: string;
  loginBanner?: string;
  autoLogin?: boolean;
  whiteLabelLogo?: boolean;
  whiteLabelLink?: any;
  whiteLabelLoginTitle?: string;
  whiteLabelLoginSubtitle?: string;
  whiteLabelSlogan?: string;
  communityServer: boolean;
  accountAdministration: boolean;
  communityContext?: CommunityContext;
  GTM_ID?: string;
  hideUpdateNotice: boolean;
  showSurvey: boolean;
  touLink: string;
  plotlyURL: string;
  slackLink: string;
  docsLink: string;
  useFilesProxy: boolean;
  branding?: {faviconUrl?: string; logo?: string; logoSmall?: string};
  gettingStartedContext?: GettingStartedContext;
  serverDownMessage?: string;
}

export const BASE_ENV = {
  production: true,
  apiBaseUrl: null,
  fileBaseUrl: null,
  productName: 'clearml',
  demo: false,
  headerPrefix: 'X-Clearml',
  version: versionConf.version,
  userKey: 'EYVQ385RW7Y2QQUH88CZ7DWIQ1WUHP',
  userSecret: 'yfc8KQo*GMXb*9p((qcYC7ByFIpF7I&4VH3BfUYXH%o9vX1ZUZQEEw1Inc)S',
  companyID: 'd1bd92a3b039400cbafc60a7a5b1e52b',
  loginNotice: '',
  loginBanner: '',
  autoLogin: false,
  whiteLabelLogo: null,
  whiteLabelLink: null,
  whiteLabelLoginTitle: null,
  whiteLabelLoginSubtitle: null,
  whiteLabelSlogan: null,
  communityContext: {
    background: 'app/webapp-common/assets/icons/human-polygon.svg'
  },
  GTM_ID: null,
  hideUpdateNotice: false,
  showSurvey: false,
  accountAdministration: false,
  useFilesProxy: false,
  touLink: 'https://allegro.ai/legal-platform-tou/',
  plotlyURL: 'app/webapp-common/assets/plotly-1.58.4.min.js',
  slackLink: 'https://join.slack.com/t/allegroai-trains/shared_invite/enQtOTQyMTI1MzQxMzE4LTY5NTUxOTY1NmQ1MzQ5MjRhMGRhZmM4ODE5NTNjMTg2NTBlZGQzZGVkMWU3ZDg1MGE1MjQxNDEzMWU2NmVjZmY',
  docsLink: 'https://clear.ml/docs/latest/docs/',
  branding: {logo: '/assets/logo-white.svg?v=7', logoSmall: '/assets/c-logo.svg?=2'},
  serverDownMessage: 'The ClearML server is currently unavailable.<BR>' +
    'Please try to reload this page in a little while.<BR>' +
    'If the problem persists, verify your network connection is working and check the ClearML server logs for possible errors'
} as Environment;

