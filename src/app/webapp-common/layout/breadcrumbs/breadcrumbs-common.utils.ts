import {IBreadcrumbsLink} from './breadcrumbs.component';
import {isExample} from '../../shared/utils/shared-utils';
import {Project} from '~/business-logic/model/projects/project';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {TableModel} from '@common/models/shared/models.model';
import {Task} from '~/business-logic/model/tasks/task';
import { Report } from '~/business-logic/model/reports/report';

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

export const formatStaticCrumb = (crumb: string): IBreadcrumbsLink | IBreadcrumbsLink[] => {
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
      return {name: 'All Experiment', url: null};
    case 'models':
      return {name: 'All Models', url: null};
    default:
      name = crumb.charAt(0).toUpperCase() + crumb.slice(1);
      break;
  }
  return {url: crumb, name};
};

export const prepareNames = (data: IBreadcrumbs, customProject?: boolean, fullScreen = false) => {
  const project = prepareLinkData(data.project, true);
  if (data.project) {
    let subProjectsNames = [data.project?.name];
      subProjectsNames = data.project?.name?.split('/').filter(name=> !['.datasets', '.pipelines'].includes(name));
    const allProjects = [
      ...(data.projects || []),
      {id: '*', name: 'All Experiments'},
      data.project
    ];
    let currentName = '';
    const subProjects = subProjectsNames.map(name => {
      currentName += currentName ? ('/' + name) : name;
      return allProjects.find(proj => currentName === proj.name.replace('/.datasets', '').replace('/.pipelines', ''));
    }) || [];
    const subProjectsLinks = subProjects.map((subProject, index, arr) => ({
      name: subProjectsNames[index],
      url: customProject ? (( index===subProjects.length-1)  ?
        (data.project?.system_tags?.includes('pipeline') ?
          `pipelines/${subProject?.id}/experiments` : `datasets/simple/${subProject?.id}`): null)
        :
        fullScreen && index === (arr.length - 1) ? `projects/${subProject?.id}/experiments/${data?.experiment?.id}` :
          subProject?.name === data.project?.name && data.project?.sub_projects?.length === 0 ?
            `projects/${subProject?.id}` :
            `projects/${subProject?.id}/projects`
    })) as { name: string; url: string }[];
    project.name = project?.name.substring(project.name.lastIndexOf('/') + 1);
    project.subCrumbs = subProjectsLinks;
  }
  const task = prepareLinkData(data.task);
  const experiment = (data.experiment && !customProject) ? prepareLinkData(data.experiment, true) : {};
  const report = prepareLinkData(data.report);
  const output = formatStaticCrumb('');
  const experiments = formatStaticCrumb('experiments');
  const models = formatStaticCrumb('models');
  const compare = customProject ?
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
    'compare-experiments': compare,
    ':reportId': report,
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
