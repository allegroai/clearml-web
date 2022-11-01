import {resetState, setExperiments} from '../actions/experiments-compare-details.actions';
import {IExperimentDetail} from '~/features/experiments-compare/experiments-compare-models';
import {createReducer, on} from '@ngrx/store';

export interface ExperimentCompareDetailsState {
  experiments: Array<IExperimentDetail>;
}

export const initialState: ExperimentCompareDetailsState = {
  experiments  : []
};

export const experimentsCompareDetailsReducer = createReducer(initialState,
  on(setExperiments, (state: ExperimentCompareDetailsState, {experiments}) => ({...state, experiments})),
  on(resetState, () => ({...initialState}))
);
