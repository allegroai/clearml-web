import {Action, createAction, props} from '@ngrx/store';

const COMMON_SEARCH_PREFIX = 'CommonSearch_';

export const COMMON_SEARCH_ACTIONS = {
  SET_IS_SEARCHING      : COMMON_SEARCH_PREFIX + 'SET_IS_SEARCHING',
  RESET_SEARCH          : COMMON_SEARCH_PREFIX + 'RESET_SEARCH',
  INIT_SEARCH           : COMMON_SEARCH_PREFIX + 'INIT_SEARCH',
  SET_SEARCH_QUERY      : COMMON_SEARCH_PREFIX + 'SET_SEARCH_QUERY',
  SET_SEARCH_PLACEHOLDER: COMMON_SEARCH_PREFIX + 'SET_SEARCH_PLACEHOLDER',
  SET_SEARCH_ACTIVE     : COMMON_SEARCH_PREFIX + 'SET_SEARCH_ACTIVE',
};

export class SetIsSearching implements Action {
  readonly type = COMMON_SEARCH_ACTIONS.SET_IS_SEARCHING;

  constructor(public payload: boolean) {

  }
}

export class SetSearchActive implements Action {
  readonly type = COMMON_SEARCH_ACTIONS.SET_SEARCH_ACTIVE;

  constructor(public payload: boolean) {
  }
}

export const setSearchQuery = createAction(
  COMMON_SEARCH_ACTIONS.SET_SEARCH_QUERY,
  props<{query: string; regExp?: boolean}>()
);

export class SetSearchPlaceholder implements Action {
  readonly type = COMMON_SEARCH_ACTIONS.SET_SEARCH_PLACEHOLDER;

  constructor(public payload: string) {
  }
}

export class ResetSearch implements Action {
  readonly type = COMMON_SEARCH_ACTIONS.RESET_SEARCH;

  constructor() {
  }
}

export class InitSearch implements Action {
  readonly type = COMMON_SEARCH_ACTIONS.INIT_SEARCH;

  constructor(public payload: string) {
  }
}
