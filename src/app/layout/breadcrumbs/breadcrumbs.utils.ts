import {TableModel} from '@common/models/shared/models.model';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {Project} from '~/business-logic/model/projects/project';
import {Task} from '~/business-logic/model/tasks/task';
import {selectSelectedTableModel} from '@common/models/reducers';
import {createSelector} from '@ngrx/store';
import {selectSelectedExperiment} from '~/features/experiments/reducers';
import {selectRootProjects, selectSelectedProject} from '@common/core/reducers/projects.reducer';
import {formatStaticCrumb as commonFormatStaticCrumb, prepareLinkData} from '@common/layout/breadcrumbs/breadcrumbs-common.utils';
import {IBreadcrumbsLink} from '@common/layout/breadcrumbs/breadcrumbs.component';

export interface IBreadcrumbs {
  project: Project;
  projects: Project[];
  experiment: IExperimentInfo;
  model: TableModel;
  task: Task;
}


export const formatStaticCrumb = (crumb: string): IBreadcrumbsLink => {
  if (!crumb) {
    return {url: null, name: null};
  }
  return commonFormatStaticCrumb(crumb);
};

export const selectBreadcrumbsStringsBase = createSelector(
  selectSelectedProject, selectSelectedExperiment, selectSelectedTableModel, selectRootProjects,
  (project, experiment, model, projects) =>
    ({project, experiment, model, projects}) as IBreadcrumbs);

export const prepareNames = (data: IBreadcrumbs, customProject?: boolean, fullScreen = false) => {
  const project = prepareLinkData(data.project, true);
  if (data.project) {
    let subProjectsNames = [data.project?.name];
    if (!customProject) {
      subProjectsNames = data.project?.name?.split('/');
    }
    const allProjects = [
      ...data.projects,
      {id: '*', name: 'All Experiments'},
      data.project
    ];
    let currentName = '';
    const subProjects = subProjectsNames.map(name => {
      currentName += currentName ? ('/' + name) : name;
      return allProjects.find(proj => currentName === proj.name);
    }) || [];

    const subProjectsLinks = subProjects.map((subProject, index, arr) => ({
      name: subProject?.name.substring(subProject?.name.lastIndexOf('/') + 1),
      url: customProject ?
        data.project?.system_tags?.includes('pipeline') ? `pipelines/${subProject?.id}/experiments` : '' :
        fullScreen && index === (arr.length - 1) ? `projects/${subProject?.id}/experiments/${data?.experiment?.id}` :
          subProject?.name === data.project?.name && data.project?.sub_projects?.length === 0 ?
            `projects/${subProject?.id}` :
            `projects/${subProject?.id}/projects`
    })) as { name: string; url: string }[];
    project.name = project?.name.substring(project.name.lastIndexOf('/') + 1);
    project.subCrumbs = subProjectsLinks;
  }
  const task = prepareLinkData(data.task);
  const experiment = (data.experiment) ? prepareLinkData(data.experiment, true) : {};
  const output = formatStaticCrumb('');
  const accountAdministration = formatStaticCrumb('account-administration');
  const experiments = formatStaticCrumb('experiments');
  const models = formatStaticCrumb('models');
  const compare = customProject ?
    data.project?.system_tags?.includes('pipeline') ?
      {url: 'compare-experiments', name: 'Compare Runs'} :
      {url: 'compare-experiments', name: 'Compare Versions'}
    : formatStaticCrumb('compare-experiments');

  return {
    ...(project.url !== '*' && {':projectId': project}),
    ':taskId': task,
    ':controllerId': experiment,
    'compare-experiments': compare,
    output,
    experiments,
    models,
    accountAdministration,
    profile: {url: 'profile', name: 'Profile'},
    'webapp-configuration': {url: 'webapp-configuration', name: 'Configuration'},
    'workspace-configuration': {url: 'workspace-configuration', name: 'Workspace'},
  };
};
