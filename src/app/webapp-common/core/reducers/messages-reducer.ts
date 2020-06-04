import {VIEW_ACTIONS} from '../../../app.constants';

const initialState = {
  visible: false,
  severity: null,
  message: null
};


export function messagesReducer(state = initialState, action) {

  switch (action.type) {
    case VIEW_ACTIONS.ADD_MESSAGE:
      return {
        visible: true,
        severity: action.payload.severity,
        message : action.payload.msg
      };
    case VIEW_ACTIONS.REMOVE_MESSAGE:
      return {
        visible: false
      };
    default:
      return state;
  }
}
