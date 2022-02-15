import {
  compareAddDialogSetTableSort, compareAddTableClearAllFilters, compareAddTableFilterChanged, compareAddTableFilterInit,
  resetSelectCompareHeader,
  setExperimentsUpdateTime,
  setHideIdenticalFields,
  setNavigationPreferences,
  setRefreshing,
  setSearchExperimentsForCompareResults,
  setShowSearchExperimentsForCompare,
  toggleShowScalarOptions
} from '../actions/compare-header.actions';
import {createReducer, on} from '@ngrx/store';
import {Params} from '@angular/router';
import {ITableExperiment} from '../../experiments/shared/common-experiment-model.model';
import {commonExperimentsInitialState} from '../../experiments/reducers/common-experiments-view.reducer';
import {SortMeta} from 'primeng/api';

export interface CompareHeaderState {
  searchResultsExperiments: ITableExperiment[];
  searchTerm: string;
  showSearch: boolean;
  hideIdenticalRows: boolean;
  viewMode: string;
  showScalarOptions: boolean;
  refreshing: boolean;
  autoRefresh: boolean;
  navigationPreferences: Params;
  experimentsUpdateTime: { [key: string]: Date };
  projectColumnsSortOrder: { [projectId: string]: SortMeta[] };
  projectColumnFilters: { [projectId: string]: { [columnId: string]: { value: any; matchMode: string } } };
};


export const initialState: CompareHeaderState = {
  searchResultsExperiments: [],
  searchTerm: null,
  showSearch: false,
  hideIdenticalRows: false,
  viewMode: 'values',
  showScalarOptions: false,
  refreshing: false,
  autoRefresh: false,
  navigationPreferences: {},
  experimentsUpdateTime: {},
  projectColumnsSortOrder: {},
  projectColumnFilters: {},
};

const _compareHeader = createReducer(initialState,
  on(setHideIdenticalFields, (state: CompareHeaderState, {payload}) => ({...state, hideIdenticalRows: payload})),
  on(setSearchExperimentsForCompareResults, (state: CompareHeaderState, {payload}) => ({
    ...state,
    searchResultsExperiments: payload
  })),
  on(setExperimentsUpdateTime, (state: CompareHeaderState, {payload}) => ({...state, experimentsUpdateTime: payload})),
  on(setShowSearchExperimentsForCompare, (state: CompareHeaderState, {payload}) => ({...state, showSearch: payload})),
  on(toggleShowScalarOptions, (state: CompareHeaderState) => ({...state, showScalarOptions: !state.showScalarOptions})),
  on(setRefreshing, (state: CompareHeaderState, {payload, autoRefresh}) => ({
    ...state,
    refreshing: payload,
    autoRefresh
  })),
  on(setNavigationPreferences, (state: CompareHeaderState, {navigationPreferences}) => ({
    ...state,
    navigationPreferences: {...state.navigationPreferences, ...navigationPreferences}
  })),
  on(resetSelectCompareHeader, () => ({...initialState})),
  on(compareAddDialogSetTableSort, (state, action) => {
    let orders = action.orders.filter(order => action.colIds.includes(order.field));
    orders = orders.length > 0 ? orders : commonExperimentsInitialState.tableOrders;
    return {...state, projectColumnsSortOrder: {...state.projectColumnsSortOrder, [action.projectId]: orders}};
  }),
  on(compareAddTableFilterInit, (state, action) => ({
    ...state,
    projectColumnFilters: {
      ...state.projectColumnFilters,
      [action.projectId]: {['project.name']: {value: [action.projectId], matchMode: undefined}}
    }})),
  on(compareAddTableClearAllFilters, (state, action) => ({
    ...state,
    projectColumnFilters: {
      ...state.projectColumnFilters,
      [action.projectId]: {}
    }
  })),
  on(compareAddTableFilterChanged, (state, action) => ({
    ...state,
    // activeParentsFilter: action.filter.col === EXPERIMENTS_TABLE_COL_FIELDS.PARENT ?
    //   action.filter.value.map(parentId => state.parents.find(parent => parent.id === parentId)).filter(p => !!p) : [],
    projectColumnFilters: {
      ...state.projectColumnFilters,
      [action.projectId]: {
        ...state.projectColumnFilters[action.projectId],
        [action.filter.col]: {value: action.filter.value, matchMode: action.filter.filterMatchMode}
      }
    }
  })),
);

export function compareHeader(state, action) {
  return _compareHeader(state, action);
}
