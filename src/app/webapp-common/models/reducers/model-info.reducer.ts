import {ACTIVATE_MODEL_EDIT, EDIT_MODEL, GET_MODEL_INFO, MODEL_CANCEL_EDIT, MODEL_DETAILS_UPDATED, SET_IS_MODEL_SAVING, SET_MODEL} from '../actions/models-info.actions';
import {SelectedModel, TableModel} from '../shared/models.model';
import {cloneDeep} from 'lodash/fp';

export interface ModelInfoState {
  selectedModel: TableModel;
  activeSectionEdit: string;
  infoDataFreeze: any;
  saving: boolean;
}

const initialState: ModelInfoState = {
  selectedModel: null,
  activeSectionEdit: null,
  infoDataFreeze: null,
  saving: false,
};

export function modelsInfoReducer(state: ModelInfoState = initialState, action): ModelInfoState {

  switch (action.type) {
    case GET_MODEL_INFO:
      return {...state, selectedModel: null};
    case SET_MODEL:
      return {...state, selectedModel: action.payload};
    case MODEL_DETAILS_UPDATED: {
      const newSelectedModel = {...state.selectedModel, ...action.payload.changes};
      return {...state, selectedModel: newSelectedModel};
    }
    case ACTIVATE_MODEL_EDIT:
      return {...state, activeSectionEdit: action.payload, infoDataFreeze: state.selectedModel};
    case MODEL_CANCEL_EDIT:
      return {...state, selectedModel: state.infoDataFreeze ? cloneDeep(state.infoDataFreeze) : state.selectedModel, activeSectionEdit: null};
    case SET_IS_MODEL_SAVING:
      return {...state, saving: action.payload};
    case EDIT_MODEL:
      return {...state, activeSectionEdit: null};
    default:
      return state;
  }
}

