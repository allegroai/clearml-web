import {ITableExperiment} from '../shared/common-experiment-model.model';
import {ISmCol} from '../../shared/ui-components/data/table/table.consts';
import * as actions from '../actions/common-experiments-view.actions';
import {MetricVariantResult} from '~/business-logic/model/projects/metricVariantResult';
import {TableFilter} from '../../shared/utils/tableParamEncode';
import {ProjectsGetTaskParentsResponseParents} from '~/business-logic/model/projects/projectsGetTaskParentsResponseParents';
import {SearchState} from '../../common-search/common-search.reducer';
import {SortMeta} from 'primeng/api';
import {CountAvailableAndIsDisableSelectedFiltered} from '../../shared/entity-page/items.utils';
import {setSelectedProject} from '@common/core/actions/projects.actions';
import {createReducer, on} from '@ngrx/store';
import {modelsInitialState} from '@common/models/reducers/models-view.reducer';
import {FilterMetadata} from 'primeng/api/filtermetadata';


export interface ExperimentsViewState {
  tableCols: ISmCol[];
  colsOrder: { [Project: string]: string[] };
  tableFilters: any;
  tempFilters: { [columnId: string]: FilterMetadata };
  projectColumnFilters: { [projectId: string]: { [columnId: string]: FilterMetadata } };
  projectColumnsSortOrder: { [projectId: string]: SortMeta[] };
  projectColumnsWidth: { [projectId: string]: { [colId: string]: number } };
  metricsCols: ISmCol[];
  hiddenTableCols: { [colName: string]: boolean };
  hiddenProjectTableCols: { [projectId: string]: { [colName: string]: boolean | undefined } };
  experiments: Array<ITableExperiment>;
  refreshList: boolean;
  noMoreExperiment: boolean;
  selectedExperiment: ITableExperiment;
  selectedExperiments: Array<ITableExperiment>;
  selectedExperimentsDisableAvailable: Record<string, CountAvailableAndIsDisableSelectedFiltered>;
  selectedExperimentSource: string;
  experimentToken: string;
  scrollId: string;
  globalFilter: SearchState['searchQuery'];
  showAllSelectedIsActive: boolean;
  metricVariants: Array<MetricVariantResult>;
  hyperParams: Array<any>;
  hyperParamsOptions: Record<ISmCol['id'], string[]>;
  metricsLoading: boolean;
  projectTags: string[];
  parents: ProjectsGetTaskParentsResponseParents[];
  activeParentsFilter: ProjectsGetTaskParentsResponseParents[];
  types: string[];
  splitSize: number;
  tableMode: 'info' | 'table';
}

export const experimentsViewInitialState: ExperimentsViewState = {
  tableCols: [],
  colsOrder: {},
  // eslint-disable-next-line @typescript-eslint/naming-convention
  hiddenTableCols: {comment: true, active_duration: true, id: true},
  hiddenProjectTableCols: {},
  experiments: null,
  refreshList: false,
  tableFilters: {},
  tempFilters: {},
  projectColumnFilters: {},
  projectColumnsSortOrder: {},
  projectColumnsWidth: {},
  noMoreExperiment: false,
  selectedExperiment: null,
  selectedExperiments: [],
  selectedExperimentsDisableAvailable: {},
  selectedExperimentSource: null,
  experimentToken: null,
  scrollId: null, // -1 so the "getNextExperiments" will send 0.
  globalFilter: null,
  showAllSelectedIsActive: false,
  metricsCols: [],
  metricVariants: [],
  hyperParams: [],
  hyperParamsOptions: {},
  metricsLoading: false,
  projectTags: [],
  parents: null,
  activeParentsFilter: [],
  types: [],
  splitSize: 70,
  tableMode: 'table',
};

const setExperimentsAndUpdateSelectedExperiments = (state: ExperimentsViewState, payload: {id: string; changes: Partial<ITableExperiment>}) => ({
  ...state,
  experiments: state.experiments?.map(ex => ex.id === payload.id ? {...ex, ...payload.changes} : ex) || null,
  ...(state.selectedExperiment?.id === payload.id && {selectedExperiment: {...state.selectedExperiment, ...payload.changes}}),
  ...(state.selectedExperiments.find(ex => ex.id === payload.id) && {selectedExperiments: state.selectedExperiments.map(ex => ex.id === payload.id ? {...ex, ...payload.changes} : ex)})
});

