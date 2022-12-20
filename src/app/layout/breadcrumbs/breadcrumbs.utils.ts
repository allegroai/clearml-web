import {selectSelectedTableModel} from '@common/models/reducers';
import {createSelector} from '@ngrx/store';
import {selectSelectedExperiment} from '~/features/experiments/reducers';
import {selectRootProjects, selectSelectedProject} from '@common/core/reducers/projects.reducer';
export {formatStaticCrumb} from '@common/layout/breadcrumbs/breadcrumbs-common.utils';
import {IBreadcrumbs} from '@common/layout/breadcrumbs/breadcrumbs-common.utils';
import {selectReport} from '@common/reports/reports.reducer';
export {prepareNames, IBreadcrumbs} from '@common/layout/breadcrumbs/breadcrumbs-common.utils';


export const selectBreadcrumbsStringsBase = createSelector(
  selectSelectedProject, selectSelectedExperiment, selectSelectedTableModel, selectRootProjects, selectReport,
  (project, experiment, model, projects, report) =>
    ({project, experiment, model, projects, report}) as IBreadcrumbs);
