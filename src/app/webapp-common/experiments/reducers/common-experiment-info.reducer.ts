import * as actions from '../actions/common-experiments-info.actions';
import {IExperimentInfo} from '../../../features/experiments/shared/experiment-info.model';
import {experimentSections, experimentSectionsEnum} from '../../../features/experiments/shared/experiments.const';
import {
  ACTIVATE_EDIT, DEACTIVATE_EDIT, deleteHyperParamsSection, EXPERIMENT_CANCEL_EDIT, EXPERIMENT_DATA_UPDATED, EXPERIMENT_DETAILS_UPDATED, EXPERIMENT_SAVE, hyperParamsSectionUpdated,
  saveExperimentConfigObj, saveExperimentSection, saveHyperParamsSection, SET_EXPERIMENT, SET_EXPERIMENT_ERRORS, SET_EXPERIMENT_FORM_ERRORS, setExperimentSaving, updateExperimentAtPath
} from '../actions/common-experiments-info.actions';
import {set} from 'lodash/fp';


export interface ICommonExperimentInfoState {
  selectedExperiment: IExperimentInfo;
  experimentLog: Array<any>;
  infoData: IExperimentInfo;
  errors: { [key: string]: any } | null;
  showExtraDataSpinner: boolean;
  activeSectionEdit: boolean;
  saving: boolean;
  currentActiveSectionEdit: string;
  infoDataFreeze: IExperimentInfo;
  userKnowledge: Map<experimentSectionsEnum, boolean>;
}

export const initialCommonExperimentInfoState: ICommonExperimentInfoState = {
  selectedExperiment: null,
  experimentLog     : null,
  infoData          : null,
  errors            : {
    model    : null,
    execution: null,
  },
  showExtraDataSpinner: false,
  activeSectionEdit: false,
  saving           : false,
  currentActiveSectionEdit: null,
  infoDataFreeze   : null,
  userKnowledge    : {
    [experimentSections.MODEL_INPUT]: false
  } as any,
};

export function commonExperimentInfoReducer(state: ICommonExperimentInfoState = initialCommonExperimentInfoState, action): ICommonExperimentInfoState {

  switch (action.type) {
    case SET_EXPERIMENT:
      return {...state, selectedExperiment: action.payload};
    case SET_EXPERIMENT_FORM_ERRORS:
      return {...state, errors: action.payload};
    case EXPERIMENT_DATA_UPDATED:
      return {...state, infoData: {...state.infoData, ...action.payload.changes}};
    case hyperParamsSectionUpdated.type:
      return {...state, infoData: {...state.infoData, hyperparams: {...state.infoData.hyperparams, [action.section]: action.hyperparams}}};

    case EXPERIMENT_SAVE:
    case saveHyperParamsSection.type:
    case saveExperimentConfigObj.type:
    case deleteHyperParamsSection.type:
    case saveExperimentSection.type:
      return {...state, saving: true};
    case ACTIVATE_EDIT:
      return {...state, activeSectionEdit: true, infoDataFreeze: state.infoData, currentActiveSectionEdit: action.payload};
    case DEACTIVATE_EDIT:
      return {...state, activeSectionEdit: false, currentActiveSectionEdit: null};
    case EXPERIMENT_CANCEL_EDIT:
      return {...state, infoData: state.infoDataFreeze ? state.infoDataFreeze : state.infoData, currentActiveSectionEdit: null};
    case EXPERIMENT_DETAILS_UPDATED:
      return {...state, infoData: {...state.infoData, ...action.payload.changes}};
    case setExperimentSaving.type:
      return {...state, saving: action.saving};
    case updateExperimentAtPath.type: {
      const payload = action as ReturnType<typeof updateExperimentAtPath>;
      const newInfoData = set(payload.path, payload.value, state.infoData);
      return {...state, infoData: newInfoData as any};
    }
    // case actions.EXPERIMENT_UPDATED_SUCCESSFULLY:
    //   return {...state, saving: false};
    case SET_EXPERIMENT_ERRORS:
      return {...state, errors: {...state.errors, ...action.payload}};
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
      return {...state, showExtraDataSpinner: !(action as ReturnType<typeof actions.getExperimentUncommittedChanges>).autoRefresh};
    case actions.setExperimentUncommittedChanges.type:
      return {...state, showExtraDataSpinner: false, infoData: {...state?.infoData, execution: {...state?.infoData?.execution, diff: action.diff}}};
    default:
      return state;
  }
}
