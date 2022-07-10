import {createAction, props} from '@ngrx/store';
import {SearchState} from '@common/common-search/common-search.reducer';

const COMMON_SEARCH_PREFIX = 'CommonSearch_';

export const setSearching = createAction(
  COMMON_SEARCH_PREFIX + 'SET_IS_SEARCHING',
  props<{payload: boolean}>()
);

export const setSearchQuery = createAction(
  COMMON_SEARCH_PREFIX + 'SET_SEARCH_QUERY',
  props<SearchState['searchQuery']>()
);

export const resetSearch = createAction(COMMON_SEARCH_PREFIX + 'RESET_SEARCH');
export const initSearch = createAction(
  COMMON_SEARCH_PREFIX + 'INIT_SEARCH',
  props<{payload: string}>()
);
