import {createFeatureSelector, createReducer, createSelector, on} from '@ngrx/store';
import {initSearch, resetSearch, setSearching, setSearchQuery} from './common-search.actions';


export interface SearchState {
  isSearching: boolean;
  searchQuery: {query: string; regExp?: boolean; original?: string};
  placeholder: string;
  active: boolean;
  initiated: boolean;
}

const searchInitState: SearchState = {
  isSearching: false,
  searchQuery: null,
  placeholder: null,
  active     : false,
  initiated  : false
};

export const searchReducer = createReducer(
  searchInitState,
  on(setSearching, (state, action): SearchState => ({...state, isSearching: action.payload})),
  on(setSearchQuery, (state, action): SearchState => ({...state, searchQuery: action})),
  on(initSearch, (state, action): SearchState => ({
    ...state,
    placeholder: action.payload || 'Search',
    initiated: true
  })),
  on(resetSearch, (): SearchState => ({...searchInitState, placeholder: 'Search'})),
);

export const selectCommonSearch = createFeatureSelector<SearchState>('commonSearch');
export const selectIsSearching  = createSelector(selectCommonSearch, (state: SearchState): boolean => state ? state.isSearching : false);
export const selectSearchQuery  = createSelector(selectCommonSearch, (state: SearchState) => state ? state.searchQuery : searchInitState.searchQuery);
export const selectPlaceholder  = createSelector(selectCommonSearch, (state: SearchState) => state ? state.placeholder : '');


