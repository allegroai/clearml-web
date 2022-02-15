import {Action, createAction, props} from '@ngrx/store';
import {TableModel} from '../models/shared/models.model';
import {ISmCol} from '../shared/ui-components/data/table/table.consts';
import {ModelsViewModesEnum} from '../models/models.consts';
import {SortMeta} from 'primeng/api';

const SELECT_MODEL_PREFIX = 'SELECT_MODEL_';

//COMMANDS:
export const ARCHIVE_SELECTED_MODELS = SELECT_MODEL_PREFIX + 'ARCHIVE_SELECTED_MODELS';
export const ADD_MANY_MODELS = SELECT_MODEL_PREFIX + 'ADD_MANY_MODELS';
export const GET_NEXT_MODELS = SELECT_MODEL_PREFIX + 'GET_NEXT_MODELS';
export const SET_MODELS = SELECT_MODEL_PREFIX + 'SET_MODELS';
export const SET_NO_MORE_MODELS = SELECT_MODEL_PREFIX + 'SET_NO_MORE_MODELS';
export const SET_SELECTED_MODELS = SELECT_MODEL_PREFIX + 'SET_SELECTED_MODELS';
export const SET_VIEW_MODE = SELECT_MODEL_PREFIX + 'SET_VIEW_MODE';
export const REMOVE_MANY_MODELS = SELECT_MODEL_PREFIX + 'REMOVE_MANY_MODELS';
export const UPDATE_ONE_MODELS = SELECT_MODEL_PREFIX + 'UPDATE_ONE_MODELS';
export const RESET_STATE = SELECT_MODEL_PREFIX + 'RESET_STATE';

//EVENTS:
export const ALL_PROJECTS_MODE_CHANGED = SELECT_MODEL_PREFIX + 'ALL_PROJECTS_MODE_CHANGED';

export const GLOBAL_FILTER_CHANGED = SELECT_MODEL_PREFIX + 'GLOBAL_FILTER_CHANGED';
export const TABLE_SORT_CHANGED = SELECT_MODEL_PREFIX + 'TABLE_SORT_CHANGED';
export const SET_TABLE_SORT = SELECT_MODEL_PREFIX + 'SET_TABLE_SORT';
export const TABLE_FILTER_CHANGED = SELECT_MODEL_PREFIX + 'TABLE_FILTER_CHANGED';

export class GetNextModels implements Action {
  readonly type = GET_NEXT_MODELS;
}

export class SetModels implements Action {
  readonly type = SET_MODELS;

  constructor(public payload: Array<TableModel>) {
  }
}

export class SetNoMoreModels implements Action {
  readonly type = SET_NO_MORE_MODELS;

  constructor(public payload: boolean) {
  }
}

export class AddModels implements Action {
  readonly type = ADD_MANY_MODELS;

  constructor(public payload: Array<TableModel>) {
  }
}

export class RemoveModels implements Action {
  readonly type = REMOVE_MANY_MODELS;

  constructor(public payload: Array<TableModel['id']>) {
  }
}

export class UpdateModel implements Action {
  readonly type = UPDATE_ONE_MODELS;

  constructor(public payload: { id: TableModel['id'], changes: Partial<TableModel> }) {
  }
}

export class SetSelectedModels implements Action {
  public type = SET_SELECTED_MODELS;

  constructor(public payload: Array<TableModel>) {
  }
}

export const tableSortChanged = createAction(
  TABLE_SORT_CHANGED,
  props<{ isShift: boolean; colId: ISmCol['id'] }>()
);

export const setTableSort = createAction(
  SET_TABLE_SORT,
  props<{ orders: SortMeta[] }>()
);

export class TableFilterChanged implements Action {
  public type = TABLE_FILTER_CHANGED;

  constructor(public payload: { col: ISmCol; value: any }) {
  }
}

export class GlobalFilterChanged implements Action {
  public type = GLOBAL_FILTER_CHANGED;

  constructor(public payload: string) {
  }
}

export const setCurrentScrollId = createAction(
  SELECT_MODEL_PREFIX + ' [set current scrollId]',
  props<{scrollId: string}>()
);

export class ArchivAllProjectsdModeChanged implements Action {
  public type = ALL_PROJECTS_MODE_CHANGED;

  constructor(public payload: boolean) {
  }
}

export class ArchivedSelectedModels implements Action {
  public type = ARCHIVE_SELECTED_MODELS;
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
