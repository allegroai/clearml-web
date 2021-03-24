import {ExperimentParams} from '../shared/experiments-compare-details.model';
import {resetState, setExperiments} from '../actions/experiments-compare-params.actions';
import {createReducer, on} from '@ngrx/store';

export interface ExperimentCompareParamsState {
  experiments: Array<ExperimentParams>;
}

export const initialState: ExperimentCompareParamsState = {
  experiments: []
};



const _experimentsCompareParamsReducer = createReducer(initialState,
  on(setExperiments, (state: ExperimentCompareParamsState, {experiments}) => ({...state, experiments: experiments})),
  on(resetState, (state: ExperimentCompareParamsState) => ({...initialState}))
);

export function experimentsCompareParamsReducer(state, action) {
  return _experimentsCompareParamsReducer(state, action);
}


