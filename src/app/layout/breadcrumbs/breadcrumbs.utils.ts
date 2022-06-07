import {TableModel} from '@common/models/shared/models.model';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {Project} from '~/business-logic/model/projects/project';
import {Task} from '~/business-logic/model/tasks/task';
import {selectSelectedTableModel} from '@common/models/reducers';
import {createSelector} from '@ngrx/store';
import {selectSelectedExperiment} from '~/features/experiments/reducers';
import {selectRootProjects, selectSelectedProject} from '@common/core/reducers/projects.reducer';
import {formatStaticCrumb, prepareLinkData} from '@common/layout/breadcrumbs/breadcrumbs-common.utils';

export interface IBreadcrumbs {
  project: Project;
  projects: Project[];
  experiment: IExperimentInfo;
  model: TableModel;
  task: Task;
}

export const selectBreadcrumbsStringsBase = createSelector(
  selectSelectedProject, selectSelectedExperiment, selectSelectedTableModel, selectRootProjects,
  (project, experiment, model, projects) =>
    ({project, experiment, model, projects}) as IBreadcrumbs);

export const prepareNames = (data: IBreadcrumbs, isPipeline?: boolean, fullScreen = false) => {
  const project = prepareLinkData(data.project, true);
  if (data.project) {
    const subProjects = [];
    let subProjectsNames = [data.project?.name];
    if (!isPipeline) {
      subProjectsNames = data.project?.name?.split('/');
    }
    let currentName = '';
    subProjectsNames.forEach(name => {
      currentName += currentName ? ('/' + name) : name;
      const foundProject = [
        ...data.projects,
        {id: '*', name: 'All Experiments'},
        {...data.project}
      ].find(proj => currentName === proj.name);
      subProjects.push(foundProject);
    });
    const subProjectsLinks = subProjects.map(subProject => ({
      name: subProject?.name.substring(subProject?.name.lastIndexOf('/') + 1),
      url: isPipeline ? `pipelines/${subProject?.id}/experiments` :
        fullScreen ? `projects/${subProject?.id}/experiments/${data.experiment.id}` :
          subProject?.name === data.project?.name && data.project?.sub_projects?.length === 0 ?
            `projects/${subProject?.id}` :
            `projects/${subProject?.id}/projects`
    })) as { name: string; url: string }[];
    project.name = project?.name.substring(project.name.lastIndexOf('/') + 1);
    project.subCrumbs = subProjectsLinks;
  }
  const task       = prepareLinkData(data.task);
  const experiment = (data.experiment) ? prepareLinkData(data.experiment, true) : {};
  const output      = formatStaticCrumb('');
  const accountAdministration      = formatStaticCrumb('account-administration');
  const experiments = formatStaticCrumb('experiments');
  const models      = formatStaticCrumb('models');
  const compare     = formatStaticCrumb('compare-experiments');
  return {
    ...(project.url !== '*' && {':projectId': project}),
    ':taskId'            : task,
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
