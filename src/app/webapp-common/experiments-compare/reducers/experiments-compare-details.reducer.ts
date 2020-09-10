import {resetState, setExperiments} from '../actions/experiments-compare-details.actions';
import {IExperimentDetail} from '../../../features/experiments-compare/experiments-compare-models';
import {createReducer, on} from '@ngrx/store';

export interface ExperimentCompareDetailsState {
  experiments: Array<IExperimentDetail>;
}

export const initialState: ExperimentCompareDetailsState = {
  experiments  : []
};

const _experimentsCompareDetailsReducer = createReducer(initialState,
  on(setExperiments, (state: ExperimentCompareDetailsState, {experiments}) => ({...state, experiments: experiments})),
  on(resetState, (state: ExperimentCompareDetailsState) => ({...initialState}))
);

export function experimentsCompareDetailsReducer(state, action) {
  return _experimentsCompareDetailsReducer(state, action);
}


