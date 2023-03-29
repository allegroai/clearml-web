import {IBreadcrumbsLink} from './breadcrumbs.component';
import {isExample} from '../../shared/utils/shared-utils';
import {Project} from '~/business-logic/model/projects/project';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {TableModel} from '@common/models/shared/models.model';
import {Task} from '~/business-logic/model/tasks/task';
import {Report} from '~/business-logic/model/reports/report';
import {NestedProjectTypeUrlEnum} from '~/layout/breadcrumbs/breadcrumbs.utils';

export interface IBreadcrumbs {
  project: Project;
  projects: Project[];
  experiment: IExperimentInfo;
  model: TableModel;
  task: Task;
  report: Report;
}

const addSuffixForExamples = crumb => {
  if (!crumb?.name) {
    return;
  }
  if (isExample(crumb) && crumb.id !== '*') {
    return crumb.name + ' (Example)';
  } else {
    return crumb.name;
  }
};


export const prepareLinkData = (crumb, supportsExamples = false): IBreadcrumbsLink => {
  const crumbName = crumb ? crumb.name : '';
  const preparedName = (supportsExamples === true) ? addSuffixForExamples(crumb) : crumbName;
  return crumb ? {name: preparedName, url: crumb.id} : {name: '', url: ''};
};

export const formatStaticCrumb = (crumb: string, nested?: boolean, routeConfig?: Array<string>): IBreadcrumbsLink | IBreadcrumbsLink[] => {
  if (!crumb) {
    return {url: null, name: null};
  }
  let name: string;
  switch (crumb) {
    case 'workers-and-queues':
      return {name: 'Workers & Queues', url: null};
    case 'output':
      name = 'Results';
      break;
    case 'compare-experiments':
      return [{url: 'experiments', name: 'Experiments'}, {url: null, name: 'Compare Experiments'}];
    case 'hyper-params':
      name = 'Configuration';
      break;
    case 'general':
      name = 'Info';
      break;
    case 'account-administration':
      name = 'Access Controls';
      break;
    case ':projectId':
      name = 'All Experiments';
      break;
    case 'experiments':
      return {name: 'All Experiments', url: null};
    case 'models':
      return {name: 'All Models', url: null};
    case 'pipelines':
      return {name: 'Pipelines', url: nested ? 'pipelines/*/projects' : 'pipelines'};
    case 'datasets':
      return {name: 'Datasets', url: nested ? 'datasets/simple/*/projects' : 'datasets'};
    case 'reports':
      return {name: 'Reports', url: nested ? 'reports/*/projects' : 'reports'};
    default:
      name = crumb.charAt(0).toUpperCase() + crumb.slice(1);
      break;
  }
  return {url: crumb, name};
};

export const prepareNames = (data: IBreadcrumbs, projectType?: NestedProjectTypeUrlEnum, fullScreen = false,
                             showHidden = false, compare = false) => {
  if(!data.project && data.report){
    data.project = data.report.project as Project;
  }
  const customProject = projectType !== 'projects';
  const project = prepareLinkData(data.project, true);
  if (data.project) {
    let subProjectsNames = [data.project?.name];
    subProjectsNames = data.project?.name?.split('/').filter(name => !['.datasets', '.pipelines', '.reports'].includes(name));
    const allProjects = [
      ...(data.projects || []),
      {id: '*', name: 'All Experiments'},
      data.project
    ];
    let currentName = '';
    const subProjects = subProjectsNames.map(name => {
      currentName += currentName ? ('/' + name) : name;
      return allProjects.find(proj => currentName === proj.name.replace(/\/\.datasets|\/\.pipelines|\/\.reports/, ''));
    }) || [];
    const subProjectsLinks = subProjects.map((subProject, index, arr) => ({
      name: subProjectsNames[index],
      hidden: showHidden && subProject?.hidden,
      url: customProject ? ((subProject?.id) ?
          `${projectType}/${subProject?.id}/projects` : null) :
        fullScreen && index === (arr.length - 1) ? `projects/${subProject?.id}/experiments/${data?.experiment?.id}` :
          subProject?.name === data.project?.name && data.project?.sub_projects?.length === 0 ?
            compare ? `projects/${subProject?.id}` : '' :
            `projects/${subProject?.id}/projects`
    })) as { name: string; url: string }[];
    project.name = project?.name.substring(project.name.lastIndexOf('/') + 1);
    project.subCrumbs = subProjectsLinks;
  }
  const task = prepareLinkData(data.task);
  const experiment = (data.experiment && !customProject) ? prepareLinkData(data.experiment, true) : {};
  const output = formatStaticCrumb('');
  const experiments = formatStaticCrumb('experiments');
  const models = formatStaticCrumb('models');
  const compareExperiment = customProject ?
    data.project?.system_tags?.includes('pipeline') ?
      {url: 'compare-experiments', name: 'Compare Runs'} :
      {url: 'compare-experiments', name: 'Compare Versions'}
    : formatStaticCrumb('compare-experiments');
  const accountAdministration = formatStaticCrumb('account-administration');
  return {
    /* eslint-disable @typescript-eslint/naming-convention */
    ':projectId': project,
    ':taskId': task,
    ':controllerId': experiment,
    'compare-experiments': compareExperiment,
    output,
    experiments,
    models,
    accountAdministration,
    profile: {url: 'profile', name: 'Profile'},
    'webapp-configuration': {url: 'webapp-configuration', name: 'Configuration'},
    'workspace-configuration': {url: 'workspace-configuration', name: 'Workspace'},
    /* eslint-enable @typescript-eslint/naming-convention */
  };
};
