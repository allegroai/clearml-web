import {VIEW_ACTIONS} from '../../app.constants';
import {createSelector} from '@ngrx/store';
import {
  initViewState as commonInitState,
  viewReducer as commonViewReducer,
  ViewState as CommonViewState
} from '../../webapp-common/core/reducers/view-reducer';
import {dismissSurvey} from '../Actions/layout.actions';

interface ViewState extends CommonViewState {
  availableUpdates: string;
  showSurvey: boolean;
}
const initViewState = {
  ...commonInitState,
  availableUpdates  : null,
  showSurvey: true
};

export const views = state => state.views as ViewState;
export const selectAvailableUpdates   = createSelector(views, state => state.availableUpdates);
export const selectShowSurvey   = createSelector(views, state => state.showSurvey);

export function viewReducer(viewState: ViewState = initViewState, action) {

  switch (action.type) {
    case VIEW_ACTIONS.SET_SERVER_UPDATES_AVAILABLE:
      return {...viewState, availableUpdates: action.payload.availableUpdates};
    case dismissSurvey.type:
      return {...viewState, showSurvey: false};
    default:
      return commonViewReducer(viewState, action);
  }
}
