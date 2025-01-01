import {createReducer, on} from '@ngrx/store';
import {CredentialsSettingsActions} from './settings.actions';
import {StorageGetSettingsResponse} from '~/business-logic/model/storage/storageGetSettingsResponse';

export const settingsFeatureKey = 'settings';

export interface SettingsState {
  credentials: StorageGetSettingsResponse;
}


export const initialState: SettingsState = {
  credentials: null
};

export const settingsReducers = createReducer(
  initialState,
  on(CredentialsSettingsActions.setCredentials, (state, {credentials}): SettingsState => ({
    ...state, credentials
  })),
);
