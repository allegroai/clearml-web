import * as actions from '../actions/common-experiments-info.actions';
import {IExperimentInfo, ISelectedExperiment} from '../../../features/experiments/shared/experiment-info.model';


export interface ICommonExperimentInfoState {
  selectedExperiment: ISelectedExperiment; // TODO: declare type.
  experimentLog: Array<any>;
  infoData: IExperimentInfo;
  errors: { [key: string]: any } | null;
}

export const initialCommonExperimentInfoState: ICommonExperimentInfoState = {
  selectedExperiment: null,
  experimentLog     : null,
  infoData          : null,
  errors            : {
    model    : null,
    execution: null,
  },
};

export function commonExperimentInfoReducer(state: ICommonExperimentInfoState = initialCommonExperimentInfoState, action): ICommonExperimentInfoState {

  switch (action.type) {
    case actions.RESET_EXPERIMENT_INFO:
      return {...state, infoData: null};
    case actions.SET_EXPERIMENT_INFO_DATA:
      return {...state, infoData: action.payload};
    case actions.UPDATE_EXPERIMENT_INFO_DATA:
      return {...state, selectedExperiment: {...state.selectedExperiment, ...action.payload.changes}};
    default:
      return state;
  }
}
