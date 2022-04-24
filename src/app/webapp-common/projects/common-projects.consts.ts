export interface ProjectRoute {
  header: 'overview' | 'models' | 'experiments';
  subHeader: string;
  permissionCheck?: string;
}

export const PROJECT_ROUTES = [
  {header: 'overview', subHeader: ''},
  {header: 'experiments', subHeader: '(ARCHIVED)'},
  {header: 'models', subHeader: '(ARCHIVED)'},
] as ProjectRoute[];

export const PROJECTS_PREFIX         = 'PROJECTS_';

export const pageSize = 12;
