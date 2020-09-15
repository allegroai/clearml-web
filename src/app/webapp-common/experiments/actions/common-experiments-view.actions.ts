import {Action, createAction, props} from '@ngrx/store';
import {ITableExperiment} from '../shared/common-experiment-model.model';
import {TableSortOrderEnum} from '../../shared/ui-components/data/table/table.consts';
import {ExperimentsViewModesEnum} from '../shared/common-experiments.const';
import {MetricVariantResult} from '../../../business-logic/model/projects/metricVariantResult';
import {TableFilter} from '../../shared/utils/tableParamEncode';
import {PROJECTS_PREFIX} from '../../core/actions/projects.actions';
import {User} from '../../../business-logic/model/users/user';
import {ParamsItem} from '../../../business-logic/model/tasks/paramsItem';

export const EXPERIMENTS_PREFIX = 'EXPERIMENTS_';

// COMMANDS:
export const ARCHIVE_SELECTED_EXPERIMENTS = EXPERIMENTS_PREFIX + 'ARCHIVE_SELECTED_EXPERIMENTS';
export const RESTORE_SELECTED_EXPERIMENTS = EXPERIMENTS_PREFIX + 'RESTORE_SELECTED_EXPERIMENTS';
export const ADD_MANY_EXPERIMENTS = EXPERIMENTS_PREFIX + 'ADD_MANY_EXPERIMENTS';
export const GET_EXPERIMENTS = EXPERIMENTS_PREFIX + 'GET_EXPERIMENTS';
export const REFRESH_EXPERIMENTS = EXPERIMENTS_PREFIX + 'REFRESH_EXPERIMENTS';
export const GET_NEXT_EXPERIMENTS = EXPERIMENTS_PREFIX + 'GET_NEXT_EXPERIMENTS';
export const SET_EXPERIMENTS = EXPERIMENTS_PREFIX + 'SET_EXPERIMENTS';
export const SET_NEXT_PAGE = EXPERIMENTS_PREFIX + 'SET_NEXT_PAGE';
export const SET_SELECTED_EXPERIMENTS = EXPERIMENTS_PREFIX + 'SET_SELECTED_EXPERIMENTS';
export const SET_SELECTED_EXPERIMENT = EXPERIMENTS_PREFIX + 'SET_SELECTED_EXPERIMENT';
export const SET_VIEW_MODE = EXPERIMENTS_PREFIX + 'SET_VIEW_MODE';
export const SET_NO_MORE_EXPERIMENTS = EXPERIMENTS_PREFIX + 'SET_NO_MORE_EXPERIMENTS';
export const REMOVE_MANY_EXPERIMENTS = EXPERIMENTS_PREFIX + 'REMOVE_MANY_EXPERIMENTS';
export const UPDATE_ONE_EXPERIMENTS = EXPERIMENTS_PREFIX + 'UPDATE_ONE_EXPERIMENTS';
export const RESET_EXPERIMENTS = EXPERIMENTS_PREFIX + 'RESET_EXPERIMENTS';

export const SHOW_ALL_SELECTED = EXPERIMENTS_PREFIX + 'SHOW_ALL_SELECTED';
export const SET_SHOW_ALL_SELECTED_IS_ACTIVE = EXPERIMENTS_PREFIX + 'SET_SHOW_ALL_SELECTED_IS_ACTIVE';
// EVENTS:
export const ARCHIVE_MODE_CHANGED = EXPERIMENTS_PREFIX + 'ARCHIVE_MODE_CHANGED';

export const GLOBAL_FILTER_CHANGED = EXPERIMENTS_PREFIX + 'GLOBAL_FILTER_CHANGED';
export const TABLE_SORT_CHANGED = EXPERIMENTS_PREFIX + 'TABLE_SORT_CHANGED';
export const TABLE_FILTER_CHANGED = EXPERIMENTS_PREFIX + 'TABLE_FILTER_CHANGED';
export const SET_TABLE_FILTERS = EXPERIMENTS_PREFIX + 'SET_TABLE_FILTERS';
export const GET_PROJECT_TYPES = EXPERIMENTS_PREFIX + 'GET_PROJECT_TYPES';
export const SET_PROJECT_TYPES = EXPERIMENTS_PREFIX + 'SET_PROJECT_TYPES';
export const EXPERIMENT_SELECTION_CHANGED = EXPERIMENTS_PREFIX + 'EXPERIMENT_SELECTION_CHANGED';
// export const EXPERIMENTS_SELECTION_CHANGED = EXPERIMENTS_PREFIX + 'EXPERIMENTS_SELECTION_CHANGED';
export const TOGGLE_COL_HIDDEN = EXPERIMENTS_PREFIX + 'TOGGLE_COL_HIDDEN';

