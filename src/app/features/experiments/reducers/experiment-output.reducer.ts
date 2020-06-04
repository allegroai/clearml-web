import {commonExperimentOutputReducer, CommonExperimentOutputState, initialCommonExperimentOutputState} from '../../../webapp-common/experiments/reducers/common-experiment-output.reducer';

export type ExperimentOutputState = CommonExperimentOutputState;

export const initialState: ExperimentOutputState = {
  ...initialCommonExperimentOutputState
};

export function experimentOutputReducer(state = initialState, action): ExperimentOutputState {
  return commonExperimentOutputReducer(state as CommonExperimentOutputState, action) as ExperimentOutputState;
}
