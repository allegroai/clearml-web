import {Action, createReducer, createSelector, on} from '@ngrx/store';
import {addUpdateColorPreferences, ColorPickerProps, ColorPreference, showColorPicker} from './choose-color.actions';

export interface ColorPreferenceState {
  colorPreferences: ColorPreference;
  pickerProps: ColorPickerProps;
}

export const initialState: ColorPreferenceState = {
  colorPreferences: null,
  pickerProps: null
};

export const colors = state => state.colorsPreference as ColorPreferenceState;
export const selectColorPreferences = createSelector(colors, state => state.colorPreferences);
export const selectColorPickerProps = createSelector(colors, state => state.pickerProps);

const reducer = createReducer(
  initialState,
  on(addUpdateColorPreferences, (state, action) => ({...state, colorPreferences: {...state.colorPreferences, ...action}})),
  on(showColorPicker, (state , action) => ({...state, pickerProps: action}))
);

export function colorPreferenceReducer(state: ColorPreferenceState | undefined, action: Action) {
  return reducer(state, action);
}
