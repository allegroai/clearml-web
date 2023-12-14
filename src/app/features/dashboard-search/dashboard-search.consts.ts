export type ActiveSearchLink = 'projects' | 'experiments' | 'models' | 'pipelines' | 'datasets';

export const activeSearchLink = {
  projects: 'projects' as ActiveSearchLink,
  experiments: 'experiments' as ActiveSearchLink,
  models: 'models' as ActiveSearchLink,
  pipelines: 'pipelines' as ActiveSearchLink,
  openDatasets: 'datasets' as ActiveSearchLink,
  reports: 'reports' as ActiveSearchLink
};

export const activeLinksList = [
  {
    label: 'Projects',
    name: activeSearchLink.projects,
  },
  {
    label: 'DataSets',
    name: activeSearchLink.openDatasets,
  },
  {
    label: 'Experiments',
    name: activeSearchLink.experiments,
  },
  {
    label: 'Models',
    name: activeSearchLink.models,
  },
  {
    label: 'Piplines',
    name: activeSearchLink.pipelines,
  },
  {
    label: 'Reports',
    name: activeSearchLink.reports,
  },
];
