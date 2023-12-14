import {createFeatureSelector, createReducer, createSelector, on} from '@ngrx/store';
import {initSearch, resetSearch, setSearching, setSearchQuery} from './common-search.actions';


export interface SearchState {
  isSearching: boolean;
  searchQuery: {query: string; regExp?: boolean; original?: string};
  placeholder: string;
  active: boolean;
}

// Todo remove selectedProjectId
const searchInitState: SearchState = {
  isSearching: false,
  searchQuery: null,
  placeholder: null,
  active     : false
};

export const searchReducer = createReducer(
  searchInitState,
  on(setSearching, (state, action) => ({...state, isSearching: action.payload})),
  on(setSearchQuery, (state, action) => ({...state, searchQuery: action})),
  on(initSearch, (state, action) => ({...searchInitState, placeholder: action.payload || 'Search'})),
  on(resetSearch, () => ({...searchInitState, placeholder: 'Search'})),
);

export const selectCommonSearch = createFeatureSelector<SearchState>('commonSearch');
export const selectIsSearching  = createSelector(selectCommonSearch, (state: SearchState): boolean => state ? state.isSearching : false);
export const selectSearchQuery  = createSelector(selectCommonSearch, (state: SearchState) => state?.searchQuery || searchInitState.searchQuery);
export const selectPlaceholder  = createSelector(selectCommonSearch, (state: SearchState): string => state ? state.placeholder : '');