export class GetExperiments implements Action {
  readonly type = GET_EXPERIMENTS;
}

export class RefreshExperiments implements Action {
  readonly type = REFRESH_EXPERIMENTS;

  constructor(public payload: { hideLoader: boolean; autoRefresh?: boolean; }) {
  }
}

export class SetShowAllSelectedIsActive implements Action {
  readonly type = SET_SHOW_ALL_SELECTED_IS_ACTIVE;

  constructor(public payload: boolean) {
  }
}


export class GetNextExperiments implements Action {
  readonly type = GET_NEXT_EXPERIMENTS;
}

export class SetExperiments implements Action {
  readonly type = SET_EXPERIMENTS;

  constructor(public payload: Array<ITableExperiment>) {
  }
}

export const setExperimentInPlace = createAction(
  EXPERIMENTS_PREFIX + '[set experiment in place]',
  props<{ experiments: ITableExperiment[] }>()
);

export class SetNoMoreExperiments implements Action {
  readonly type = SET_NO_MORE_EXPERIMENTS;

  constructor(public payload: boolean) {
  }
}

export class AddExperiments implements Action {
  readonly type = ADD_MANY_EXPERIMENTS;

  constructor(public payload: Array<ITableExperiment>) {
  }
}

export class RemoveExperiments implements Action {
  readonly type = REMOVE_MANY_EXPERIMENTS;

  constructor(public payload: Array<ITableExperiment['id']>) {
  }
}

export class UpdateExperiment implements Action {
  readonly type = UPDATE_ONE_EXPERIMENTS;

  constructor(public payload: { id: ITableExperiment['id'], changes: Partial<ITableExperiment> }) {
  }
}

export class SetSelectedExperiments implements Action {
  public type = SET_SELECTED_EXPERIMENTS;

  constructor(public payload: Array<ITableExperiment>) {
  }
}

export class SetSelectedExperiment implements Action {
  public type = SET_SELECTED_EXPERIMENT;

  constructor(public payload: ITableExperiment) {
  }
}

export class ExperimentSelectionChanged implements Action {
  readonly type = EXPERIMENT_SELECTION_CHANGED;

  constructor(public payload: { experiment: { id: string }, project?: string }) {
    this.payload.project = this.payload.project || '*';
  }
}


export class ToggleColHidden implements Action {
  readonly type = TOGGLE_COL_HIDDEN;

  constructor(public payload: string) {
  }
}

export const setHiddenColumns = createAction(
  EXPERIMENTS_PREFIX + 'SET_HIDDEN_COLS',
  props<{ visibleColumns: string[] }>()
);

export const setUsers = createAction(
  EXPERIMENTS_PREFIX + 'SET_USERS',
  props<{ users: User[] }>()
);



export const getUsers = createAction(
  EXPERIMENTS_PREFIX + 'GET_USERS');

export const getFilteredUsers = createAction(
  EXPERIMENTS_PREFIX + 'GET_FILTERED_USERS');

export const getTags = createAction(
  EXPERIMENTS_PREFIX + 'GET_TAGS');

export const setTags = createAction(
  EXPERIMENTS_PREFIX + 'SET_TAGS',
  props<{ tags: string[] }>()
);

export class TableSortChanged implements Action {
  public type = TABLE_SORT_CHANGED;
  public payload: { colId: string; sortOrder: (TableSortOrderEnum) };

  constructor(colId: string, sortOrder: TableSortOrderEnum) {
    this.payload = {colId, sortOrder};
  }
}

export class TableFilterChanged implements Action {
  public type = TABLE_FILTER_CHANGED;

  constructor(public payload: TableFilter) {
  }
}

export const setTableFilters = createAction(
  SET_TABLE_FILTERS,
  props<{ filters: TableFilter[] }>()
);

export const setProjectsTypes = createAction(
  SET_PROJECT_TYPES,
  props<{ types?: Array<string> }>()
);

export const getProjectTypes = createAction(
  GET_PROJECT_TYPES
);

export class ShowAllSelected implements Action {
  public type = SHOW_ALL_SELECTED;

  constructor(public payload: boolean) {
  }
}


export class GlobalFilterChanged implements Action {
  public type = GLOBAL_FILTER_CHANGED;

  constructor(public payload: string) {
  }
}

export const resetGlobalFilter = createAction(EXPERIMENTS_PREFIX + 'RESET_GLOBAL_FILTER');

export class SetCurrentPage implements Action {
  public type = SET_NEXT_PAGE;

