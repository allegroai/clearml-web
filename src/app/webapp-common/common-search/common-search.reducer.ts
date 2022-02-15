import {createFeatureSelector, createSelector} from '@ngrx/store';
import {COMMON_SEARCH_ACTIONS, setSearchQuery} from './common-search.actions';


export interface ICommonSearchState {
  isSearching: boolean;
  searchQuery: {query: string; regExp?: boolean};
  placeholder: string;
  active: boolean;
}

// Todo remove selectedProjectId
const commonSearchInitState: ICommonSearchState = {
  isSearching: false,
  searchQuery: null,
  placeholder: null,
  active     : false
};

export function commonSearchReducer<ActionReducer>(state: ICommonSearchState = commonSearchInitState, action): ICommonSearchState {

  switch (action.type) {
    case COMMON_SEARCH_ACTIONS.SET_IS_SEARCHING:
      return {...state, isSearching: action.payload};
    case setSearchQuery.type:
      return {...state, searchQuery: action as ReturnType<typeof setSearchQuery>};
    case COMMON_SEARCH_ACTIONS.SET_SEARCH_PLACEHOLDER:
      return {...state, placeholder: action.payload};
    case COMMON_SEARCH_ACTIONS.SET_SEARCH_ACTIVE:
      return {...state, active: action.payload};
    case COMMON_SEARCH_ACTIONS.INIT_SEARCH:
      return {
        ...state,
        isSearching: false,
        searchQuery: commonSearchInitState.searchQuery,
        placeholder: action.payload || 'Search',
        active     : false
      };
    case COMMON_SEARCH_ACTIONS.RESET_SEARCH:
      return {
        ...state,
        isSearching: false,
        searchQuery: commonSearchInitState.searchQuery,
        placeholder: 'Search',
        active     : false
      };
    default:
      return state;
  }
}

export const selectCommonSearch = createFeatureSelector<ICommonSearchState>('commonSearch');
export const selectIsSearching  = createSelector(selectCommonSearch, (state: ICommonSearchState): boolean => state ? state.isSearching : false);
export const selectSearchQuery  = createSelector(selectCommonSearch, (state: ICommonSearchState) => state?.searchQuery || commonSearchInitState.searchQuery);
export const selectPlaceholder  = createSelector(selectCommonSearch, (state: ICommonSearchState): string => state ? state.placeholder : '');
export const selectActiveSearch = createSelector(selectCommonSearch, (state: ICommonSearchState): boolean => state ? state.active : false);


