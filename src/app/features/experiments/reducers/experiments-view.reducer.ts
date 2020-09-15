import {ISmAction} from '../../../webapp-common/core/models/actions';
import {commonExperimentsInitialState, commonExperimentsViewReducer, ICommonExperimentsViewState} from '../../../webapp-common/experiments/reducers/common-experiments-view.reducer';
import * as commonActions from '../../../webapp-common/experiments/actions/common-experiments-view.actions';

export type IExperimentsViewState = ICommonExperimentsViewState;

export const initialState: IExperimentsViewState = {
  ...commonExperimentsInitialState,
};

export function experimentsViewReducer(state: IExperimentsViewState = initialState, action: ISmAction): IExperimentsViewState {

  switch (action.type) {
    case commonActions.RESET_EXPERIMENTS:
      return {...state, experiments: [], selectedExperiment: null, metricVariants: [], showAllSelectedIsActive: false};
    default:
      return <IExperimentsViewState>commonExperimentsViewReducer(state, action);
  }
}
