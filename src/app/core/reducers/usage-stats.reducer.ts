import {Action, createReducer, on, createSelector} from '@ngrx/store';
import {setUsageStats} from '../actions/usage-stats.actions';


export const userStatsFeatureKey = 'userStats';

export interface UsageStatState {
  allowed: boolean;
  currVersion: string;
  allowedVersion: string;
}


export const initialState: UsageStatState = {
  allowed: null,
  currVersion: '',
  allowedVersion: ''
};

const _statsReducer = createReducer(initialState,
  on(setUsageStats, (state: UsageStatState, newState) => ({...state, ...newState}))
);

export function usageStatsReducer(state = initialState, action: Action): UsageStatState {
  return _statsReducer(state, action);
}

export const selectSendStats = state => state[userStatsFeatureKey];

export const selectAllowed = createSelector(selectSendStats, (state: UsageStatState) => state.allowed);
export const selectCurrentVersion = createSelector(selectSendStats, (state: UsageStatState) => state.currVersion);
export const selectAllowedVersion = createSelector(selectSendStats, (state: UsageStatState) => state.allowedVersion);
export const selectPromptUser = createSelector(
  selectCurrentVersion,
  selectAllowedVersion,
  selectAllowed,
  (currentVer: string, allowedVer: string, allowed: boolean) => !allowed && currentVer !== allowedVer
);
