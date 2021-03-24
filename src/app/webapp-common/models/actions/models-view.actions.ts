import {Action, createAction, props} from '@ngrx/store';
import {TableSortOrderEnum} from '../../shared/ui-components/data/table/table.consts';
import {ModelsViewModesEnum} from '../models.consts';
import {SelectedModel} from '../shared/models.model';
import {TableFilter} from '../../shared/utils/tableParamEncode';
import {User} from '../../../business-logic/model/users/user';
import {EXPERIMENTS_PREFIX} from '../../experiments/actions/common-experiments-view.actions';

const MODELS_PREFIX = 'MODELS_';

// COMMANDS:
export const ARCHIVE_SELECTED_MODELS = MODELS_PREFIX + 'ARCHIVE_SELECTED_MODELS';
export const RESTORE_SELECTED_MODELS = MODELS_PREFIX + 'RESTORE_SELECTED_MODELS';
export const ADD_MANY_MODELS = MODELS_PREFIX + 'ADD_MANY_MODELS';
export const GET_NEXT_MODELS = MODELS_PREFIX + 'GET_NEXT_MODELS';
export const SET_MODELS = MODELS_PREFIX + 'SET_MODELS';
export const SET_NO_MORE_MODELS = MODELS_PREFIX + 'SET_NO_MORE_MODELS';
export const SET_NEXT_PAGE = MODELS_PREFIX + 'SET_NEXT_PAGE';
export const SET_SELECTED_MODELS = MODELS_PREFIX + 'SET_SELECTED_MODELS';
export const SET_SELECTED_MODEL = MODELS_PREFIX + 'SET_SELECTED_MODEL';
export const SET_VIEW_MODE = MODELS_PREFIX + 'SET_VIEW_MODE';
export const REMOVE_MANY_MODELS = MODELS_PREFIX + 'REMOVE_MANY_MODELS';
export const UPDATE_ONE_MODELS = MODELS_PREFIX + 'UPDATE_ONE_MODELS';
export const RESET_STATE = MODELS_PREFIX + 'RESET_STATE';
export const SHOW_ALL_SELECTED = MODELS_PREFIX + 'SHOW_ALL_SELECTED';
export const SET_SHOW_ALL_SELECTED_IS_ACTIVE = MODELS_PREFIX + 'SET_SHOW_ALL_SELECTED_IS_ACTIVE';
export const REFRESH_MODELS = MODELS_PREFIX + 'REFRESH_MODELS';


// EVENTS:
export const ARCHIVE_MODE_CHANGED = MODELS_PREFIX + 'ARCHIVE_MODE_CHANGED';
export const GLOBAL_FILTER_CHANGED = MODELS_PREFIX + 'GLOBAL_FILTER_CHANGED';
export const TABLE_SORT_CHANGED = MODELS_PREFIX + 'TABLE_SORT_CHANGED';
export const TABLE_FILTER_CHANGED = MODELS_PREFIX + 'TABLE_FILTER_CHANGED';
export const SET_TABLE_FILTERS = MODELS_PREFIX + 'SET_TABLE_FILTERS';
export const MODEL_SELECTION_CHANGED = MODELS_PREFIX + 'MODEL_SELECTION_CHANGED';

export const FETCH_MODELS_REQUESTED = MODELS_PREFIX + 'FETCH_MODELS_REQUESTED';

export class FetchModelsRequested implements Action {
  readonly type = FETCH_MODELS_REQUESTED;

  constructor() {
  }
}

export class RefreshModels implements Action {
  readonly type = REFRESH_MODELS;

  constructor(public payload: { hideLoader: boolean; autoRefresh: boolean }) {
  }
}

export class GetNextModels implements Action {
  readonly type = GET_NEXT_MODELS;
}

export class SetModels implements Action {
  readonly type = SET_MODELS;

  constructor(public payload: SelectedModel[]) {}
}

export const setModelsInPlace = createAction(
  MODELS_PREFIX + '[set models in place]',
  props<{ models: SelectedModel[] }>()
);

export class SetNoMoreModels implements Action {
  readonly type = SET_NO_MORE_MODELS;

  constructor(public payload: boolean) {
  }
}

