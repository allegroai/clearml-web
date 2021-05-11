import {createAction, props} from '@ngrx/store';
import {Task} from '../../../business-logic/model/tasks/task';
import {Params} from '@angular/router';

export const EXPERIMENTS_COMPARE_SELECT_EXPERIMENT_ = 'EXPERIMENTS_COMPARE_SELECT_EXPERIMENT_';

export const SEARCH_EXPERIMENTS_FOR_COMPARE = EXPERIMENTS_COMPARE_SELECT_EXPERIMENT_ + 'SEARCH_EXPERIMENTS_FOR_COMPARE';
export const SET_SHOW_SEARCH_EXPERIMENTS_FOR_COMPARE = EXPERIMENTS_COMPARE_SELECT_EXPERIMENT_ + 'SET_SHOW_SEARCH_EXPERIMENTS_FOR_COMPARE';
export const SET_SELECT_EXPERIMENTS_FOR_COMPARE = EXPERIMENTS_COMPARE_SELECT_EXPERIMENT_ + 'SET_SELECT_EXPERIMENTS_FOR_COMPARE';
export const RESET_SELECT_EXPERIMENT_FOR_COMPARE = EXPERIMENTS_COMPARE_SELECT_EXPERIMENT_ + 'RESET_SELECT_EXPERIMENT_FOR_COMPARE';
export const TOGGLE_SHOW_SACLARS_OPTIONS = EXPERIMENTS_COMPARE_SELECT_EXPERIMENT_ + 'TOGGLE_SHOW_SACLARS_OPTIONS';
export const SET_HIDE_IDENTICAL_ROWS = EXPERIMENTS_COMPARE_SELECT_EXPERIMENT_ + 'SET_HIDE_IDENTICAL_ROWS';
export const SET_REFRESHING = EXPERIMENTS_COMPARE_SELECT_EXPERIMENT_ + 'SET_REFRESHING';
export const SET_EXPERIMENTS_UPDATE_TIME = EXPERIMENTS_COMPARE_SELECT_EXPERIMENT_ + 'SET_EXPERIMENTS_UPDATE_TIME';
export const REFRESH_IF_NEEDED = EXPERIMENTS_COMPARE_SELECT_EXPERIMENT_ + 'REFRESH_IF_NEEDED';
export const REFETCH_EXPERIMENT_REQUESTED = EXPERIMENTS_COMPARE_SELECT_EXPERIMENT_ + 'REFETCH_EXPERIMENT_REQUESTED';
export const SET_NAVIGATION_PREFERENCES = EXPERIMENTS_COMPARE_SELECT_EXPERIMENT_ + 'SET_NAVIGATION_PREFERENCES';


export const setHideIdenticalFields = createAction(SET_HIDE_IDENTICAL_ROWS, props<{payload: boolean}>());
export const setRefreshing = createAction(SET_REFRESHING, props<{ payload: boolean; autoRefresh?: boolean }>());
export const setExperimentsUpdateTime = createAction(SET_EXPERIMENTS_UPDATE_TIME, props<{ payload: {[key: string]: Date}}>());
export const refreshIfNeeded = createAction(REFRESH_IF_NEEDED, props<{ payload: boolean; autoRefresh?: boolean }>());
export const toggleShowScalarOptions = createAction(TOGGLE_SHOW_SACLARS_OPTIONS);
export const setSearchExperimentsForCompareResults = createAction(SET_SELECT_EXPERIMENTS_FOR_COMPARE, props<{ payload: Array<Task> }>());
export const setShowSearchExperimentsForCompare = createAction(SET_SHOW_SEARCH_EXPERIMENTS_FOR_COMPARE, props<{ payload: boolean }>());
export const resetSelectCompareHeader = createAction(RESET_SELECT_EXPERIMENT_FOR_COMPARE);
export const searchExperimentsForCompare = createAction(SEARCH_EXPERIMENTS_FOR_COMPARE, props<{ payload: string }>());
export const refetchExperimentRequested = createAction(REFETCH_EXPERIMENT_REQUESTED, props<{ autoRefresh: boolean }>());
export const setNavigationPreferences = createAction(SET_NAVIGATION_PREFERENCES, props<{ navigationPreferences: Params }>());
