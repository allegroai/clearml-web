import {ITableExperiment} from '../shared/common-experiment-model.model';
import {INITIAL_EXPERIMENT_TABLE_COLS} from '../experiment.consts';
import {ISmCol, TABLE_SORT_ORDER} from '../../shared/ui-components/data/table/table.consts';
import {EXPERIMENTS_TABLE_COL_FIELDS} from '../../../features/experiments/shared/experiments.const';
import * as actions from '../actions/common-experiments-view.actions';
import {
  hyperParamSelectedInfoExperiments,
  setExperimentInPlace,
  setTableSort
} from '../actions/common-experiments-view.actions';
import {EXPERIMENTS_VIEW_MODES, ExperimentsViewModesEnum} from '../shared/common-experiments.const';
import {MetricVariantResult} from '../../../business-logic/model/projects/metricVariantResult';
import {TableFilter} from '../../shared/utils/tableParamEncode';
import {User} from '../../../business-logic/model/users/user';
import {ProjectsGetTaskParentsResponseParents} from '../../../business-logic/model/projects/projectsGetTaskParentsResponseParents';
import {ICommonSearchState} from '../../common-search/common-search.reducer';
import {SortMeta} from 'primeng/api';
import {CountAvailableAndIsDisableSelectedFiltered} from '../../shared/entity-page/items.utils';
import {SET_SELECTED_PROJECT} from '@common/core/actions/projects.actions';


export interface ICommonExperimentsViewState {
  tableCols: ISmCol[];
  colsOrder: { [Project: string]: string[] };
  hiddenTableCols: any;
  experiments: Array<ITableExperiment>;
  noMoreExperiment: boolean;
  selectedExperiment: ITableExperiment;
  selectedExperiments: Array<ITableExperiment>;
  selectedExperimentsDisableAvailable: Record<string, CountAvailableAndIsDisableSelectedFiltered>;
  selectedExperimentSource: string;
  experimentToken: string;
  viewMode: ExperimentsViewModesEnum;
  tableFilters: any;
  tableOrders: SortMeta[];
  page: number;
  globalFilter: ICommonSearchState['searchQuery'];
  showAllSelectedIsActive: boolean;
  metricsCols: ISmCol[];
  metricVariants: Array<MetricVariantResult>;
  hyperParams: Array<any>;
  hyperParamsOptions: Record<ISmCol['id'], string[]>;
  metricsLoading: boolean;
  users: User[];
  projectTags: string[];
  parents: ProjectsGetTaskParentsResponseParents[];
  activeParentsFilter: ProjectsGetTaskParentsResponseParents[];
  types: string[];
  splitSize: number;
}

export const commonExperimentsInitialState: ICommonExperimentsViewState = {
  tableCols: INITIAL_EXPERIMENT_TABLE_COLS,
  colsOrder: {},
  hiddenTableCols: {'comment': true, 'active_duration': true},
  experiments: [],
  noMoreExperiment: false,
  selectedExperiment: null,
  selectedExperiments: [],
  selectedExperimentsDisableAvailable: {},
  selectedExperimentSource: null,
  experimentToken: null,
  viewMode: EXPERIMENTS_VIEW_MODES.TABLE,
  tableFilters: null,
  tableOrders: [{field: EXPERIMENTS_TABLE_COL_FIELDS.LAST_UPDATE, order: TABLE_SORT_ORDER.DESC}],
  page: -1, // -1 so the "getNextExperiments" will send 0.
  globalFilter: null,
  showAllSelectedIsActive: false,
  metricsCols: [],
  metricVariants: [],
  hyperParams: [],
  hyperParamsOptions: {},
  metricsLoading: false,
  projectTags: [],
  users: [],
  parents: [],
  activeParentsFilter: [],
  types: [],
  splitSize: 75
};

