import {createAction, props} from '@ngrx/store';
import {UsageStatState} from '../reducers/usage-stats.reducer';

export const setUsageStats = createAction('user-stats SET_STATS',  props<UsageStatState>());
export const updateUsageStats = createAction('user-stats UPDATE_USAGE_STATS', props<{allowed: boolean}>());
