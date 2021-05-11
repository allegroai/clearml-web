import {commonExperimentsInitialState, commonExperimentsViewReducer, ICommonExperimentsViewState} from '../../../webapp-common/experiments/reducers/common-experiments-view.reducer';

export type IExperimentsViewState = ICommonExperimentsViewState;

export const initialState: IExperimentsViewState = {
  ...commonExperimentsInitialState,
};

export const experimentsViewReducer = commonExperimentsViewReducer;