export const toggleColHidden = createAction(
  MODELS_PREFIX + 'TOGGLE_COL_HIDDEN',
  props<{ colName: string }>()
);

export const getTags = createAction(
  MODELS_PREFIX + 'GET_TAGS');

export const setTags = createAction(
  MODELS_PREFIX + 'SET_TAGS',
  props<{ tags: string[] }>()
);

export const setHiddenCols = createAction(
  MODELS_PREFIX + 'SET_HIDDEN_COLS',
  props<{ hiddenCols: { [key: string]: boolean } }>()
);

export const changeColsOrder = createAction(
  MODELS_PREFIX + 'CHANGE_COLS_ORDER',
  props<{ cols: string[] }>()
);
export const setColsOrderForProject = createAction(
  MODELS_PREFIX + 'SET_COLS_ORDER',
  props<{ cols: string[]; project: string }>()
);

export const setUsers = createAction(
  MODELS_PREFIX + 'SET_USERS',
  props<{ users: User[] }>()
);

export const getUsers = createAction(
  MODELS_PREFIX + 'GET_USERS');

export const setFrameworks = createAction(
  MODELS_PREFIX + 'SET_FRAMEWORKS',
  props<{ frameworks: string[] }>()
);

export const getFrameworks = createAction(
  MODELS_PREFIX + 'GET_FRAMEWORKS');

export const getFilteredUsers = createAction(
  MODELS_PREFIX + 'GET_FILTERED_USERS');

export class AddModels implements Action {
  readonly type = ADD_MANY_MODELS;

  constructor(public payload: SelectedModel[]) {
  }
}

export class RemoveModels implements Action {
  readonly type = REMOVE_MANY_MODELS;

  constructor(public payload: SelectedModel['id'][]) {
  }
}

export class UpdateModel implements Action {
  readonly type = UPDATE_ONE_MODELS;

  constructor(public payload: { id: SelectedModel['id']; changes: Partial<SelectedModel> }) {
  }
}

export class SetSelectedModels implements Action {
  public type = SET_SELECTED_MODELS;

  constructor(public payload: SelectedModel[]) {
  }
}

export class SetSelectedModel implements Action {
  public type = SET_SELECTED_MODEL;

  constructor(public payload: SelectedModel) {
  }
}

export class TableSortChanged implements Action {
  public type = TABLE_SORT_CHANGED;

  constructor(public payload: { colId: string; sortOrder: (TableSortOrderEnum) }) {
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

export class ModelSelectionChanged implements Action {
  readonly type = MODEL_SELECTION_CHANGED;

  constructor(public payload: { model: SelectedModel; project?: string }) {
    this.payload.project = this.payload.project || '*';
  }
}

export class SetShowAllSelectedIsActive implements Action {
  readonly type = SET_SHOW_ALL_SELECTED_IS_ACTIVE;

  constructor(public payload: boolean) {
  }
}

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

export const resetGlobalFilter = createAction(MODELS_PREFIX + 'RESET_GLOBAL_FILTER');

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

export class ArchivedSelectedModels implements Action {
  public type = ARCHIVE_SELECTED_MODELS;
  public payload: { skipUndo: boolean };

  constructor(skipUndo?: boolean) {
    this.payload = {skipUndo};
  }
}

export class RestoreSelectedModels implements Action {
  public type = RESTORE_SELECTED_MODELS;
  public payload: { skipUndo: boolean };

  constructor(skipUndo?: boolean) {
    this.payload = {skipUndo};
  }
}

export class SetViewMode implements Action {
  public type = SET_VIEW_MODE;
  public payload: { viewMode: ModelsViewModesEnum };

  constructor(viewMode: ModelsViewModesEnum) {
    this.payload = {viewMode};
  }
}

export class ResetState implements Action {
  readonly type = RESET_STATE;

  constructor() {
  }
}

export const setArchive = createAction(
  MODELS_PREFIX + 'SET_ARCHIVE',
  props<{ archive: boolean }>()
);

export const afterSetArchive = createAction(MODELS_PREFIX + 'AFTER_SET_ARCHIVE');

export const setSplitSize = createAction(MODELS_PREFIX + 'SET_SPLIT_SIZE', props<{ splitSize: number }>());
