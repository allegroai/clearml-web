import {createReducer, on} from '@ngrx/store';
import {ISmCol, TABLE_SORT_ORDER} from '../../shared/ui-components/data/table/table.consts';
import * as actions from '../actions/models-view.actions';
import {TableModel, SelectedModel} from '../shared/models.model';
import {MODELS_TABLE_COL_FIELDS} from '../shared/models.const';
import {TableFilter} from '../../shared/utils/tableParamEncode';
import {SearchState} from '../../common-search/common-search.reducer';
import {SortMeta} from 'primeng/api';
import {CountAvailableAndIsDisableSelectedFiltered} from '@common/shared/entity-page/items.utils';
import {setSelectedProject} from '@common/core/actions/projects.actions';

export interface IModelsViewState {
  splitSize: number;
  models: Array<any>;
  tableFilters: any;
  tempFilters: { [columnId: string]: { value: any; matchMode: string } };
  projectColumnFilters: { [projectId: string]: { [columnId: string]: { value: any; matchMode: string } } };
  colsOrder: { [Project: string]: string[] };
  tableSortFields: SortMeta[];
  projectColumnsSortOrder: { [projectId: string]: SortMeta[] };
  projectColumnsWidth: { [projectId: string]: { [colId: string]: number } };
  hiddenTableCols: { [colName: string]: boolean };
  hiddenProjectTableCols: { [projectId: string]: { [colName: string]: boolean | undefined } };
  selectedModels: TableModel[]; // TODO: declare type.
  selectedModel: SelectedModel;
  noMoreModels: boolean;
  selectedModelSource: string;
  modelToken: string;
  scrollId: string;
  globalFilter: SearchState['searchQuery'];
  showAllSelectedIsActive: boolean;
  frameworks: string[];
  projectTags: string[];
  projectMetadataKeys: string[];
  metadataCols: ISmCol[];
  metadataColsOptions: Record<ISmCol['id'], string[]>;
  selectedModelsDisableAvailable: Record<string, CountAvailableAndIsDisableSelectedFiltered>;
  tableMode: 'info' | 'table';
}

export const modelsInitialState: IModelsViewState = {
  splitSize: 65,
  models: null,
  frameworks: [],
  hiddenTableCols: {comment: true, id: true},
  hiddenProjectTableCols: {},
  tableFilters: {},
  tempFilters: {},
  projectColumnFilters: {},
  tableSortFields: [{field: MODELS_TABLE_COL_FIELDS.CREATED, order: TABLE_SORT_ORDER.DESC}],
  projectColumnsSortOrder: {},
  projectColumnsWidth: {},
  projectMetadataKeys: [],
  metadataCols: [],
  colsOrder: {},
  selectedModels: [],
  selectedModelsDisableAvailable: {},
  selectedModel: null,
  noMoreModels: false,
  selectedModelSource: null,
  modelToken: null,
  scrollId: null,
  globalFilter: null,
  showAllSelectedIsActive: false,
  metadataColsOptions: {},
  projectTags: [],
  tableMode: 'table',
};

