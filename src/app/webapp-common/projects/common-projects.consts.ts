import {HeaderNavbarTabConfig} from '@common/layout/header-navbar-tabs/header-navbar-tabs-config.types';

export const PROJECT_ROUTES = [
  {header: 'overview', subHeader: '', id: 'overviewTab'},
  {header: 'experiments', subHeader: '(ARCHIVED)', id: 'experimentsTab'},
  {header: 'models', subHeader: '(ARCHIVED)' , id: 'modelsTab'}
] as HeaderNavbarTabConfig[];


export const PROJECTS_PREFIX         = 'PROJECTS_';

export const pageSize = 12;
