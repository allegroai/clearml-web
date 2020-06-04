import {Action, createAction, props} from '@ngrx/store';

export interface ColorPreference {
  [key: string]: Array<[string, string, string]>;
}

export interface ColorPickerProps {
  top: number;
  left: number;
  theme: string;
  defaultColor: string;
  cacheKey: string;
}

export const CHOOSE_COLOR_PREFIX          = 'CHOOSE_COLOR_';

export const addUpdateColorPreferences = createAction(
  CHOOSE_COLOR_PREFIX + 'ADD_UPDATE_COLOR_PREFERENCES',
  props<ColorPreference>()
);

export const showColorPicker = createAction(
  CHOOSE_COLOR_PREFIX + 'SHOW_PICKER',
  props<ColorPickerProps>()
);
