import {createFeatureSelector, createSelector} from '@ngrx/store';
import {settingsFeatureKey, SettingsState} from './settings.reducer';

export const selectSettingsState = createFeatureSelector<SettingsState>(settingsFeatureKey);
export const selectCredentials = createSelector(selectSettingsState, state => state.credentials);
