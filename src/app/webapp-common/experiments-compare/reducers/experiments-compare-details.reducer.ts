import {resetState, setExperiments, setModels} from '../actions/experiments-compare-details.actions';
import {IExperimentDetail} from '~/features/experiments-compare/experiments-compare-models';
import {createReducer, on} from '@ngrx/store';
import {ModelDetail} from '@common/experiments-compare/shared/experiments-compare-details.model';

export interface ExperimentCompareDetailsState {
  experiments: Array<IExperimentDetail>;
  models: Array<ModelDetail>;
}

export const initialState: ExperimentCompareDetailsState = {
  experiments: [],
  models: []
};

export const experimentsCompareDetailsReducer = createReducer(initialState,
  on(setExperiments, (state: ExperimentCompareDetailsState, {experiments}) => ({...state, experiments})),
  on(setModels, (state: ExperimentCompareDetailsState, {models}) => ({...state, models})),
  on(resetState, () => ({...initialState}))
);
