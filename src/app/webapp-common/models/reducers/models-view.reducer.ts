import {MODELS_VIEW_MODES, ModelsViewModesEnum} from '../models.consts';
import {TABLE_SORT_ORDER} from '../../shared/ui-components/data/table/table.consts';
import * as actions from '../actions/models-view.actions';
import {TableModel, SelectedModel} from '../shared/models.model';
import {MODELS_TABLE_COL_FIELDS} from '../shared/models.const';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {TableFilter} from '../../shared/utils/tableParamEncode';
import {User} from '../../../business-logic/model/users/user';
import {setModelsInPlace} from '../actions/models-view.actions';
import {ICommonSearchState} from '../../common-search/common-search.reducer';
import {SortMeta} from 'primeng/api';
import {CountAvailableAndIsDisableSelectedFiltered} from '@common/shared/entity-page/items.utils';
import {SET_SELECTED_PROJECT} from '@common/core/actions/projects.actions';

export interface IModelsViewState {
  splitSize: number;
  models: Array<any>;
  colsOrder: { [Project: string]: string[] };
  hiddenTableCols: { [key: string]: boolean };
  selectedModels: Array<TableModel>; // TODO: declare type.
  selectedModel: SelectedModel;
  noMoreModels: boolean;
  selectedModelSource: string;
  modelToken: string;
  viewMode: ModelsViewModesEnum;
  tableFilters: {[section: string]: FilterMetadata};
  tableSortFields: SortMeta[];
  page: number;
  globalFilter: ICommonSearchState['searchQuery'];
  showAllSelectedIsActive: boolean;
  users: User[];
  frameworks: string[];
  projectTags: string[];
  selectedModelsDisableAvailable: Record<string, CountAvailableAndIsDisableSelectedFiltered>;
}

const initialState: IModelsViewState = {
  splitSize: 65,
  models: [],
  frameworks: [],
  colsOrder: {},
  hiddenTableCols: {'comment': true},
  selectedModels: [],
  selectedModelsDisableAvailable: {},
  selectedModel: null,
  noMoreModels: false,
  selectedModelSource: null,
  modelToken: null,
  viewMode: MODELS_VIEW_MODES.TABLE,
  tableFilters: null,
  tableSortFields: [{field: MODELS_TABLE_COL_FIELDS.CREATED, order: TABLE_SORT_ORDER.DESC}],
  page: -1, // -1 so the "getNextModels" will send 0.
  globalFilter: null,
  showAllSelectedIsActive: false,
  users: [],
  projectTags: [],
};

export function modelsViewReducer(state: IModelsViewState = initialState, action: any): IModelsViewState {

  switch (action.type) {
    case actions.RESET_STATE:
      return {
        ...state,
        models: initialState.models,
        selectedModel: initialState.selectedModel,
      };
    case SET_SELECTED_PROJECT:
      return {...state, selectedModels: initialState.selectedModels};
    case actions.ADD_MANY_MODELS:
      return {...state, models: state.models.concat(action.payload)};
    case actions.REMOVE_MANY_MODELS:
      return {...state, models: state.models.filter(exp => !action.payload.includes(exp.id))};
    case  actions.SET_SHOW_ALL_SELECTED_IS_ACTIVE:
      return {...state, showAllSelectedIsActive: action.payload, globalFilter: initialState.globalFilter, tableFilters: initialState.tableFilters};
    case actions.UPDATE_ONE_MODELS: {
      const payload = (action as actions.UpdateModel).payload;
      const newState = {
        ...state, models:
          state.models.map(ex => ex.id === payload.id ? {...ex, ...payload.changes} : ex)
      };
      if (state.selectedModel?.id === payload.id) {
        newState.selectedModel = {...state.selectedModel, ...payload.changes};
      }
      if (state.selectedModels.find(ex => ex.id === payload.id)) {
        newState.selectedModels = state.selectedModels.map(ex => ex.id === payload.id ? {...ex, ...payload.changes} : ex);
      }
      return newState;
    }
    case actions.SET_MODELS:
      return {...state, models: action.payload};
    case setModelsInPlace.type:
      return {...state, models: state.models.map(currModel => action.models.find(newModel => newModel.id === currModel.id))};
    case actions.SET_NO_MORE_MODELS:
      return {...state, noMoreModels: action.payload};
    case actions.SET_NEXT_PAGE:
      return {...state, page: action.payload};
    case actions.SET_SELECTED_MODELS:
      return {...state, selectedModels: action.payload};
    case actions.setSelectedModelsDisableAvailable.type:
      return {...state, selectedModelsDisableAvailable: action.selectedModelsDisableAvailable};
    case actions.SET_SELECTED_MODEL:
      return {...state, selectedModel: action.payload};
    case actions.SET_VIEW_MODE:
      return {...state, viewMode: action.payload};
    case actions.globalFilterChanged.type:
      return {...state, globalFilter: action as ReturnType<typeof actions.globalFilterChanged>};
    case actions.resetGlobalFilter.type:
      return {...state, globalFilter: initialState.globalFilter};
    case actions.toggleColHidden.type:
      return {...state, hiddenTableCols: {...state.hiddenTableCols, [action.colName]: !state.hiddenTableCols[action.colName]}};
    case actions.setHiddenCols.type:
      return {...state, hiddenTableCols: action.hiddenCols};
    case actions.setUsers.type:
      return {...state, users: action.users};
    case actions.setFrameworks.type:
      return {...state, frameworks: action.frameworks};
    case actions.setTags.type:
      return {...state, projectTags: action.tags};
    case actions.setTableSort.type:
      return {...state, tableSortFields: action.orders};
    case actions.TABLE_FILTER_CHANGED: {
      const payload = (action as actions.TableFilterChanged).payload;
      return {
        ...state,
        tableFilters: {
          ...state.tableFilters,
          [payload.col]: {value: payload.value, matchMode: payload.filterMatchMode}
        }
      };
    }
    case actions.setColsOrderForProject.type:
      return {...state, colsOrder: {...state.colsOrder, [action.project]: action.cols}};
    case actions.setTableFilters.type:
      return {
        ...state, tableFilters: {
          ...action['filters'].reduce((obj: object, filter: TableFilter) => {
            obj[filter.col] = {value: filter.value, machMode: filter.filterMatchMode};
            return obj;
          }, {})
        }
      };
    case actions.setSplitSize.type:
      return {...state, splitSize: action.splitSize};
    default:
      return state;
  }
}
