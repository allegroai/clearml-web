import { createReducer, on } from '@ngrx/store';
import {showStatsErrorNotice, hideNoStatsNotice} from '../actions/stats.actions';

export interface StatsState {
  showNoStatsNotice: boolean;
}
export const initialState: StatsState = {
  showNoStatsNotice: false
};

const _statsReducer = createReducer(initialState,
  on(showStatsErrorNotice, (state: StatsState) => ({...state, showNoStatsNotice: true})),
  on(hideNoStatsNotice, (state: StatsState) => ({...state, showNoStatsNotice: false}))
);

export function statsReducer(state, action) {
  return _statsReducer(state, action);
}
