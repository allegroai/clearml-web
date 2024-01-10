import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ChooseColorDirective} from './choose-color.directive';
import {ColorPickerWrapperComponent} from '../../inputs/color-picker/color-picker-wrapper.component';
import {ColorPickerModule} from 'ngx-color-picker';
import {StoreModule} from '@ngrx/store';
import {colorPreferenceReducer} from './choose-color.reducer';


export const colorSyncedKeys    = [
  'colorPreferences',
];

const _declarations = [
  ChooseColorDirective,
  ColorPickerWrapperComponent
];

@NgModule({
  providers      : [
    ChooseColorDirective,
  ],
  declarations   : _declarations,
  imports        : [
    CommonModule,
    ColorPickerModule,
    StoreModule.forFeature('colorsPreference', colorPreferenceReducer),
  ],
  exports        : _declarations
})
export class ChooseColorModule {
}
