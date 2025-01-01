import * as actions from '../actions/layout.actions';

const initialState = {
  visible: false,
  severity: null,
  message: null
};


export function messagesReducer(state = initialState, action) {

  switch (action.type) {
    case actions.addMessage:
      return {
        visible: true,
        severity: action.payload.severity,
        message : action.payload.msg
      };
    case actions.removeMessage:
      return {
        visible: false
      };
    default:
      return state;
  }
}
