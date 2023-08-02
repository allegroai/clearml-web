import {ProjectsGetAllExRequest} from '~/business-logic/model/projects/projectsGetAllExRequest';
import {ActivatedRouteSnapshot} from '@angular/router';
import ChildrenTypeEnum = ProjectsGetAllExRequest.ChildrenTypeEnum;

export const getPipelineRequest = (nested, searchQuery, selectedProjectName, selectedProjectId): ProjectsGetAllExRequest => ({
  /* eslint-disable @typescript-eslint/naming-convention */
  ...(nested ? {
    children_type: ChildrenTypeEnum.Pipeline,
    shallow_search: true,
    ...(selectedProjectName && {parent: [selectedProjectId]}),
    search_hidden: false,
  } :
  {
    search_hidden: true,
    shallow_search: false,
    name: selectedProjectName ? `^${selectedProjectName}/.pipelines/` : '/\\.pipelines/',
    system_tags: ['pipeline'],
    include_stats_filter: {system_tags: ['pipeline'], type: ['controller']}
  }),
  stats_with_children: nested
});

export const getReportRequest = (nested, searchQuery, selectedProjectName, selectedProjectId): ProjectsGetAllExRequest => ({
  /* eslint-disable @typescript-eslint/naming-convention */
  children_type: ChildrenTypeEnum.Report,
  shallow_search: nested,
  search_hidden: !nested && selectedProjectName,
  ...(!nested && selectedProjectName && {name: `^${selectedProjectName}/.reports/`}),
  ...(nested && selectedProjectName && {parent: [selectedProjectId]})
});


export const getDatasetsRequest = (nested: boolean, searchQuery: any, selectedProjectName: any, selectedProjectId: any) => ({
  /* eslint-disable @typescript-eslint/naming-convention */
  ...(nested ? {
    children_type: ChildrenTypeEnum.Dataset,
    shallow_search: true, ...(selectedProjectName && {parent: [selectedProjectId]}),
    search_hidden: false,
  } :
  {
    search_hidden: true,
    shallow_search: false,
    name: selectedProjectName ? `^${selectedProjectName}/.datasets/` : '/\\.datasets/',
    system_tags: ['dataset'],
    include_stats_filter: {system_tags: ['dataset'], type: ['data_processing']}
  }),
  include_dataset_stats: !nested,
  stats_with_children: nested
});

export const isPipelines = (snapshot: ActivatedRouteSnapshot)=> snapshot.firstChild.routeConfig.path === 'pipelines';
export const isReports = (snapshot: ActivatedRouteSnapshot)=> snapshot.firstChild.routeConfig.path === 'reports';