  constructor(public payload: number) {
  }
}

export class ArchivedModeChanged implements Action {
  public type = ARCHIVE_MODE_CHANGED;

  constructor(public payload: boolean) {
  }
}

export class ArchivedSelectedExperiments implements Action {
  public type = ARCHIVE_SELECTED_EXPERIMENTS;

  constructor(public payload: { skipUndo?: boolean }) {
  }
}

export class RestoreSelectedExperiments implements Action {
  public type = RESTORE_SELECTED_EXPERIMENTS;

  constructor(public payload: { skipUndo?: boolean }) {
  }
}

export class SetViewMode implements Action {
  public type = SET_VIEW_MODE;
  public payload: { viewMode: ExperimentsViewModesEnum };

  constructor(viewMode: ExperimentsViewModesEnum) {
    this.payload = {viewMode};
  }
}

export class ResetExperiments implements Action {
  readonly type = RESET_EXPERIMENTS;

  constructor() {
  }
}

export const GET_CUSTOM_METRICS = EXPERIMENTS_PREFIX + 'GET_CUSTOM_METRICS';
export const GET_CUSTOM_HYPER_PARAMS = EXPERIMENTS_PREFIX + 'GET_CUSTOM_HYPER_PARAMS';
export const SET_CUSTOM_METRICS = EXPERIMENTS_PREFIX + 'SET_CUSTOM_METRICS';
export const SET_CUSTOM_HYPER_PARAMS = EXPERIMENTS_PREFIX + 'SET_CUSTOM_HYPER_PARAMS';
export const ADD_COL = EXPERIMENTS_PREFIX + 'ADD_COL';
export const REMOVE_COL = EXPERIMENTS_PREFIX + 'REMOVE_COL';
export const SET_COLS_ORDER = EXPERIMENTS_PREFIX + 'SET_COLS_ORDER';
export const CHANGE_COLS_ORDER = EXPERIMENTS_PREFIX + 'CHANGE_COLS_ORDER';
export const CLEAR_HYPER_PARAMS_COLS = EXPERIMENTS_PREFIX + 'CLEAR_COLS';
export const RESET_SORT_ORDER = EXPERIMENTS_PREFIX + 'RESET_SORT_ORDER';

export class GetCustomMetrics implements Action {
  readonly type = GET_CUSTOM_METRICS;
}

export class GetCustomHyperParams implements Action {
  readonly type = GET_CUSTOM_HYPER_PARAMS;
}

export class SetCustomMetrics implements Action {
  public type = SET_CUSTOM_METRICS;
  public payload: { metrics: Array<MetricVariantResult> };

  constructor(metrics: Array<MetricVariantResult>) {
    this.payload = {metrics};
  }
}

export class SetCustomHyperParams implements Action {
  public type = SET_CUSTOM_HYPER_PARAMS;
  public payload: { params: Array<any> };

  constructor(params: Array<any>) {
    this.payload = {params};
  }
}

export const setExtraColumns = createAction(
  EXPERIMENTS_PREFIX + 'SET_EXTRA_COLUMNS',
  props<{ columns: any[] }>()
);

export class AddCol implements Action {
  public type = ADD_COL;
  public payload: { col: any };

  constructor(col: any) {
    this.payload = {col};
  }
}

export class RemoveCol implements Action {
  public type = REMOVE_COL;
  public payload: { col: { id: string; projectId: string } };

  constructor(col: { id: string; projectId: string }) {
    this.payload = {col};
  }
}

export const changeColsOrder = createAction(
  EXPERIMENTS_PREFIX + 'CHANGE_COLS_ORDER',
  props<{ cols: string[] }>()
);


export const setColsOrderForProject = createAction(
  EXPERIMENTS_PREFIX + 'SET_COLS_ORDER',
  props<{ cols: string[]; project: string }>()
);

export class ClearHyperParamsCols implements Action {
  public type = CLEAR_HYPER_PARAMS_COLS;
  public payload: { projectId };

  constructor(projectId: string) {
    this.payload = {projectId};
  }
}

export class ResetSortOrder implements Action {
  public type = RESET_SORT_ORDER;
}

export const setArchive = createAction(
  EXPERIMENTS_PREFIX + 'SET_ARCHIVE',
  props<{ archive: boolean }>()
);

export const afterSetArchive = createAction(EXPERIMENTS_PREFIX + 'AFTER_SET_ARCHIVE');

export const setSplitSize = createAction(EXPERIMENTS_PREFIX + 'SET_SPLIT_SIZE', props<{ splitSize: number }>()
);
