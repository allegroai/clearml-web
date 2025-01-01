export type ActiveSearchLink = 'projects' | 'tasks' | 'models' | 'pipelines' | 'datasets';

export const activeSearchLink = {
  projects: 'projects' as ActiveSearchLink,
  experiments: 'tasks' as ActiveSearchLink,
  models: 'models' as ActiveSearchLink,
  pipelines: 'pipelines' as ActiveSearchLink,
  openDatasets: 'datasets' as ActiveSearchLink,
  reports: 'reports' as ActiveSearchLink
};

export const activeLinksList = [
  {
    label: 'PROJECTS',
    name: activeSearchLink.projects,
  },
  {
    label: 'DATASETS',
    name: activeSearchLink.openDatasets,
  },
  {
    label: 'TASKS',
    name: activeSearchLink.experiments,
  },
  {
    label: 'MODELS',
    name: activeSearchLink.models,
  },
  {
    label: 'PIPELINES',
    name: activeSearchLink.pipelines,
  },
  {
    label: 'REPORTS',
    name: activeSearchLink.reports,
  },
];
