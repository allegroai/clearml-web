import {TableModel} from '../../webapp-common/models/shared/models.model';
import {IExperimentInfo} from '../../features/experiments/shared/experiment-info.model';
import {Project} from '../../business-logic/model/projects/project';
import {Task} from '../../business-logic/model/tasks/task';
import {selectSelectedTableModel} from '../../webapp-common/models/reducers';
import {createSelector} from '@ngrx/store';
import {selectSelectedExperiment} from '../../features/experiments/reducers';
import {selectRootProjects, selectSelectedProject} from '../../webapp-common/core/reducers/projects.reducer';
import {formatStaticCrumb, prepareLinkData} from '../../webapp-common/layout/breadcrumbs/breadcrumbs-common.utils';

export interface IBreadcrumbs {
  project: Project;
  projects: Project[];
  experiment: IExperimentInfo;
  model: TableModel;
  task: Task;
}

export const selectBreadcrumbsStringsBase = createSelector(
  selectSelectedProject, selectSelectedExperiment, selectSelectedTableModel, selectRootProjects,
  (project, experiment, model,projects) =>
    ({project, experiment, model, projects}) as IBreadcrumbs);


export const prepareNames = (data: IBreadcrumbs) => {
  const project    = prepareLinkData(data.project, true);
  if (data.project) {
    const subProjects = [];
    const subProjectsNames = data.project?.name?.split('/');
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
      url: `projects/${subProject?.id}/projects`
    })) as { name: string; url: string }[];
    project.name = project.name.substring(project.name.lastIndexOf('/') + 1);
    project.subCrumbs = subProjectsLinks;
  }
  const task       = prepareLinkData(data.task);
  const experiment = (data.experiment) ? prepareLinkData(data.experiment, true) : {};
  const model      = prepareLinkData(data.model, true);
  const overview = formatStaticCrumb('overview');
  const output      = formatStaticCrumb('');
  const accountAdministration      = formatStaticCrumb('account-administration');
  const experiments = formatStaticCrumb('experiments');
  const models      = formatStaticCrumb('models');
  const compare     = formatStaticCrumb('compare-experiments');


  return {
    ':projectId'         : project,
    ':experimentId'      : experiment,
    ':modelId'           : model,
    ':taskId'            : task,
    'compare-experiments': compare,
    output,
    experiments,
    overview,
    models,
    execution: formatStaticCrumb('execution'),
    'hyper-params' : formatStaticCrumb('hyper-params'),
    artifacts: formatStaticCrumb('artifacts'),
    general: formatStaticCrumb('general'),
    log: formatStaticCrumb('logs'),
    scalar: formatStaticCrumb('scalars'),
    plots: formatStaticCrumb('plots'),
    accountAdministration,
    debugImages: formatStaticCrumb('Debug Samples'),
  };
};
