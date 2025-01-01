import {ActionCreator, createReducer, createSelector, on, ReducerTypes} from '@ngrx/store';
import {
  initViewState as commonInitState,
  viewReducers,
  ViewState as CommonViewState
} from '@common/core/reducers/view.reducer';
import {dismissSurvey} from '../actions/layout.actions';
import {setServerUpdatesAvailable} from '@common/core/actions/layout.actions';
import {selectRouterConfig} from '@common/core/reducers/router-reducer';
import {routeConfToProjectType} from '~/features/projects/projects-page.utils';

interface ViewState extends CommonViewState {
  availableUpdates: string;
  showSurvey: boolean;
}
const initViewState: ViewState = {
  ...commonInitState,
  availableUpdates  : null,
  showSurvey: true,
};

export const views = state => state.views as ViewState;
export const selectAvailableUpdates   = createSelector(views, state => state.availableUpdates);
export const selectShowSurvey   = createSelector(views, state => state.showSurvey);
export const selectUserSettingsNotificationPath = createSelector(views, (state) => '');
export const selectActiveWorkspaceReady = createSelector(views, (state) => true);
export const selectProjectType = createSelector(selectRouterConfig,
  config => (config && routeConfToProjectType(config)) ?? 'datasets');

export const viewReducer = createReducer(
  initViewState,
  on(setServerUpdatesAvailable, (state, action): ViewState =>
    ({...state, availableUpdates: action.availableUpdates})),
  on(dismissSurvey, (state): ViewState =>
    ({...state, showSurvey: false})),
  ...viewReducers as unknown as ReducerTypes<ViewState, ActionCreator[]>[]
);
