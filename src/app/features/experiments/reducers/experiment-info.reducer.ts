import {ACTIVATE_EDIT, ADD_CUSTOM_OUTPUT_LABEL, DEACTIVATE_EDIT, EXPERIMENT_CANCEL_EDIT, EXPERIMENT_DATA_UPDATED, EXPERIMENT_DETAILS_UPDATED, EXPERIMENT_SAVE, SET_EXPERIMENT_ERRORS, SET_EXPERIMENT_FORM_ERRORS, SET_EXPERIMENT_INFO_MODEL_DATA, SET_FREEZE_INFO, UPDATE_SECTION_KNOWLEDGE} from '../actions/experiments-info.actions';
import {IExperimentInfo} from '../shared/experiment-info.model';
import {experimentSections, experimentSectionsEnum} from '../shared/experiments.const';
import {get, set} from 'lodash/fp';
import {commonExperimentInfoReducer, ICommonExperimentInfoState, initialCommonExperimentInfoState} from '../../../webapp-common/experiments/reducers/common-experiment-info.reducer';
import * as actions from '../../../webapp-common/experiments/actions/common-experiments-info.actions';
import {SET_EXPERIMENT} from '../../../webapp-common/experiments/actions/common-experiments-info.actions';

export interface IExperimentInfoState extends ICommonExperimentInfoState {
  activeSectionEdit: string;
  saving: boolean;
  infoDataFreeze: IExperimentInfo;
  userKnowledge: Map<experimentSectionsEnum, boolean>;
  errors: { [key: string]: any } | null;
}

export const initialState: IExperimentInfoState = {
  ...initialCommonExperimentInfoState,
  activeSectionEdit       : null,
  saving                  : false,
  infoDataFreeze          : null,
  userKnowledge           : {
    [experimentSections.MODEL_INPUT]: false
  } as any,
  errors                  : {
    model    : null,
    execution: null,
  },
};

export function experimentInfoReducer(state: IExperimentInfoState = initialState, action): IExperimentInfoState {
  switch (action.type) {
    case SET_EXPERIMENT:
      return {...state, selectedExperiment: action.payload};
    case SET_EXPERIMENT_FORM_ERRORS:
      return {...state, errors: action.payload};
    case UPDATE_SECTION_KNOWLEDGE:
      return {...state, userKnowledge: {...state.userKnowledge, [action.payload]: true}};
    case SET_EXPERIMENT_INFO_MODEL_DATA:
      return {...state, infoData: {...state.infoData, model: {...state.infoData.model, ...action.payload}}};
    case EXPERIMENT_DATA_UPDATED:
      return {...state, infoData: {...state.infoData, ...action.payload.changes}};
    case EXPERIMENT_SAVE:
      return {...state, saving: true};
    case ACTIVATE_EDIT:
      return {...state, activeSectionEdit: action.payload, infoDataFreeze: state.infoData};
    case SET_FREEZE_INFO:
      return {...state, infoDataFreeze: state.infoData};
    case DEACTIVATE_EDIT:
      return {...state, activeSectionEdit: null};
    case EXPERIMENT_CANCEL_EDIT:
      return {...state, infoData: state.infoDataFreeze ? state.infoDataFreeze : state.infoData};
    case EXPERIMENT_DETAILS_UPDATED:
      return {...state, infoData: {...state.infoData, ...action.payload.changes}};
    case actions.EXPERIMENT_UPDATED_SUCCESSFULLY:
      return {...state, saving: false};
    case ADD_CUSTOM_OUTPUT_LABEL: {
      const modelLabels = get('model.input.labels', state.infoData) || {};
      const newModelLabels = {...modelLabels, [action.payload.label]: action.payload.value};
      return {
        ...state, infoData: {
          ...state.infoData,
          model: set('input.labels', newModelLabels, state.infoData.model),
        }
      };
    }
    case SET_EXPERIMENT_ERRORS:
      return {...state, errors: {...state.errors, ...action.payload}};
    default:
      return commonExperimentInfoReducer(state, action) as IExperimentInfoState;
  }
}
