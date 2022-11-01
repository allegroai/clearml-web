import {ExperimentParams} from '../shared/experiments-compare-details.model';
import {resetState, setExperiments} from '../actions/experiments-compare-params.actions';
import {createReducer, on} from '@ngrx/store';

export interface ExperimentCompareParamsState {
  experiments: Array<ExperimentParams>;
}

export const initialState: ExperimentCompareParamsState = {
  experiments: []
};



export const experimentsCompareParamsReducer = createReducer(initialState,
  on(setExperiments, (state: ExperimentCompareParamsState, {experiments}) => ({...state, experiments})),
  on(resetState, () => ({...initialState}))
);
