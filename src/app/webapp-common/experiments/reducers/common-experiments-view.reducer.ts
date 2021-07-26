import {ITableExperiment} from '../shared/common-experiment-model.model';
import {INITIAL_EXPERIMENT_TABLE_COLS} from '../experiment.consts';
import {ISmCol, TABLE_SORT_ORDER} from '../../shared/ui-components/data/table/table.consts';
import {EXPERIMENTS_TABLE_COL_FIELDS} from '../../../features/experiments/shared/experiments.const';
import * as actions from '../actions/common-experiments-view.actions';
import {MetricVariantResult} from '../../../business-logic/model/projects/metricVariantResult';
import {TableFilter} from '../../shared/utils/tableParamEncode';
import {User} from '../../../business-logic/model/users/user';
import {ProjectsGetTaskParentsResponseParents} from '../../../business-logic/model/projects/projectsGetTaskParentsResponseParents';
import {ICommonSearchState} from '../../common-search/common-search.reducer';
import {SortMeta} from 'primeng/api';
import {CountAvailableAndIsDisableSelectedFiltered} from '../../shared/entity-page/items.utils';
import {setSelectedProject} from '@common/core/actions/projects.actions';
import {createReducer, on} from '@ngrx/store';
import {modelsInitialState} from '@common/models/reducers/models-view.reducer';


