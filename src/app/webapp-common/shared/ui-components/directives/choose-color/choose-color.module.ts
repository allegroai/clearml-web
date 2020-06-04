import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ChooseColorDirective} from './choose-color.directive';
import {ColorPickerWrapperComponent} from '../../inputs/color-picker/color-picker-wrapper.component';
import {ColorPickerModule} from 'ngx-color-picker';
import {SMPortalModule} from '../../../portal/portal.module';
import {ActionReducer, StoreModule} from '@ngrx/store';
import {createLocalStorageReducer} from '../../../../core/meta-reducers/local-storage-reducer';
import {colorPreferenceReducer} from './choose-color.reducer';
import {CHOOSE_COLOR_PREFIX} from './choose-color.actions';


const syncedKeys    = [
  'colorPreferences',
];
const key           = 'colorsPreference';
const actionsPrefix = [CHOOSE_COLOR_PREFIX];
const reducers      = colorPreferenceReducer;

export function localStorageReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return createLocalStorageReducer(key, syncedKeys, actionsPrefix)(reducer);
}

const _declarations = [
  ChooseColorDirective,
  ColorPickerWrapperComponent
];

@NgModule({
  providers      : [ChooseColorDirective],
  declarations   : _declarations,
  imports        : [
    CommonModule,
    ColorPickerModule,
    SMPortalModule,
    StoreModule.forFeature(key, reducers, {metaReducers: [localStorageReducer]}),
  ],
  exports        : _declarations
})
export class ChooseColorModule {
}