export const experimentsViewReducer = createReducer<ExperimentsViewState>(
  experimentsViewInitialState,
  on(actions.setTableCols, (state, action): ExperimentsViewState => ({...state, tableCols: action.cols})),
  on(actions.resetExperiments, (state): ExperimentsViewState => ({
    ...state,
    experiments: experimentsViewInitialState.experiments,
    selectedExperiment: experimentsViewInitialState.selectedExperiment,
    metricVariants: experimentsViewInitialState.metricVariants,
    showAllSelectedIsActive: experimentsViewInitialState.showAllSelectedIsActive
  })),
  on(setSelectedProject, (state): ExperimentsViewState => ({
    ...state,
    selectedExperiments: experimentsViewInitialState.selectedExperiments,
    metricVariants: experimentsViewInitialState.metricVariants,
    hyperParamsOptions: experimentsViewInitialState.hyperParamsOptions
  })),
  on(actions.showOnlySelected, (state, action): ExperimentsViewState => ({
    ...state,
    showAllSelectedIsActive: action.active,
    globalFilter: experimentsViewInitialState.globalFilter,
    tempFilters: state.projectColumnFilters[action.projectId] || {},
    ...(state.showAllSelectedIsActive && {
      projectColumnFilters: {
        ...state.projectColumnFilters,
        [action.projectId]: action.active ? modelsInitialState.tableFilters : state.tempFilters
      }})
  })),
  on(actions.addExperiments, (state, action): ExperimentsViewState => ({
    ...state,
    experiments: state.experiments?.concat(action.experiments) || null
  })),
  on(actions.removeExperiments, (state, action): ExperimentsViewState => ({
    ...state,
    experiments: state.experiments?.filter(exp => !action.experiments.includes(exp.id)) || null
  })),
  on(actions.updateExperiment, (state, action): ExperimentsViewState => setExperimentsAndUpdateSelectedExperiments(state, action)),
  on(actions.updateManyExperiment, (state, action): ExperimentsViewState =>
    action.changeList.reduce((acc, change) => {
      acc = setExperimentsAndUpdateSelectedExperiments(acc, {id: change.id, changes: change.fields});
      return acc;
    }, state as ExperimentsViewState)
  ),
  on(actions.setExperiments, (state, action): ExperimentsViewState => ({...state, experiments: action.experiments})),
  on(actions.setTableRefreshPending, (state, action): ExperimentsViewState => ({...state, refreshList: action.refresh})),
  on(actions.setExperimentInPlace, (state, action): ExperimentsViewState => ({
    ...state, experiments: state.experiments
      ?.map(currExp => action.experiments.find(newExp => newExp.id === currExp.id))
      .filter(e => e) || null
  })),
  on(actions.setNoMoreExperiments, (state, action): ExperimentsViewState => ({...state, noMoreExperiment: action.hasMore})),
  on(actions.setCurrentScrollId, (state, action): ExperimentsViewState => ({...state, scrollId: action.scrollId})),
  on(actions.setSelectedExperiment, (state, action): ExperimentsViewState => ({...state, selectedExperiment: action.experiment})),
  on(actions.setSelectedExperiments, (state, action): ExperimentsViewState => ({...state, selectedExperiments: action.experiments})),
  on(actions.setSelectedExperimentsDisableAvailable, (state, action): ExperimentsViewState =>
    ({...state, selectedExperimentsDisableAvailable: action.selectedExperimentsDisableAvailable})),
  on(actions.globalFilterChanged, (state, action): ExperimentsViewState =>
    ({
      ...state,
      globalFilter: action as ReturnType<typeof actions.globalFilterChanged>,
      showAllSelectedIsActive: false
    })),
  on(actions.resetGlobalFilter, (state): ExperimentsViewState => ({...state, globalFilter: experimentsViewInitialState.globalFilter})),
  on(actions.setTableSort, (state, action): ExperimentsViewState => {
    const colIds = state.tableCols.map(col => col.id).concat(state.metricsCols.map(col => col.id));
    let orders = action.orders.filter(order => colIds.includes(order.field));
    orders = orders.length > 0 ? orders : null;
    return {...state, projectColumnsSortOrder: {...state.projectColumnsSortOrder, [action.projectId]: orders}};
  }),
  on(actions.resetSortOrder, (state, action): ExperimentsViewState => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {[action.projectId]: remove, ...order} = state.projectColumnsSortOrder;
    return {...state, projectColumnsSortOrder: order};
  }),
  on(actions.setColumnWidth, (state, action): ExperimentsViewState => ({
    ...state,
    projectColumnsWidth: {
      ...state.projectColumnsWidth,
      [action.projectId]: {
        ...state.projectColumnsWidth[action.projectId],
        [action.columnId]: action.widthPx
      }
    }
  })),
  on(actions.toggleColHidden, (state, action): ExperimentsViewState => ({
    ...state,
    hiddenProjectTableCols: {
      ...state.hiddenProjectTableCols,
      [action.projectId]: {
        ...(state.hiddenProjectTableCols[action.projectId] || experimentsViewInitialState.hiddenTableCols),
        [action.columnId]: state.hiddenProjectTableCols?.[action.projectId]?.[action.columnId] ? undefined : true
      }
    }
  })),
  on(actions.setHiddenCols, (state, action): ExperimentsViewState => ({...state, hiddenTableCols: action.hiddenCols})),
  on(actions.setVisibleColumnsForProject, (state, action): ExperimentsViewState => {
    const visibleColumns = ['selected'].concat(action['visibleColumns']) as string[];
    return {
      ...state,
      hiddenProjectTableCols: {
        ...state.hiddenProjectTableCols,
        [action.projectId]: {...state.hiddenProjectTableCols[action.projectId],
          ...state.tableCols
            .filter(col => !visibleColumns.includes(col.id))
            .reduce((obj, col) => ({...obj, [col.id]: true}), {})
        }
      }
    };

  }),
  on(actions.setTableFilters, (state, action): ExperimentsViewState => ({
    ...state,
    projectColumnFilters: {
      ...state.projectColumnFilters,
      [action.projectId]: {
        ...action.filters.reduce((obj, filter: TableFilter) => {
          obj[filter.col] = {value: filter.value, matchMode: filter.filterMatchMode};
          return obj;
        }, {} as { [columnId: string]: { value: any; matchMode: string } })
      }
    }
  })),
  on(actions.setExtraColumns, (state, action): ExperimentsViewState =>
    ({
      ...state,
      metricsCols: [...state.metricsCols.filter(tableCol => !(tableCol.projectId === action['projectId'])), ...action['columns']]
    })),
  on(actions.addColumn, (state, action): ExperimentsViewState => ({...state, metricsCols: [...state.metricsCols, action.col]})),
  on(actions.removeCol, (state, action): ExperimentsViewState => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {[action.id]: removedCol, ...remainingColsWidth} = state.projectColumnsWidth[action.projectId] || {};
    return {
      ...state,
      metricsCols: [...state.metricsCols.filter(tableCol => !(tableCol.id === action.id && tableCol.projectId === action.projectId))],
      projectColumnsSortOrder: {
        ...state.projectColumnsSortOrder,
        [action.projectId]: state.projectColumnsSortOrder[action.projectId]?.filter(order => order.field !== action.id) || null
      },
      projectColumnsWidth: {...state.projectColumnsWidth, [action.projectId]: remainingColsWidth},
      colsOrder: {
        ...state.colsOrder,
        [action.projectId]: state.colsOrder[action.projectId] ? state.colsOrder[action.projectId].filter(colId => colId !== action.id) : null
      }
    };
  }),
  on(actions.setTags, (state, action): ExperimentsViewState => ({...state, projectTags: action.tags})),
  on(actions.addProjectsTag, (state, action): ExperimentsViewState => ({...state, projectTags: Array.from(new Set(state.projectTags.concat(action.tag))).sort()})),
  on(actions.setParents, (state, action): ExperimentsViewState => ({...state, parents: action.parents})),
  on(actions.resetTablesFilterParentsOptions, (state): ExperimentsViewState => ({...state, parents: null})),
  on(actions.setActiveParentsFilter, (state, action): ExperimentsViewState => ({...state, activeParentsFilter: action.parents})),
  on(actions.setProjectsTypes, (state, action): ExperimentsViewState => ({...state, types: action.types})),
  on(actions.clearHyperParamsCols, (state, action): ExperimentsViewState => ({
    ...state,
    metricsCols: [...state.metricsCols.filter(tableCol => !(tableCol.id.startsWith('hyperparams') && tableCol.projectId === action.projectId))],
    projectColumnsSortOrder: {
      ...state.projectColumnsSortOrder,
      [action.projectId]: state.projectColumnsSortOrder[action.projectId].filter(order => order.field.startsWith('hyperparams'))
    }
  })),
  on(actions.setCustomMetrics, (state, action): ExperimentsViewState =>
    ({...state, metricVariants: action.metrics, metricsLoading: false})),
  on(actions.setColsOrderForProject, (state, action): ExperimentsViewState =>
    ({...state, colsOrder: {...state.colsOrder, [action.project]: action.cols}})),
  on(actions.setCustomHyperParams, (state, action): ExperimentsViewState => ({...state, hyperParams: action.params, metricsLoading: false})),
  on(actions.hyperParamSelectedInfoExperiments, (state, action): ExperimentsViewState =>
    ({...state, hyperParamsOptions: {...state.hyperParamsOptions, [action.col.id]: action.values}})),
  on(actions.getCustomMetrics, (state): ExperimentsViewState => ({...state, metricsLoading: true})),
  on(actions.getCustomHyperParams, (state): ExperimentsViewState => ({...state, metricsLoading: true})),
  on(actions.setSplitSize, (state, action): ExperimentsViewState => ({...state, splitSize: action.splitSize})),
  on(actions.setTableMode, (state, action): ExperimentsViewState => ({...state, tableMode: action.mode})),
);
