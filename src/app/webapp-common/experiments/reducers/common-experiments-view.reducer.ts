import {ISmAction} from '../../core/models/actions';
import {ExperimentTableColFieldsEnum, ITableExperiment} from '../shared/common-experiment-model.model';
import {INITIAL_EXPERIMENT_TABLE_COLS} from '../../../features/experiments/experiments.consts';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {TABLE_SORT_ORDER, TableSortOrderEnum} from '../../shared/ui-components/data/table/table.consts';
import {EXPERIMENTS_TABLE_COL_FIELDS} from '../../../features/experiments/shared/experiments.const';
import * as actions from '../actions/common-experiments-view.actions';
import {EXPERIMENTS_VIEW_MODES, ExperimentsViewModesEnum} from '../shared/common-experiments.const';
import {MetricVariantResult} from '../../../business-logic/model/projects/metricVariantResult';
import {TableFilter} from '../../shared/utils/tableParamEncode';
import {User} from '../../../business-logic/model/users/user';
import {experiments} from '../../../features/experiments/reducers';
import { setExperimentInPlace } from '../actions/common-experiments-view.actions';


export interface ICommonExperimentsViewState {
  tableCols: Array<any>;
  colsOrder: { [Project: string]: string[] };
  hiddenTableCols: any;
  experiments: Array<ITableExperiment>;
  noMoreExperiment: boolean;
  selectedExperiment: ITableExperiment;
  selectedExperiments: Array<ITableExperiment>; // TODO: declare type.
  selectedExperimentSource: string;
  experimentToken: string;
  viewMode: ExperimentsViewModesEnum;
  tableFilters: any;
  tableSortField: string;
  tableSortOrder: TableSortOrderEnum;
  page: number;
  globalFilter: string;
  showAllSelectedIsActive: boolean;
  metricsCols: Array<any>;
  metricVariants: Array<MetricVariantResult>;
  hyperParams: Array<any>;
  metricsLoading: boolean;
  users: User[];
  types: Array<string>;
  splitSize: number;
}

export const commonExperimentsInitialState: ICommonExperimentsViewState = {
  tableCols               : INITIAL_EXPERIMENT_TABLE_COLS,
  colsOrder               : {},
  hiddenTableCols         : {'comment': true},
  experiments             : [],
  noMoreExperiment        : false,
  selectedExperiment      : null,
  selectedExperiments     : [],
  selectedExperimentSource: null,
  experimentToken         : null,
  viewMode                : EXPERIMENTS_VIEW_MODES.TABLE,
  tableFilters            : null,
  tableSortField          : EXPERIMENTS_TABLE_COL_FIELDS.LAST_UPDATE,
  tableSortOrder          : TABLE_SORT_ORDER.ASC,
  page                    : -1, // -1 so the "getNextExperiments" will send 0.
  globalFilter            : null,
  showAllSelectedIsActive : false,
  metricsCols             : [],
  metricVariants          : [],
  hyperParams             : [],
  metricsLoading          : false,
  users                   : [],
  types                   : ['training', 'testing', 'inference', 'data_processing', 'application', 'monitor', 'controller', 'optimizer', 'service', 'qc'],
  splitSize: 75
};

