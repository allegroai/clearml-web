import {ExperimentParams} from '../shared/experiments-compare-details.model';
import {paramsActions} from '../actions/experiments-compare-params.actions';
import {createReducer, on} from '@ngrx/store';

export interface CompareParamsState {
  experiments: Array<ExperimentParams>;
  viewMode: {[page: string]: string}
}

export const initialState: CompareParamsState = {
  experiments: [],
  viewMode: {'hyper-params': 'values', scalars: 'graph'}
};



export const experimentsCompareParamsReducer = createReducer(initialState,
  on(paramsActions.setExperiments, (state, {experiments}): CompareParamsState =>
      ({...state, experiments})),
  on(paramsActions.resetState, (state): CompareParamsState =>
      ({...state, experiments: initialState.experiments})),
  on(paramsActions.setView, (state, action): CompareParamsState =>
      ({...state, viewMode: {...state.viewMode, [action.primary]: action.secondary}}))
);
