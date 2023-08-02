import {createFeatureSelector, createSelector} from '@ngrx/store';

import {MODELS_VIEW_MODES, ModelsViewModesEnum} from '@common/models/models.consts';
import {TABLE_SORT_ORDER} from '@common/shared/ui-components/data/table/table.consts';
import {SelectedModel} from '@common/models/shared/models.model';
import {MODELS_TABLE_COL_FIELDS} from '@common/models/shared/models.const';
import * as actions from './select-model.actions';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {SortMeta} from 'primeng/api';

export interface SelectModelState {
  models: SelectedModel[];
  selectedModelsList: SelectedModel[];
  selectedModels: SelectedModel[];
  noMoreModels: boolean;
  selectedModelSource: string;
  modelToken: string;
  viewMode: ModelsViewModesEnum;
  allProjectsMode: boolean;
  tableFilters: { [s: string]: FilterMetadata };
  tableSortFields: SortMeta[];
  scrollId: string;
  globalFilter: string;
  showArchive: boolean;
}

const selectModelInitState: SelectModelState = {
  models: [],
  selectedModelsList: [],
  selectedModels: [],
  noMoreModels: false,
  selectedModelSource: null,
  modelToken: null,
  viewMode: MODELS_VIEW_MODES.TABLE,
  allProjectsMode: true,
  tableFilters: {},
  tableSortFields: [{field: MODELS_TABLE_COL_FIELDS.CREATED, order: TABLE_SORT_ORDER.DESC}],
  scrollId: null,
  globalFilter: null,
  showArchive: null
};


export function selectModelReducer<ActionReducer>(state: SelectModelState = selectModelInitState, action): SelectModelState {
  switch (action.type) {
    case actions.resetSelectModelState.type:
      return {
        ...selectModelInitState,
        ...(!action.fullReset && {
          tableFilters: state.tableFilters,
          tableSortFields: state.tableSortFields,
          showArchive: state.showArchive})
      };
    case actions.addModels.type:
      return {...state, models: state.models.concat(action.models)};
    case actions.removeModels.type:
      return {...state, models: state.models.filter(exp => !action.models.includes(exp.id))};
    case actions.updateModel.type:
      return {
        ...state, models:
          state.models.map(ex => ex.id === action.id ? {...ex, ...action.changes} : ex)
      };
    case actions.setModels.type:
      return {...state, models: action.models};
    case actions.setSelectedModelsList.type:
      return {...state, selectedModelsList: action.models};
    case actions.setNoMoreModels.type:
      return {...state, noMoreModels: action.noMore};
    case actions.setCurrentScrollId.type:
      return {...state, scrollId: action.scrollId};
    case actions.setSelectedModels.type:
      return {...state, selectedModels: action.models};
    case actions.setViewMode.type:
      return {...state, viewMode: action.viewMode};
    case actions.globalFilterChanged.type:
      return {...state, globalFilter: action.filter};
    case actions.setTableSort.type:
      return {...state, tableSortFields: action.orders};
    case actions.clearTableFilter.type:
      return {...state, tableFilters: {}};
    case actions.tableFilterChanged.type:
      return {
        ...state,
        tableFilters: {
          ...state.tableFilters,
          [action.col.id]: {value: action.value, matchMode: action.col.filterMatchMode}
        }
      };
    default:
      return state;
    case actions.showArchive.type:
      return {...state, showArchive: action.showArchive};
  }
}


export const models = createFeatureSelector<SelectModelState>('selectModel');
export const selectModels = createSelector(models, (state) => state ? state.models : []);
export const selectSelectedModelsList = createSelector(models, (state) => state ? state.selectedModelsList : []);
export const selectCurrentScrollId = createSelector(models, (state): string => state.scrollId);
export const selectGlobalFilter = createSelector(models, (state): string => state.globalFilter);
export const selectTableSortFields = createSelector(models, (state): SortMeta[] => state.tableSortFields);
export const selectSelectModelTableFilters = createSelector(models, state => state.tableFilters);
export const selectViewMode = createSelector(models, (state): ModelsViewModesEnum => state.viewMode);
export const selectSelectedModels = createSelector(models, (state): Array<any> => state.selectedModels);
export const selectNoMoreModels = createSelector(models, (state): boolean => state.noMoreModels);
export const selectShowArchive = createSelector(models, (state): boolean => state.showArchive);
