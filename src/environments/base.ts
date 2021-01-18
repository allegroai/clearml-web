import versionConf from '../version.json';

export interface CommunityContext {
  title?: string;
  subtitle?: string;
  background?: string;
  backgroundPosition?: string;
  list?: { icon: string; title: string; text: string }[];
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
  spaLogin?: boolean;
  autoLogin?: boolean;
  whiteLabelLogo?: boolean;
  whiteLabelLink?: any;
  whiteLabelLoginTitle?: string;
  whiteLabelLoginSubtitle?: string;
  whiteLabelSlogan?: string;
  communityServer: boolean;
  communityContext?: CommunityContext;
  GTM_ID?: string;
  hideUpdateNotice: boolean;
  showSurvey: boolean;
  touLink: string;
  plotlyURL: string;
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
  spaLogin: true,
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
  touLink: 'https://allegro.ai/legal-platform-tou/',
  plotlyURL: 'app/webapp-common/assets/plotly-1.58.4.min.js'
} as Environment;

