import {TableModel} from '../../webapp-common/models/shared/models.model';
import {ISelectedExperiment} from '../../features/experiments/shared/experiment-info.model';
import {Project} from '../../business-logic/model/projects/project';
import {Task} from '../../business-logic/model/tasks/task';
import {selectSelectedTableModel} from '../../webapp-common/models/reducers';
import {createSelector} from '@ngrx/store';
import {selectSelectedExperiment} from '../../features/experiments/reducers';
import {selectSelectedProject} from '../../webapp-common/core/reducers/projects.reducer';
import {formatStaticCrumb, prepareLinkData} from '../../webapp-common/layout/breadcrumbs/breadcrumbs-common.utils';

export interface IBreadcrumbs {
  project: Project;
  experiment: ISelectedExperiment;
  model: TableModel;
  task: Task;
}

export const selectBreadcrumbsStringsBase = createSelector(
  selectSelectedProject, selectSelectedExperiment, selectSelectedTableModel,
  (project, experiment, model) =>
    ({project, experiment, model}) as IBreadcrumbs);



export function prepareNames(data: IBreadcrumbs) {

  const project    = prepareLinkData(data.project, true);

  const task       = prepareLinkData(data.task);
  const experiment = (data.experiment) ? prepareLinkData(data.experiment, true) : {};
  const model      = prepareLinkData(data.model, true);

  const output      = formatStaticCrumb('');
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
    models,
    execution: formatStaticCrumb('execution'),
    'hyper-params' : formatStaticCrumb('hyper-params'),
    artifacts: formatStaticCrumb('artifacts'),
    general: formatStaticCrumb('general'),
    log: formatStaticCrumb('logs'),
    'scalar': formatStaticCrumb('scalars'),
    'plots': formatStaticCrumb('plots'),
    debugImages: formatStaticCrumb('Debug Samples'),
  };
}
