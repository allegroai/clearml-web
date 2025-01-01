import {DASHBOARD_PREFIX} from './common-dashboard.const';
import {Project} from '~/business-logic/model/projects/project';
import {IRecentTask} from './common-dashboard.reducer';
import {createAction, props} from '@ngrx/store';
import {IReport} from '@common/reports/reports.consts';

export const getRecentProjects = createAction(DASHBOARD_PREFIX + '[get recent projects]');
export const getRecentExperiments = createAction(DASHBOARD_PREFIX + '[get recent experiments]');

export const setRecentProjects = createAction(
  DASHBOARD_PREFIX + '[set recent projects]',
  props<{projects: Project[]}>()
);

export const setRecentExperiments = createAction(
  DASHBOARD_PREFIX + '[set recent experiments]',
  props<{experiments: IRecentTask[]}>()
);

export const getRecentReports = createAction(DASHBOARD_PREFIX + '[get recent reports]');
export const setRecentReports = createAction(
  DASHBOARD_PREFIX + '[set recent reports]',
  props<{reports: IReport[]}>()
);
