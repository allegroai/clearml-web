import * as actions from '../actions/common-experiments-info.actions';
import {IExperimentInfo, ISelectedExperiment} from '../../../features/experiments/shared/experiment-info.model';


export interface ICommonExperimentInfoState {
  selectedExperiment: ISelectedExperiment;
  experimentLog: Array<any>;
  infoData: IExperimentInfo;
  errors: { [key: string]: any } | null;
  showExtraDataSpinner: boolean;
}

export const initialCommonExperimentInfoState: ICommonExperimentInfoState = {
  selectedExperiment: null,
  experimentLog     : null,
  infoData          : null,
  errors            : {
    model    : null,
    execution: null,
  },
  showExtraDataSpinner: false
};

export function commonExperimentInfoReducer(state: ICommonExperimentInfoState = initialCommonExperimentInfoState, action): ICommonExperimentInfoState {

  switch (action.type) {
    case actions.RESET_EXPERIMENT_INFO:
      return {...state, infoData: null};
    case actions.SET_EXPERIMENT_INFO_DATA:
      return {...state, infoData: {
        ...action.payload,
        configuration: state.infoData?.configuration,
        execution: {...action.payload?.execution, diff: state.infoData?.execution?.diff}
      }};
    case actions.UPDATE_EXPERIMENT_INFO_DATA:
      return {...state, selectedExperiment: {...state.selectedExperiment, ...action.payload.changes}, infoData:{...state.infoData, ...action.payload.changes}};
    case actions.getExperimentUncommittedChanges.type:
      return {...state, showExtraDataSpinner: true};
    case actions.setExperimentUncommittedChanges.type:
      return {...state, showExtraDataSpinner: false, infoData: {...state?.infoData, execution: {...state?.infoData?.execution, diff: action.diff}}};
    default:
      return state;
  }
}