export function commonExperimentsViewReducer(state: ICommonExperimentsViewState = commonExperimentsInitialState, action: any): ICommonExperimentsViewState {
  switch (action.type) {
    case actions.RESET_EXPERIMENTS:
      return {...state, experiments: [], selectedExperiment: null};
    case  actions.SET_SHOW_ALL_SELECTED_IS_ACTIVE:
      return {...state, showAllSelectedIsActive: action.payload, globalFilter: commonExperimentsInitialState.globalFilter, tableFilters: commonExperimentsInitialState.tableFilters};
    case actions.ADD_MANY_EXPERIMENTS:
      return {...state, experiments: state.experiments.concat(action.payload)};
    case actions.REMOVE_MANY_EXPERIMENTS:
      return {...state, experiments: state.experiments.filter(exp => !action.payload.includes(exp.id))};
    case actions.UPDATE_ONE_EXPERIMENTS: {
      const payload = (action as actions.UpdateExperiment).payload;
      const newState = {
        ...state, experiments:
          state.experiments.map(ex => ex.id === payload.id ? {...ex, ...payload.changes} : ex)
      };
      if (state.selectedExperiment && state.selectedExperiment.id === payload.id) {
        newState.selectedExperiment = {...state.selectedExperiment, ...payload.changes};
      }
      return newState;
    }
    case actions.SET_EXPERIMENTS:
      return {...state, experiments: action.payload};
    case setExperimentInPlace.type:
      return {...state, experiments: state.experiments.map(currExp => action.experiments.find(newExp => newExp.id === currExp.id))};
    case actions.SET_NO_MORE_EXPERIMENTS:
      return {...state, noMoreExperiment: action.payload};
    case actions.SET_NEXT_PAGE:
      return {...state, page: action.payload};
    case actions.SET_SELECTED_EXPERIMENT:
      return {...state, selectedExperiment: action.payload};
    case actions.SET_SELECTED_EXPERIMENTS:
      return {...state, selectedExperiments: action.payload};
    case actions.SET_VIEW_MODE:
      return {...state, viewMode: action.payload};
    case actions.GLOBAL_FILTER_CHANGED:
      return {...state, globalFilter: action.payload, showAllSelectedIsActive: false};
    case actions.resetGlobalFilter.type:
      return {...state, globalFilter: ''};
    case actions.TABLE_SORT_CHANGED:
      return {...state, tableSortOrder: action.payload.sortOrder, tableSortField: action.payload.colId};
    case actions.RESET_SORT_ORDER:
      return {
        ...state, tableSortOrder: commonExperimentsInitialState.tableSortOrder,
        tableSortField          : commonExperimentsInitialState.tableSortField
      };
    case  actions.TOGGLE_COL_HIDDEN:
      return {...state, hiddenTableCols: {...state.hiddenTableCols, [action.payload]: !state.hiddenTableCols[action.payload]}};
    case  actions.setHiddenColumns.type: {
      const visibleColumns = ['selected'].concat(action['visibleColumns']) as string[];
      return {
        ...state, hiddenTableCols: {
          ...state.tableCols
            .filter(col => !visibleColumns.includes(col.id))
            .reduce((obj: object, col) => ({...obj, [col.id]: true}), {})
        }
      };
    }
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
    case actions.setTableFilters.type:
      return {
        ...state, tableFilters: {
          ...action['filters'].reduce((obj: object, filter: TableFilter) => {
            obj[filter.col] = {value: filter.value, machMode: filter.filterMatchMode};
            return obj;
          }, {})
        }
      };
    case actions.setExtraColumns.type:
      return {...state, metricsCols: action['columns']};
    case actions.ADD_COL:
      return {...state, metricsCols: [...state.metricsCols, action.payload.col]};
    case actions.REMOVE_COL:
      return {
        ...state,
        metricsCols   : [...state.metricsCols.filter(tableCol => !(tableCol.id === action.payload.col.id && tableCol.projectId === action.payload.col.projectId))],
        tableSortField: action.payload.col.id === state.tableSortField ? null : state.tableSortField
      };

    case actions.setUsers.type:
      return {...state, users: action.users};
    case actions.setProjectsTypes.type:
      return {...state, types: action.types};
    case actions.CLEAR_HYPER_PARAMS_COLS:
      return {
        ...state,
        metricsCols   : [...state.metricsCols.filter(tableCol => !(tableCol.id.startsWith('execution.parameters') && tableCol.projectId === action.payload.projectId))],
        tableSortField: state.tableSortField.startsWith('execution.parameters') ? null : state.tableSortField
      };
    case actions.SET_CUSTOM_METRICS:
      return {...state, metricVariants: action.payload.metrics, metricsLoading: false};
    case actions.setColsOrderForProject.type:
      return {...state, colsOrder: {...state.colsOrder, [action.project]: action.cols}};
    case actions.SET_CUSTOM_HYPER_PARAMS:
      return {...state, hyperParams: action.payload.params, metricsLoading: false};
    case actions.GET_CUSTOM_METRICS:
      return {...state, metricsLoading: true};
    case actions.GET_CUSTOM_HYPER_PARAMS:
      return {...state, metricsLoading: true};
      case actions.setSplitSize.type:
      return {...state, splitSize: action.splitSize};
    default:
      return state;
  }
}
