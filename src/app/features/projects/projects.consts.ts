import {HeaderNavbarTabConfig} from '@common/layout/header-navbar-tabs/header-navbar-tabs-config.types';

export const PROJECTS_FEATURES = ['models',' experiments', 'overview'];

export const PROJECT_ROUTES = [
  {header: 'overview', subHeader: '', id: 'overviewTab'},
  {header: 'tasks', subHeader: '(ARCHIVED)', id: 'experimentsTab'},
  {header: 'models', subHeader: '(ARCHIVED)', id: 'modelsTab'}
] as HeaderNavbarTabConfig[];
