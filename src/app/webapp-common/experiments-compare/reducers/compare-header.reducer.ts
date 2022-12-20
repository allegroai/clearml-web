import {
  compareAddDialogSetTableSort,
  compareAddTableClearAllFilters,
  compareAddTableFilterChanged,
  compareAddTableFilterInit,
  resetSelectCompareHeader,
  setExperimentsUpdateTime,
  setHideIdenticalFields,
  setNavigationPreferences,
  setSearchExperimentsForCompareResults,
  setShowSearchExperimentsForCompare,
  toggleShowScalarOptions
} from '../actions/compare-header.actions';
import {createReducer, on} from '@ngrx/store';
import {Params} from '@angular/router';
import {ITableExperiment} from '../../experiments/shared/common-experiment-model.model';
import {SortMeta} from 'primeng/api';
import {FilterMetadata} from 'primeng/api/filtermetadata';

export interface CompareHeaderState {
  searchResultsExperiments: ITableExperiment[];
  searchTerm: string;
  showSearch: boolean;
  hideIdenticalRows: boolean;
  viewMode: string;
  showScalarOptions: boolean;
  autoRefresh: boolean;
  navigationPreferences: Params;
  experimentsUpdateTime: { [key: string]: Date };
  projectColumnsSortOrder: { [projectId: string]: SortMeta[] };
  projectColumnFilters: { [projectId: string]: { [columnId: string]: FilterMetadata } };
}


export const initialState: CompareHeaderState = {
  searchResultsExperiments: [],
  searchTerm: null,
  showSearch: false,
  hideIdenticalRows: false,
  viewMode: 'values',
  showScalarOptions: false,
  autoRefresh: false,
  navigationPreferences: {},
  experimentsUpdateTime: {},
  projectColumnsSortOrder: {},
  projectColumnFilters: {},
};

export const compareHeader = createReducer(
  initialState,
  on(setHideIdenticalFields, (state: CompareHeaderState, {payload}) => ({...state, hideIdenticalRows: payload})),
  on(setSearchExperimentsForCompareResults, (state: CompareHeaderState, {payload}) => ({
    ...state,
    searchResultsExperiments: payload
  })),
  on(setExperimentsUpdateTime, (state: CompareHeaderState, {payload}) => ({...state, experimentsUpdateTime: payload})),
  on(setShowSearchExperimentsForCompare, (state: CompareHeaderState, {payload}) => ({...state, showSearch: payload})),
  on(toggleShowScalarOptions, (state: CompareHeaderState) => ({...state, showScalarOptions: !state.showScalarOptions})),
  on(setNavigationPreferences, (state: CompareHeaderState, {navigationPreferences}) => ({
    ...state,
    navigationPreferences: {...state.navigationPreferences, ...navigationPreferences}
  })),
  on(resetSelectCompareHeader, () => ({...initialState})),
  on(compareAddDialogSetTableSort, (state, action) => {
    let orders = action.orders.filter(order => action.colIds.includes(order.field));
    orders = orders.length > 0 ? orders : null;
    return {...state, projectColumnsSortOrder: {...state.projectColumnsSortOrder, [action.projectId]: orders}};
  }),
  on(compareAddTableFilterInit, (state, action) => ({
    ...state,
    projectColumnFilters: {
      ...state.projectColumnFilters,
      [action.projectId]: {['project.name']: {value: [action.projectId], matchMode: undefined}}
    }
  })),
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
