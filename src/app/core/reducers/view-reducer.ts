import {createSelector} from '@ngrx/store';
import {
  initViewState as commonInitState,
  viewReducer as commonViewReducer,
  ViewState as CommonViewState
} from '../../webapp-common/core/reducers/view-reducer';
import {dismissSurvey} from '../actions/layout.actions';
import {setServerUpdatesAvailable} from '@common/core/actions/layout.actions';

interface ViewState extends CommonViewState {
  availableUpdates: string;
  showSurvey: boolean;
}
const initViewState: ViewState = {
  ...commonInitState,
  availableUpdates  : null,
  showSurvey: true
};

export const views = state => state.views as ViewState;
export const selectAvailableUpdates   = createSelector(views, state => state.availableUpdates);
export const selectShowSurvey   = createSelector(views, state => state.showSurvey);

export function viewReducer(viewState: ViewState = initViewState, action) {

  switch (action.type) {
    case setServerUpdatesAvailable.type:
      return {...viewState, availableUpdates: (action as ReturnType<typeof setServerUpdatesAvailable>).availableUpdates};
    case dismissSurvey.type:
      return {...viewState, showSurvey: false};
    default:
      return commonViewReducer(viewState, action);
  }
}
