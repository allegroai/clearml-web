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

export const usageStatsReducer = (state = initialState, action: Action) =>  _statsReducer(state, action);

export const selectSendStats = state => state.userStatsFeatureKey;

export const selectAllowed = createSelector(selectSendStats, (state) => state?.allowed);
export const selectCurrentVersion = createSelector(selectSendStats, (state) => state?.currVersion);
export const selectAllowedVersion = createSelector(selectSendStats, (state) => state?.allowedVersion);
export const selectPromptUser = createSelector(
  selectCurrentVersion,
  selectAllowedVersion,
  selectAllowed,
  (currentVer, allowedVer, allowed) => !allowed && currentVer !== allowedVer
);
