import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {SMSharedModule} from '../shared/shared.module';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {SelectModelComponent} from './select-model.component';
import {selectModelReducer} from './select-model.reducer';
import {SelectModelEffects} from './select-model.effects';
import {ModelSharedModule} from '../models/shared/model-shared.module';

@NgModule({
  imports        : [
    CommonModule,
    SMSharedModule,
    ModelSharedModule,
    EffectsModule.forFeature([SelectModelEffects]),
    StoreModule.forFeature('selectModel', selectModelReducer)
  ],
  providers      : [],
  declarations   : [SelectModelComponent],
  exports        : [SelectModelComponent]
})
export class SelectModelModule {
}