export const modelsViewReducer = createReducer(
  modelsInitialState,
  on(actions.resetState, (state) => ({
    ...state,
    models: modelsInitialState.models,
    selectedModel: modelsInitialState.selectedModel,
  })),
  on(setSelectedProject, (state) => ({...state, selectedModels: modelsInitialState.selectedModels})),
  on(actions.addModels, (state, action) => ({...state, models: state.models?.concat(action.models) || null})),
  on(actions.removeModels, (state, action) => ({
    ...state,
    models: state.models?.filter(exp => !action.modelIds.includes(exp.id)) || null
  })),
  on(actions.showSelectedOnly, (state, action) => ({
    ...state,
    showAllSelectedIsActive: action.active,
    globalFilter: modelsInitialState.globalFilter,
    tempFilters: state.projectColumnFilters[action.projectId] || {},
    projectColumnFilters: {
      ...state.projectColumnFilters,
      [action.projectId]: action.active ? modelsInitialState.tableFilters : state.tempFilters
    }
  })),
  on(actions.updateModel, (state, action) => {
    const newState = {
      ...state, models:
        state.models?.map(ex => ex.id === action.id ? {...ex, ...action.changes} : ex)
    };
    if (state.selectedModel?.id === action.id) {
      newState.selectedModel = {...state.selectedModel, ...action.changes};
    }
    if (state.selectedModels.find(ex => ex.id === action.id)) {
      newState.selectedModels = state.selectedModels.map(ex => ex.id === action.id ? {...ex, ...action.changes} : ex);
    }
    return newState;
  }),
  on(actions.setModels, (state, action) => ({...state, models: action.models})),
  on(actions.setModelsInPlace, (state, action) =>
    ({...state, models: state.models?.map(currModel => action.models?.find(newModel => newModel.id === currModel.id)) || null
    })),
  on(actions.setNoMoreModels, (state, action) => ({...state, noMoreModels: action.payload})),
  on(actions.setCurrentScrollId, (state, action) => ({...state, scrollId: action.scrollId})),
  on(actions.setSelectedModels, (state, action) => ({
    ...state,
    selectedModels: action.models as unknown as TableModel[]
  })),
  on(actions.setSelectedModelsDisableAvailable, (state, action) =>
    ({...state, selectedModelsDisableAvailable: action.selectedModelsDisableAvailable})),
  on(actions.setSelectedModel, (state, action) => ({...state, selectedModel: action.model})),
  on(actions.globalFilterChanged, (state, action) =>
    ({...state, globalFilter: action as ReturnType<typeof actions.globalFilterChanged>})),
  on(actions.resetGlobalFilter, (state) => ({...state, globalFilter: modelsInitialState.globalFilter})),
  on(actions.toggleColHidden, (state, action) => ({
    ...state,
    hiddenProjectTableCols: {
      ...state.hiddenProjectTableCols,
      [action.projectId]: {
        ...(state.hiddenProjectTableCols[action.projectId] || modelsInitialState.hiddenTableCols),
        [action.columnId]: state.hiddenProjectTableCols?.[action.projectId]?.[action.columnId] ? undefined : true
      }
    }
  })),
  on(actions.setHiddenCols, (state, action) => ({...state, hiddenTableCols: action.hiddenCols})),
  on(actions.addColumn, (state, action) => ({...state, metadataCols: [...state.metadataCols, action.col]})),
  on(actions.removeCol, (state, action) => ({
    ...state,
    metadataCols: [...state.metadataCols.filter(tableCol => !(tableCol.key === action.id && tableCol.projectId === action.projectId))],
    colsOrder: {
      ...state.colsOrder,
      [action.projectId]: state.colsOrder[action.projectId] ? state.colsOrder[action.projectId].filter(colId => colId !== action.id) : null
    }
  })),
  on(actions.setExtraColumns, (state, action) =>
    ({
      ...state,
      metadataCols: [...state.metadataCols.filter(tableCol => !(tableCol.projectId === action['projectId'])), ...action['columns']]
    })),
  on(actions.setFrameworks, (state, action) => ({...state, frameworks: action.frameworks})),
  on(actions.setTags, (state, action) => ({...state, projectTags: action.tags})),
  on(actions.setMetadataKeys, (state, action) => ({...state, projectMetadataKeys: action.keys})),
  on(actions.setMetadataColValuesOptions, (state, action) =>
    ({...state, metadataColsOptions: {...state.metadataColsOptions, [action.col.id]: action.values}})),
  on(actions.setTableSort, (state, action) => ({
    ...state,
    projectColumnsSortOrder: {
      ...state.projectColumnsSortOrder,
      [action.projectId]: action.orders
    }
  })),
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
  on(actions.setColsOrderForProject, (state, action) =>
    ({...state, colsOrder: {...state.colsOrder, [action.project]: action.cols}})),
  on(actions.setTableFilters, (state, action) => ({
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
  on(actions.setSplitSize, (state, action) => ({...state, splitSize: action.splitSize})),
  on(actions.setTableMode, (state, action) => ({...state, tableMode: action.mode})),
);