export function commonExperimentsViewReducer(state: ICommonExperimentsViewState = commonExperimentsInitialState, action: any): ICommonExperimentsViewState {
  switch (action.type) {
    case actions.resetExperiments.type:
      return {
        ...state,
        experiments: commonExperimentsInitialState.experiments,
        selectedExperiment: commonExperimentsInitialState.selectedExperiment,
        metricVariants: commonExperimentsInitialState.metricVariants,
        showAllSelectedIsActive: commonExperimentsInitialState.showAllSelectedIsActive
      };
    case SET_SELECTED_PROJECT:
      return {...state, selectedExperiments: commonExperimentsInitialState.selectedExperiments};
    case  actions.SET_SHOW_ALL_SELECTED_IS_ACTIVE:
      return {
        ...state,
        showAllSelectedIsActive: action.payload,
        globalFilter: commonExperimentsInitialState.globalFilter,
        tableFilters: commonExperimentsInitialState.tableFilters
      };
    case actions.ADD_MANY_EXPERIMENTS:
      return {...state, experiments: state.experiments.concat(action.payload)};
    case actions.REMOVE_MANY_EXPERIMENTS:
      return {...state, experiments: state.experiments.filter(exp => !action.payload.includes(exp.id))};
    case actions.UPDATE_ONE_EXPERIMENTS: {
      const payload = (action as actions.UpdateExperiment).payload;
      return setExperimentsAndUpdateSelectedExperiments(state, payload);
    }
    case actions.updateManyExperiment.type: {
      const changeList = (action as ReturnType<typeof actions.updateManyExperiment>).changeList;
      return changeList.reduce((acc, change) => {
        acc = setExperimentsAndUpdateSelectedExperiments(acc, {id: change.id, changes: change.fields});
        return acc;
      }, state as ICommonExperimentsViewState);
    }
    case actions.SET_EXPERIMENTS:
      return {...state, experiments: action.payload};
    case setExperimentInPlace.type:
      return {
        ...state, experiments: state.experiments
          .map(currExp => action.experiments.find(newExp => newExp.id === currExp.id))
          .filter(e => e)
      };
    case actions.SET_NO_MORE_EXPERIMENTS:
      return {...state, noMoreExperiment: action.payload};
    case actions.SET_NEXT_PAGE:
      return {...state, page: action.payload};
    case actions.SET_SELECTED_EXPERIMENT:
      return {...state, selectedExperiment: action.payload};
    case actions.SET_SELECTED_EXPERIMENTS:
      return {...state, selectedExperiments: action.payload};
    case actions.setSelectedExperimentsDisableAvailable.type:
      return {...state, selectedExperimentsDisableAvailable: action.selectedExperimentsDisableAvailable};
    case actions.SET_VIEW_MODE:
      return {...state, viewMode: action.payload};
    case actions.globalFilterChanged.type:
      return {...state, globalFilter: action as ReturnType<typeof actions.globalFilterChanged>, showAllSelectedIsActive: false};
    case actions.resetGlobalFilter.type:
      return {...state, globalFilter: commonExperimentsInitialState.globalFilter};
    case setTableSort.type: {
      const colIds = state.tableCols.map(col => col.id).concat(state.metricsCols.map(col => col.id));
      const orders = (action as ReturnType<typeof setTableSort>).orders.filter(order => colIds.includes(order.field));
      return {...state, tableOrders: orders.length > 0 ? orders : commonExperimentsInitialState.tableOrders};
    }
    case actions.RESET_SORT_ORDER:
      return {
        ...state, tableOrders: commonExperimentsInitialState.tableOrders
      };
    case  actions.TOGGLE_COL_HIDDEN:
      return {
        ...state,
        hiddenTableCols: {...state.hiddenTableCols, [action.payload]: !state.hiddenTableCols[action.payload]}
      };
    case  actions.setHiddenColumns.type: {
      const visibleColumns = ['selected'].concat(action['visibleColumns']) as string[];
      return {
        ...state, hiddenTableCols: {
          ...state.hiddenTableCols,
          ...state.tableCols
            .filter(col => !visibleColumns.includes(col.id))
            .reduce((obj, col) => ({...obj, [col.id]: true}), {})
        }
      };
    }
    case actions.TABLE_FILTER_CHANGED: {
      const payload = (action as actions.TableFilterChanged).payload;
      return {
        ...state,
        activeParentsFilter: payload.col === EXPERIMENTS_TABLE_COL_FIELDS.PARENT ? payload.value.map(parentId => state.parents.find(parent => parent.id === parentId)).filter(p => !!p) : [],
        tableFilters: {
          ...state.tableFilters,
          [payload.col]: {value: payload.value, matchMode: payload.filterMatchMode}
        }
      };
    }
    case actions.setTableFilters.type:
      return {
        ...state, tableFilters: {
          ...action['filters'].reduce((obj, filter: TableFilter) => {
            obj[filter.col] = {value: filter.value, machMode: filter.filterMatchMode};
            return obj;
          }, {})
        }
      };
    case actions.setExtraColumns.type:
      return {...state, metricsCols: [...state.metricsCols.filter(tableCol => !(tableCol.projectId === action['projectId'])), ...action['columns']]};
    case actions.ADD_COL:
      return {...state, metricsCols: [...state.metricsCols, action.payload.col]};
    case actions.REMOVE_COL:
      return {
        ...state,
        metricsCols: [...state.metricsCols.filter(tableCol => !(tableCol.id === action.payload.col.id && tableCol.projectId === action.payload.col.projectId))],
        tableOrders: state.tableOrders.filter(order => order.field !== action.payload.col.id),
        colsOrder: {...state.colsOrder, [action.payload.col.projectId]: state.colsOrder[action.payload.col.projectId] ? state.colsOrder[action.payload.col.projectId].filter(colId => colId !== action.payload.col.id) : null}
      };

    case actions.setTags.type:
      return {...state, projectTags: action.tags};
    case actions.setUsers.type:
      return {...state, users: action.users};
    case actions.setParents.type:
      return {...state, parents: action.parents};
    case actions.setActiveParentsFilter.type:
      return {...state, activeParentsFilter: action.parents};
    case actions.setProjectsTypes.type:
      return {...state, types: action.types};
    case actions.CLEAR_HYPER_PARAMS_COLS:
      return {
        ...state,
        metricsCols: [...state.metricsCols.filter(tableCol => !(tableCol.id.startsWith('hyperparams') && tableCol.projectId === action.payload.projectId))],
        tableOrders: state.tableOrders.filter(order => order.field.startsWith('hyperparams'))
      };
    case actions.SET_CUSTOM_METRICS:
      return {...state, metricVariants: action.payload.metrics, metricsLoading: false};
    case actions.setColsOrderForProject.type:
      return {...state, colsOrder: {...state.colsOrder, [action.project]: action.cols}};
    case actions.SET_CUSTOM_HYPER_PARAMS:
      return {...state, hyperParams: action.payload.params, metricsLoading: false};
    case hyperParamSelectedInfoExperiments.type:
      return {...state, hyperParamsOptions: {...state.hyperParamsOptions, [action.col.id]: action.values}};
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

function setExperimentsAndUpdateSelectedExperiments(state: ICommonExperimentsViewState, payload): ICommonExperimentsViewState {
  return {
    ...state,
    experiments: state.experiments.map(ex => ex.id === payload.id ? {...ex, ...payload.changes} : ex),
    ...(state.selectedExperiment?.id === payload.id && {selectedExperiment: {...state.selectedExperiment, ...payload.changes}}),
    ...(state.selectedExperiments.find(ex => ex.id === payload.id) && {selectedExperiments: state.selectedExperiments.map(ex => ex.id === payload.id ? {...ex, ...payload.changes} : ex)})
  };
}
