import {Task} from '../../../business-logic/model/tasks/models';
import {resetSelectCompareHeader, searchExperimentsForCompare, setExperimentsUpdateTime, setHideIdenticalFields, setNavigationPreferences, setRefreshing, setSearchExperimentsForCompareResults, setShowSearchExperimentsForCompare, toggleShowScalarOptions} from '../actions/compare-header.actions';
import {createReducer, on} from '@ngrx/store';
import {Params} from '@angular/router';

export interface CompareHeaderState {
  searchResultsExperiments: Array<Task>;
  searchTerm: string;
  showSearch: boolean;
  hideIdenticalRows: boolean;
  viewMode: string;
  showScalarOptions: boolean;
  refreshing: boolean;
  autoRefresh: boolean;
  navigationPreferences: Params;
  experimentsUpdateTime: { [key: string]: Date};
};


export const initialState: CompareHeaderState = {
  searchResultsExperiments: null,
  searchTerm              : null,
  showSearch              : false,
  hideIdenticalRows       : false,
  viewMode                : 'values',
  showScalarOptions       : false,
  refreshing              : false,
  autoRefresh             : false,
  navigationPreferences   : {},
  experimentsUpdateTime   : {}
};

const _compareHeader = createReducer(initialState,
  on(setHideIdenticalFields, (state: CompareHeaderState, {payload}) => ({...state, hideIdenticalRows: payload})),
  on(setSearchExperimentsForCompareResults, (state: CompareHeaderState, {payload}) => ({...state, searchResultsExperiments: payload})),
  on(setExperimentsUpdateTime, (state: CompareHeaderState, {payload}) => ({...state, experimentsUpdateTime: payload})),
  on(setShowSearchExperimentsForCompare, (state: CompareHeaderState, {payload}) => ({...state, showSearch: payload})),
  on(searchExperimentsForCompare, (state: CompareHeaderState, {payload}) => ({...state, searchTerm: payload})),
  on(toggleShowScalarOptions, (state: CompareHeaderState) => ({...state, showScalarOptions: !state.showScalarOptions})),
  on(setRefreshing, (state: CompareHeaderState, {payload, autoRefresh}) => ({...state, refreshing: payload, autoRefresh})),
  on(setNavigationPreferences, (state: CompareHeaderState, {navigationPreferences}) => ({...state, navigationPreferences: {...state.navigationPreferences, ...navigationPreferences}})),
  on(resetSelectCompareHeader, () => ({...initialState})),
);

export function compareHeader(state, action) {
  return _compareHeader(state, action);
}