export interface ICommonExperimentsViewState {
  tableCols: ISmCol[];
  colsOrder: { [Project: string]: string[] };
  tableFilters: any;
  tempFilters: {[columnId: string]: {value: any; matchMode: string}};
  projectColumnFilters: {[projectId: string]: {[columnId: string]: {value: any; matchMode: string}}};
  tableOrders: SortMeta[];
  projectColumnsSortOrder: {[projectId: string]: SortMeta[]};
  projectColumnsWidth: {[projectId: string]: {[colId: string]: number}};
  metricsCols: ISmCol[];
  hiddenTableCols: {[colName: string]: boolean};
  hiddenProjectTableCols: {[projectId: string]: {[colName: string]: boolean | undefined}};
  experiments: Array<ITableExperiment>;
  noMoreExperiment: boolean;
  selectedExperiment: ITableExperiment;
  selectedExperiments: Array<ITableExperiment>;
  selectedExperimentsDisableAvailable: Record<string, CountAvailableAndIsDisableSelectedFiltered>;
  selectedExperimentSource: string;
  experimentToken: string;
  page: number;
  globalFilter: ICommonSearchState['searchQuery'];
  showAllSelectedIsActive: boolean;
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
  hiddenTableCols: {comment: true, active_duration: true},
  hiddenProjectTableCols: {},
  experiments: [],
  tableFilters: {},
  tempFilters: {},
  projectColumnFilters: {},
  tableOrders: [{field: EXPERIMENTS_TABLE_COL_FIELDS.LAST_UPDATE, order: TABLE_SORT_ORDER.DESC}],
  projectColumnsSortOrder: {},
  projectColumnsWidth: {},
  noMoreExperiment: false,
  selectedExperiment: null,
  selectedExperiments: [],
  selectedExperimentsDisableAvailable: {},
  selectedExperimentSource: null,
  experimentToken: null,
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

const setExperimentsAndUpdateSelectedExperiments = (state: ICommonExperimentsViewState, payload): ICommonExperimentsViewState => ({
  ...state,
  experiments: state.experiments.map(ex => ex.id === payload.id ? {...ex, ...payload.changes} : ex),
  ...(state.selectedExperiment?.id === payload.id && {selectedExperiment: {...state.selectedExperiment, ...payload.changes}}),
  ...(state.selectedExperiments.find(ex => ex.id === payload.id) && {selectedExperiments: state.selectedExperiments.map(ex => ex.id === payload.id ? {...ex, ...payload.changes} : ex)})
});

export const commonExperimentsViewReducer = createReducer(
  commonExperimentsInitialState,
  on(actions.resetExperiments, state => ({
    ...state,
    experiments: commonExperimentsInitialState.experiments,
    selectedExperiment: commonExperimentsInitialState.selectedExperiment,
    metricVariants: commonExperimentsInitialState.metricVariants,
    showAllSelectedIsActive: commonExperimentsInitialState.showAllSelectedIsActive
  })),
  on(setSelectedProject, state => ({
    ...state,
    selectedExperiments: commonExperimentsInitialState.selectedExperiments,
    metricVariants: commonExperimentsInitialState.metricVariants,
    hyperParamsOptions: commonExperimentsInitialState.hyperParamsOptions
  })),
  on(actions.showOnlySelected, (state, action) => ({
    ...state,
    showAllSelectedIsActive: action.active,
    globalFilter: commonExperimentsInitialState.globalFilter,
    tempFilters: state.projectColumnFilters[action.projectId] || {},
    projectColumnFilters: {
      ...state.projectColumnFilters,
      [action.projectId]: action.active ? modelsInitialState.tableFilters : state.tempFilters
    }
  })),
  on(actions.addExperiments, (state, action) => ({...state, experiments: state.experiments.concat(action.experiments)})),
  on(actions.removeExperiments, (state, action) => ({...state, experiments: state.experiments.filter(exp => !action.experiments.includes(exp.id))})),
  on(actions.updateExperiment, (state, action) => setExperimentsAndUpdateSelectedExperiments(state, action)),
  on(actions.updateManyExperiment, (state, action) =>
    action.changeList.reduce((acc, change) => {
      acc = setExperimentsAndUpdateSelectedExperiments(acc, {id: change.id, changes: change.fields});
      return acc;
    }, state as ICommonExperimentsViewState)
  ),
  on(actions.setExperiments, (state, action) => ({...state, experiments: action.experiments})),
  on(actions.setExperimentInPlace, (state, action) => ({
    ...state, experiments: state.experiments
      .map(currExp => action.experiments.find(newExp => newExp.id === currExp.id))
      .filter(e => e)
  })),
  on(actions.setNoMoreExperiments, (state, action) => ({...state, noMoreExperiment: action.payload})),
  on(actions.setCurrentPage, (state, action) => ({...state, page: action.page})),
  on(actions.setSelectedExperiment, (state, action) => ({...state, selectedExperiment: action.experiment})),
  on(actions.setSelectedExperiments, (state, action) => ({...state, selectedExperiments: action.experiments})),
  on(actions.setSelectedExperimentsDisableAvailable, (state, action) =>
    ({...state, selectedExperimentsDisableAvailable: action.selectedExperimentsDisableAvailable})),
  on(actions.globalFilterChanged, (state, action) =>
    ({...state, globalFilter: action as ReturnType<typeof actions.globalFilterChanged>, showAllSelectedIsActive: false})),
  on(actions.resetGlobalFilter, state => ({...state, globalFilter: commonExperimentsInitialState.globalFilter})),
  on(actions.setTableSort, (state, action) => {
    const colIds = state.tableCols.map(col => col.id).concat(state.metricsCols.map(col => col.id));
    let orders = action.orders.filter(order => colIds.includes(order.field));
    orders = orders.length > 0 ? orders : commonExperimentsInitialState.tableOrders;
    return { ...state, projectColumnsSortOrder: {...state.projectColumnsSortOrder, [action.projectId]: orders} };
  }),
  on(actions.resetSortOrder, (state, action) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {[action.projectId]: remove, ...order} = state.projectColumnsSortOrder;
    return {...state, projectColumnsSortOrder: order};
  }),
  on(actions.setColumnWidth, (state, action) => ({
    ...state,
    projectColumnsWidth: {
      ...state.projectColumnsWidth,
      [action.projectId]: {
        ...state.projectColumnsWidth[action.projectId],
        [action.columnId]: action.widthPx
      }
    }
  })),
  on(actions.toggleColHidden, (state, action) => ({
    ...state,
    hiddenProjectTableCols: {
      ...state.hiddenProjectTableCols,
      [action.projectId]: {
        ...(state.hiddenProjectTableCols[action.projectId] || commonExperimentsInitialState.hiddenTableCols),
        [action.columnId]: state.hiddenProjectTableCols?.[action.projectId]?.[action.columnId] ? undefined : true
      }
    }
  })),
  on(actions.setHiddenColumns, (state, action) => {
    const visibleColumns = ['selected'].concat(action['visibleColumns']) as string[];
    return {
      ...state,
      hiddenProjectTableCols: {
        ...state.hiddenProjectTableCols,
        [action.projectId]: {
          ...state.tableCols
            .filter(col => !visibleColumns.includes(col.id))
            .reduce((obj, col) => ({...obj, [col.id]: true}), {})
        }
      }
    };
  }),
  on(actions.tableFilterChanged, (state, action) => ({
    ...state,
    activeParentsFilter: action.filter.col === EXPERIMENTS_TABLE_COL_FIELDS.PARENT ?
      action.filter.value.map(parentId => state.parents.find(parent => parent.id === parentId)).filter(p => !!p) : [],
    projectColumnFilters: {
      ...state.projectColumnFilters,
      [action.projectId]: {
        ...state.projectColumnFilters[action.projectId],
        [action.filter.col]: {value: action.filter.value, matchMode: action.filter.filterMatchMode}
      }
    }
  })),
  on(actions.setTableFilters, (state, action) => ({
    ...state,
    projectColumnFilters: {
      ...state.projectColumnFilters,
      [action.projectId]: {
        ...action.filters.reduce((obj, filter: TableFilter) => {
          obj[filter.col] = {value: filter.value, matchMode: filter.filterMatchMode};
          return obj;
        }, {} as {[columnId: string]: {value: any; matchMode: string}})
      }
    }
  })),
  on(actions.setExtraColumns, (state, action) =>
    ({...state, metricsCols: [...state.metricsCols.filter(tableCol => !(tableCol.projectId === action['projectId'])), ...action['columns']]})),
  on(actions.addColumn, (state, action) => ({...state, metricsCols: [...state.metricsCols, action.col]})),
  on(actions.removeCol, (state, action) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {[action.id]: removedCol, ...remainingColsWidth} = state.projectColumnsWidth[action.projectId] || {};
      return {
        ...state,
        metricsCols: [...state.metricsCols.filter(tableCol => !(tableCol.id === action.id && tableCol.projectId === action.projectId))],
        projectColumnsSortOrder: {
          ...state.projectColumnsSortOrder,
          [action.projectId]: state.projectColumnsSortOrder[action.projectId].filter(order => order.field !== action.id)
        },
        projectColumnsWidth: {...state.projectColumnsWidth, [action.projectId]: remainingColsWidth},
        colsOrder: {...state.colsOrder, [action.projectId]: state.colsOrder[action.projectId] ? state.colsOrder[action.projectId].filter(colId => colId !== action.id) : null}
      };
    }),
  on(actions.setTags, (state, action) => ({...state, projectTags: action.tags})),
  on(actions.setUsers, (state, action) => ({...state, users: action.users})),
  on(actions.setParents, (state, action) => ({...state, parents: action.parents})),
  on(actions.setActiveParentsFilter, (state, action) => ({...state, activeParentsFilter: action.parents})),
  on(actions.setProjectsTypes, (state, action) => ({...state, types: action.types})),
  on(actions.clearHyperParamsCols, (state, action) => ({
    ...state,
    metricsCols: [...state.metricsCols.filter(tableCol => !(tableCol.id.startsWith('hyperparams') && tableCol.projectId === action.projectId))],
    projectColumnsSortOrder: {
      ...state.projectColumnsSortOrder,
      [action.projectId]: state.projectColumnsSortOrder[action.projectId].filter(order => order.field.startsWith('hyperparams'))
    }
  })),
  on(actions.setCustomMetrics, (state, action) =>
    ({...state, metricVariants: action.metrics, metricsLoading: false})),
  on(actions.setColsOrderForProject, (state, action) =>
    ({...state, colsOrder: {...state.colsOrder, [action.project]: action.cols}})),
  on(actions.setCustomHyperParams, (state, action) => ({...state, hyperParams: action.params, metricsLoading: false})),
  on(actions.hyperParamSelectedInfoExperiments, (state, action) =>
    ({...state, hyperParamsOptions: {...state.hyperParamsOptions, [action.col.id]: action.values}})),
  on(actions.getCustomMetrics, state => ({...state, metricsLoading: true})),
  on(actions.getCustomHyperParams, state => ({...state, metricsLoading: true})),
  on(actions.setSplitSize, (state, action) => ({...state, splitSize: action.splitSize})),
);
