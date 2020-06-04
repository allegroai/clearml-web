import {MODELS_VIEW_MODES, ModelsViewModesEnum} from '../models.consts';
import {TABLE_SORT_ORDER, TableSortOrderEnum} from '../../shared/ui-components/data/table/table.consts';
import {ISmAction} from '../../core/models/actions';
import * as actions from '../actions/models-view.actions';
import {ITableModel, ModelTableColFieldsEnum} from '../shared/models.model';
import {MODELS_TABLE_COL_FIELDS} from '../shared/models.const';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {TableFilter} from '../../shared/utils/tableParamEncode';
import {User} from '../../../business-logic/model/users/user';
import {setModelsInPlace} from '../actions/models-view.actions';

export interface IModelsViewState {
  models: Array<any>;
  colsOrder: { [Project: string]: string[] };
  hiddenTableCols: { [key: string]: boolean };
  selectedModels: Array<ITableModel>; // TODO: declare type.
  selectedModel: ITableModel;
  noMoreModels: boolean;
  selectedModelSource: string;
  modelToken: string;
  viewMode: ModelsViewModesEnum;
  tableFilters: Map<ModelTableColFieldsEnum, FilterMetadata>;
  tableSortField: string;
  tableSortOrder: TableSortOrderEnum;
  page: number;
  globalFilter: string;
  showAllSelectedIsActive: boolean;
  users: User[];
}

const initialState: IModelsViewState = {
  models                 : [],
  colsOrder              : {},
  hiddenTableCols        : {'comment': true},
  selectedModels         : [],
  selectedModel          : null,
  noMoreModels           : false,
  selectedModelSource    : null,
  modelToken             : null,
  viewMode               : MODELS_VIEW_MODES.TABLE,
  tableFilters           : null,
  tableSortField         : MODELS_TABLE_COL_FIELDS.CREATED,
  tableSortOrder         : TABLE_SORT_ORDER.ASC,
  page                   : -1, // -1 so the "getNextModels" will send 0.
  globalFilter           : null,
  showAllSelectedIsActive: false,
  users                  : []
};

export function modelsViewReducer(state: IModelsViewState = initialState, action: any): IModelsViewState {

  switch (action.type) {
    case actions.RESET_STATE:
      return {...state, models: [], selectedModel: null};
    case actions.ADD_MANY_MODELS:
      return {...state, models: state.models.concat(action.payload)};
    case actions.REMOVE_MANY_MODELS:
      return {...state, models: state.models.filter(exp => !action.payload.includes(exp.id))};
    case  actions.SET_SHOW_ALL_SELECTED_IS_ACTIVE:
      return {...state, showAllSelectedIsActive: action.payload, globalFilter: initialState.globalFilter, tableFilters: initialState.tableFilters};
    case actions.UPDATE_ONE_MODELS:
      return {
        ...state, models:
          state.models.map(ex => ex.id === action.payload.id ? {...ex, ...action.payload.changes} : ex)
      };
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
    case actions.SET_SELECTED_MODEL:
      return {...state, selectedModel: action.payload};
    case actions.SET_VIEW_MODE:
      return {...state, viewMode: action.payload};
    case actions.GLOBAL_FILTER_CHANGED:
      return {...state, globalFilter: action.payload};
    case actions.resetGlobalFilter.type:
      return {...state, globalFilter: ''};
    case actions.toggleColHidden.type:
      return {...state, hiddenTableCols: {...state.hiddenTableCols, [action.colName]: !state.hiddenTableCols[action.colName]}};
    case actions.setHiddenCols.type:
      return {...state, hiddenTableCols: action.hiddenCols};
    case actions.setUsers.type:
      return {...state, users: action.users};
    case actions.TABLE_SORT_CHANGED:
      return {...state, tableSortOrder: action.payload.sortOrder, tableSortField: action.payload.colId};
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
    default:
      return state;
  }
}
