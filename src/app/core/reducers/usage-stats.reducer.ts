import {createReducer, on, createSelector} from '@ngrx/store';
import {setUsageStats} from '../actions/usage-stats.actions';


export const userStatsFeatureKey = 'userStats';

export interface UsageStatState {
  supported: boolean;
  allowed: boolean;
  currVersion: string;
  allowedVersion: string;
}


export const initialState: UsageStatState = {
  supported: null,
  allowed: null,
  currVersion: '',
  allowedVersion: ''
};

export const usageStatsReducer  = createReducer(
  initialState,
  on(setUsageStats, (state: UsageStatState, newState) => ({...state, ...newState}))
);

export const selectSendStats = state => state[userStatsFeatureKey] as UsageStatState;

export const selectStatsSupported = createSelector(selectSendStats, (state) => state.supported);
export const selectAllowed = createSelector(selectSendStats, (state) => state?.allowed);
export const selectCurrentVersion = createSelector(selectSendStats, (state) => state?.currVersion);
export const selectAllowedVersion = createSelector(selectSendStats, (state) => state?.allowedVersion);
export const selectPromptUser = createSelector(
  selectCurrentVersion,
  selectAllowedVersion,
  selectAllowed,
  (currentVer, allowedVer, allowed) => !allowed && currentVer !== allowedVer
);
