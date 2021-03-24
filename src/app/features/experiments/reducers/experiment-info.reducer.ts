import {commonExperimentInfoReducer, ICommonExperimentInfoState, initialCommonExperimentInfoState} from '../../../webapp-common/experiments/reducers/common-experiment-info.reducer';

export interface IExperimentInfoState extends ICommonExperimentInfoState {
  errors: { [key: string]: any } | null;
}

export const initialState: IExperimentInfoState = {
  ...initialCommonExperimentInfoState,
};

export function experimentInfoReducer(state: IExperimentInfoState = initialState, action): IExperimentInfoState {
  switch (action.type) {

    default:
      return commonExperimentInfoReducer(state, action) as IExperimentInfoState;
  }
}
