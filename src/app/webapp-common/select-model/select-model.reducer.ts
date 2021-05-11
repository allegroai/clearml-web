import {createFeatureSelector, createSelector} from '@ngrx/store';

import {MODELS_VIEW_MODES, ModelsViewModesEnum} from '../../webapp-common/models/models.consts';
import {TABLE_SORT_ORDER} from '../../webapp-common/shared/ui-components/data/table/table.consts';
import {SelectedModel} from '../../webapp-common/models/shared/models.model';
import {MODELS_TABLE_COL_FIELDS} from '../../webapp-common/models/shared/models.const';
import * as actions from './select-model.actions';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {SortMeta} from 'primeng/api';

export interface SelectModelState {
  models: SelectedModel[];
  selectedModels: SelectedModel[];
  noMoreModels: boolean;
  selectedModelSource: string;
  modelToken: string;
  viewMode: ModelsViewModesEnum;
  allProjectsMode: boolean;
  tableFilters: { [s: string]: FilterMetadata };
  tableSortFields: SortMeta[];
  page: number;
  globalFilter: string;
}

const selectModelInitState: SelectModelState = {
  models: [],
  selectedModels: [],
  noMoreModels: false,
  selectedModelSource: null,
  modelToken: null,
  viewMode: MODELS_VIEW_MODES.TABLE,
  allProjectsMode: true,
  tableFilters: null,
  tableSortFields: [{field: MODELS_TABLE_COL_FIELDS.CREATED, order: TABLE_SORT_ORDER.DESC}],
  page: -1, // -1 so the "getNextModels" will send 0.
  globalFilter: null,
};


export function selectModelReducer<ActionReducer>(state: SelectModelState = selectModelInitState, action): SelectModelState {
  switch (action.type) {
    case actions.RESET_STATE:
      return {...selectModelInitState};
    case actions.ADD_MANY_MODELS:
      return {...state, models: state.models.concat(action.payload)};
    case actions.REMOVE_MANY_MODELS:
      return {...state, models: state.models.filter(exp => !action.payload.includes(exp.id))};
    case actions.UPDATE_ONE_MODELS:
      return {
        ...state, models:
          state.models.map(ex => ex.id === action.payload.id ? {...ex, ...action.payload.changes} : ex)
      };
    case actions.SET_MODELS:
      return {...state, models: action.payload};
    case actions.SET_NO_MORE_MODELS:
      return {...state, noMoreModels: action.payload};
    case actions.SET_NEXT_PAGE:
      return {...state, page: action.payload};
    case actions.SET_SELECTED_MODELS:
      return {...state, selectedModels: action.payload};
    case actions.ALL_PROJECTS_MODE_CHANGED:
      return {...state, allProjectsMode: action.payload};
    case actions.SET_VIEW_MODE:
      return {...state, viewMode: action.payload};
    case actions.GLOBAL_FILTER_CHANGED:
      return {...state, globalFilter: action.payload};
    case actions.setTableSort.type:
      return {...state, tableSortFields: action.orders};
    case actions.TABLE_FILTER_CHANGED:
      return {
        ...state,
        tableFilters: {
          ...state.tableFilters,
          [action.payload.col.id]: {value: action.payload.value, matchMode: action.payload.col.filterMatchMode}
        }
      };
    default:
      return state;
  }
}


export const models = createFeatureSelector<SelectModelState>('selectModel');
export const selectModelsList = createSelector(models, (state) => state ? state.models : []);
export const selectCurrentPage = createSelector(models, (state): number => state.page);
export const selectGlobalFilter = createSelector(models, (state): string => state.globalFilter);
export const selectTableSortFields = createSelector(models, (state): SortMeta[] => state.tableSortFields);
export const selectTableFilters = createSelector(models, state => state.tableFilters);
export const selectIsAllProjectsMode = createSelector(models, (state): boolean => state.allProjectsMode);
export const selectViewMode = createSelector(models, (state): ModelsViewModesEnum => state.viewMode);
export const selectSelectedModels = createSelector(models, (state): Array<any> => state.selectedModels);
export const selectNoMoreModels = createSelector(models, (state): boolean => state.noMoreModels);
