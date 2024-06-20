import { createReducer, on } from '@ngrx/store';
import {showStatsErrorNotice, hideNoStatsNotice} from '../actions/stats.actions';

export interface StatsState {
  showNoStatsNotice: boolean;
}
export const initialState: StatsState = {
  showNoStatsNotice: false
};

export const statsReducer = createReducer(initialState,
  on(showStatsErrorNotice, (state: StatsState): StatsState => ({...state, showNoStatsNotice: true})),
  on(hideNoStatsNotice, (state: StatsState): StatsState => ({...state, showNoStatsNotice: false}))
);
